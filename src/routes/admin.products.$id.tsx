import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { AdminHeader } from "./admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import {
  getProduct,
  listCategories,
  saveProduct,
} from "@/lib/api";

import { useAuth } from "@/lib/auth";
import type { Product, ProductVariant } from "@/lib/types";

export const Route = createFileRoute("/admin/products/$id")({
  component: Editor,
});

/* =========================================================
   DEFAULT PRODUCT
========================================================= */

const blank: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  price: 0,
  images: [],
  variants: [],
  fabric: "",
  careInstructions: "",
  productType: "BUY_ONLINE",
  featured: false,
  newArrival: true,
  bestSeller: false,
  active: true,
  tags: [],
};

/* =========================================================
   SLUG HELPER
========================================================= */

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* =========================================================
   IMPORTANT:
   FIELD WRAPPER MUST BE OUTSIDE EDITOR

   Do NOT move this inside Editor().
   If it is inside Editor, React creates a new component
   on every keystroke and the input loses focus.
========================================================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/* =========================================================
   EDITOR
========================================================= */

function Editor() {
  const { id } = Route.useParams();
  const isNew = id === "new";

  const nav = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const { data: cats = [] } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: () => listCategories(true),
  });

  /* =======================================================
     EXISTING PRODUCT
  ======================================================= */

  const existing = useQuery({
    queryKey: ["product-admin", id],
    queryFn: () => getProduct(id),
    enabled: !isNew,
  });

  /* =======================================================
     FORM STATE

     Fresh object for every new product.
  ======================================================= */

  const [p, setP] = useState(() => ({
    ...blank,
    images: [...blank.images],
    variants: [...blank.variants],
    tags: [...blank.tags],
  }));

  const [busy, setBusy] = useState(false);

  /* =======================================================
     LOAD EXISTING PRODUCT

     Only runs when editing an existing product.
  ======================================================= */

  useEffect(() => {
    if (!isNew && existing.data) {
      setP({
        ...existing.data,
        images: [...(existing.data.images ?? [])],
        variants: [...(existing.data.variants ?? [])],
        tags: [...(existing.data.tags ?? [])],
      });
    }
  }, [isNew, existing.data]);

  /* =======================================================
     GENERIC STATE UPDATE

     Functional update prevents stale state problems.
  ======================================================= */

  const set = <K extends keyof typeof p>(
    key: K,
    value: (typeof p)[K],
  ) => {
    setP((current) => ({
      ...current,
      [key]: value,
    }));
  };

  /* =======================================================
     VARIANT UPDATE
  ======================================================= */

  const setVar = (
    index: number,
    patch: Partial<ProductVariant>,
  ) => {
    setP((current) => ({
      ...current,
      variants: current.variants.map((variant, i) =>
        i === index
          ? {
              ...variant,
              ...patch,
            }
          : variant,
      ),
    }));
  };

  /* =======================================================
     IMAGE URL MANAGEMENT
  ======================================================= */

  const addImageUrl = () => {
    setP((current) => ({
      ...current,
      images: [...current.images, ""],
    }));
  };

  const updateImageUrl = (
    index: number,
    value: string,
  ) => {
    setP((current) => {
      const images = [...current.images];

      images[index] = value;

      return {
        ...current,
        images,
      };
    });
  };

  const removeImage = (index: number) => {
    setP((current) => ({
      ...current,
      images: current.images.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  /* =======================================================
     ADD VARIANT
  ======================================================= */

  const addVariant = () => {
    setP((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          id: crypto.randomUUID(),
          size: "",
          color: "",
          sku: "",
          stock: 0,
        },
      ],
    }));
  };

  /* =======================================================
     REMOVE VARIANT
  ======================================================= */

  const removeVariant = (index: number) => {
    setP((current) => ({
      ...current,
      variants: current.variants.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  /* =======================================================
     SAVE PRODUCT
  ======================================================= */

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    /* -----------------------------------------------------
       PRODUCT NAME
    ----------------------------------------------------- */

    if (!p.name.trim()) {
      toast.error("Enter a product name");
      return;
    }

    /* -----------------------------------------------------
       CATEGORY
    ----------------------------------------------------- */

    if (!p.categoryId) {
      toast.error("Choose a category");
      return;
    }

    /* -----------------------------------------------------
       REGULAR PRICE
    ----------------------------------------------------- */

    if (p.price < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    /* -----------------------------------------------------
       SALE PRICE
    ----------------------------------------------------- */

    if (
      p.discountPrice !== undefined &&
      p.discountPrice !== null
    ) {
      if (p.discountPrice < 0) {
        toast.error("Sale price cannot be negative");
        return;
      }

      if (p.discountPrice > p.price) {
        toast.error(
          "Sale price cannot be greater than the regular price",
        );
        return;
      }
    }

    /* -----------------------------------------------------
       ONLINE PRODUCTS REQUIRE VARIANTS
    ----------------------------------------------------- */

    if (
      p.productType === "BUY_ONLINE" &&
      !p.variants.length
    ) {
      toast.error(
        "Add at least one size/colour variant",
      );
      return;
    }

    /* -----------------------------------------------------
       VARIANT SKU REQUIRED
    ----------------------------------------------------- */

    if (
      p.variants.some(
        (variant) => !variant.sku.trim(),
      )
    ) {
      toast.error(
        "Every variant needs an SKU",
      );
      return;
    }

    /* -----------------------------------------------------
       UNIQUE SKU
    ----------------------------------------------------- */

    const skuList = p.variants.map((variant) =>
      variant.sku.trim().toUpperCase(),
    );

    if (
      new Set(skuList).size !== skuList.length
    ) {
      toast.error(
        "Each variant needs a unique SKU",
      );
      return;
    }

    /* -----------------------------------------------------
       IMAGE URL VALIDATION
    ----------------------------------------------------- */

    const invalidImageUrl = p.images.some(
      (url) =>
        url.trim() !== "" &&
        !/^https?:\/\/.+/i.test(url.trim()),
    );

    if (invalidImageUrl) {
      toast.error(
        "Each image must be a valid http:// or https:// URL",
      );
      return;
    }

    setBusy(true);

    try {
      /* ---------------------------------------------------
         CLEAN IMAGES
      --------------------------------------------------- */

      const cleanedImages = p.images
        .map((url) => url.trim())
        .filter(Boolean);

      /* ---------------------------------------------------
         CLEAN VARIANTS
      --------------------------------------------------- */

      const cleanedVariants = p.variants.map(
        (variant) => ({
          ...variant,
          size: variant.size.trim(),
          color: variant.color.trim(),
          sku: variant.sku.trim().toUpperCase(),
          stock: Math.max(
            0,
            Number(variant.stock),
          ),
        }),
      );

      /* ---------------------------------------------------
         PREPARE DATA

         Do not send discountPrice: undefined.
      --------------------------------------------------- */

      const data = {
        ...p,

        name: p.name.trim(),

        slug:
          p.slug.trim() ||
          slugify(p.name),

        images: cleanedImages,

        variants: cleanedVariants,

        description: p.description.trim(),

        fabric:
          p.fabric?.trim() ?? "",

        careInstructions:
          p.careInstructions?.trim() ?? "",

        tags: p.tags
          .map((tag) => tag.trim())
          .filter(Boolean),

        ...(p.discountPrice !== undefined &&
        p.discountPrice !== null
          ? {
              discountPrice:
                p.discountPrice,
            }
          : {}),
      } as unknown as Partial<Product>;

      /* ---------------------------------------------------
         SAVE
      --------------------------------------------------- */

      await saveProduct(
        isNew
          ? data
          : {
              ...data,
              id,
            },
        user.uid,
      );

      toast.success("Product saved");

      /* ---------------------------------------------------
         REFRESH ADMIN PRODUCTS
      --------------------------------------------------- */

      await qc.invalidateQueries({
        queryKey: ["adminProducts"],
      });

      /* ---------------------------------------------------
         REFRESH STOREFRONT PRODUCTS
      --------------------------------------------------- */

      await qc.invalidateQueries({
        queryKey: ["products"],
      });

      /* ---------------------------------------------------
         RETURN TO PRODUCT LIST
      --------------------------------------------------- */

      nav({
        to: "/admin/products",
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Save failed",
      );
    } finally {
      setBusy(false);
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <form
      onSubmit={save}
      className="max-w-4xl space-y-6"
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <AdminHeader
        title={
          isNew
            ? "New product"
            : "Edit product"
        }
      >
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            nav({
              to: "/admin/products",
            })
          }
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={busy}
        >
          {busy ? "Saving…" : "Save"}
        </Button>
      </AdminHeader>

      {/* ===================================================
          BASIC PRODUCT INFORMATION
      =================================================== */}

      <section className="grid gap-4 rounded-md border bg-background p-5 sm:grid-cols-2">
        {/* NAME */}

        <Field label="Name">
          <Input
            required
            value={p.name}
            onChange={(e) => {
              set(
                "name",
                e.target.value,
              );
            }}
            onBlur={() => {
              if (!p.slug.trim()) {
                set(
                  "slug",
                  slugify(p.name),
                );
              }
            }}
            placeholder="Example: Designer Bridal Saree"
          />
        </Field>

        {/* URL SLUG */}

        <Field label="URL slug">
          <Input
            value={p.slug}
            onChange={(e) => {
              /*
               * IMPORTANT:
               * Do not slugify while typing.
               * Otherwise characters can disappear
               * and the input can behave strangely.
               */
              set(
                "slug",
                e.target.value,
              );
            }}
            onBlur={() => {
              if (p.slug.trim()) {
                set(
                  "slug",
                  slugify(p.slug),
                );
              }
            }}
            placeholder="designer-bridal-saree"
          />
        </Field>

        {/* CATEGORY */}

        <Field label="Category">
          <select
            required
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={p.categoryId}
            onChange={(e) => {
              set(
                "categoryId",
                e.target.value,
              );
            }}
          >
            <option value="">
              Choose…
            </option>

            {cats.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        {/* SELLING MODE */}

        <Field label="Selling mode">
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={p.productType}
            onChange={(e) => {
              set(
                "productType",
                e.target
                  .value as Product["productType"],
              );
            }}
          >
            <option value="BUY_ONLINE">
              Buy online
            </option>

            <option value="ENQUIRY_ONLY">
              Enquiry only (WhatsApp)
            </option>
          </select>
        </Field>

        {/* PRICE */}

        <Field label="Price (₹)">
          <Input
            type="number"
            min={0}
            required
            value={p.price}
            onChange={(e) => {
              set(
                "price",
                e.target.value === ""
                  ? 0
                  : Number(
                      e.target.value,
                    ),
              );
            }}
          />
        </Field>

        {/* SALE PRICE */}

        <Field label="Sale price (₹, optional)">
          <Input
            type="number"
            min={0}
            value={
              p.discountPrice ?? ""
            }
            onChange={(e) => {
              set(
                "discountPrice",
                e.target.value === ""
                  ? undefined
                  : Number(
                      e.target.value,
                    ),
              );
            }}
          />
        </Field>

        {/* DESCRIPTION */}

        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea
              rows={5}
              value={p.description}
              onChange={(e) => {
                set(
                  "description",
                  e.target.value,
                );
              }}
              placeholder="Describe the product..."
            />
          </Field>
        </div>

        {/* FABRIC */}

        <Field label="Fabric">
          <Input
            value={p.fabric ?? ""}
            onChange={(e) => {
              set(
                "fabric",
                e.target.value,
              );
            }}
            placeholder="Example: Pure Silk"
          />
        </Field>

        {/* CARE */}

        <Field label="Care instructions">
          <Input
            value={
              p.careInstructions ?? ""
            }
            onChange={(e) => {
              set(
                "careInstructions",
                e.target.value,
              );
            }}
            placeholder="Example: Dry clean only"
          />
        </Field>

        {/* TAGS */}

        <Field label="Tags (comma separated)">
          <Input
            value={p.tags.join(", ")}
            onChange={(e) => {
              /*
               * Keep the text exactly as typed.
               * Only split it into tags when saving.
               *
               * This is important because splitting/trimming
               * on every keystroke can make the input feel
               * like it is losing characters.
               */
              const value =
                e.target.value;

              setP((current) => ({
                ...current,
                tags: value
                  .split(",")
                  .map(
                    (tag) =>
                      tag.trim(),
                  )
                  .filter(Boolean),
              }));
            }}
            placeholder="bridal, saree, silk"
          />
        </Field>

        {/* FLAGS */}

        <div className="flex flex-wrap gap-5 pt-6 text-sm">
          {(
            [
              "active",
              "featured",
              "newArrival",
              "bestSeller",
            ] as const
          ).map((key) => (
            <label
              key={key}
              className="flex items-center gap-2"
            >
              <Switch
                checked={p[key]}
                onCheckedChange={(value) => {
                  set(
                    key,
                    value,
                  );
                }}
              />

              {
                {
                  active: "Live",
                  featured: "Featured",
                  newArrival:
                    "New arrival",
                  bestSeller:
                    "Best seller",
                }[key]
              }
            </label>
          ))}
        </div>
      </section>

      {/* ===================================================
          PRODUCT IMAGES
      =================================================== */}

      <section className="rounded-md border bg-background p-5">
        <h2 className="mb-1 font-medium">
          Product images
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Add publicly accessible image URLs.
          For best performance, use compressed
          WebP or JPG images.
        </p>

        <div className="space-y-3">
          {p.images.map((src, index) => (
            <div
              key={`image-${index}`}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              {/* IMAGE PREVIEW */}

              <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                {src ? (
                  <img
                    src={src}
                    alt={`Product image ${
                      index + 1
                    }`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <span className="px-1 text-center text-xs text-muted-foreground">
                    Preview
                  </span>
                )}
              </div>

              {/* URL */}

              <Input
                value={src}
                placeholder="https://example.com/product-image.webp"
                onChange={(e) => {
                  updateImageUrl(
                    index,
                    e.target.value,
                  );
                }}
              />

              {/* REMOVE */}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove image"
                onClick={() => {
                  removeImage(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* ADD IMAGE */}

          <Button
            type="button"
            variant="outline"
            onClick={addImageUrl}
          >
            + Add image URL
          </Button>

          {p.images.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No images added yet.
            </p>
          )}
        </div>
      </section>

      {/* ===================================================
          VARIANTS & STOCK
      =================================================== */}

      <section className="rounded-md border bg-background p-5">
        <div className="mb-3 flex justify-between">
          <div>
            <h2 className="font-medium">
              Variants & stock
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Each size/colour combination
              has its own SKU and stock.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addVariant}
          >
            Add variant
          </Button>
        </div>

        {!p.variants.length && (
          <p className="text-sm text-muted-foreground">
            No variants added yet.
          </p>
        )}

        <div className="space-y-2">
          {p.variants.map((variant, index) => (
            <div
              key={variant.id}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_90px_auto]"
            >
              {/* SIZE */}

              <Input
                aria-label="Size"
                placeholder="Size (e.g. M, Free)"
                value={variant.size}
                onChange={(e) => {
                  setVar(index, {
                    size: e.target.value,
                  });
                }}
              />

              {/* COLOUR */}

              <Input
                aria-label="Colour"
                placeholder="Colour"
                value={variant.color}
                onChange={(e) => {
                  setVar(index, {
                    color: e.target.value,
                  });
                }}
              />

              {/* SKU */}

              <Input
                aria-label="SKU"
                placeholder="SKU"
                required
                value={variant.sku}
                onChange={(e) => {
                  setVar(index, {
                    sku: e.target.value.toUpperCase(),
                  });
                }}
              />

              {/* STOCK */}

              <Input
                aria-label="Stock"
                type="number"
                min={0}
                value={variant.stock}
                onChange={(e) => {
                  setVar(index, {
                    stock:
                      e.target.value === ""
                        ? 0
                        : Math.max(
                            0,
                            Number(
                              e.target.value,
                            ),
                          ),
                  });
                }}
              />

              {/* REMOVE VARIANT */}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove variant"
                onClick={() => {
                  removeVariant(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}