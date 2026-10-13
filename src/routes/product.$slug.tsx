
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  Truck,
  X,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";

import { SiteLayout, Loading, Empty } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { getProductBySlug, getSettings } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/types";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) =>
    seo(
      params.slug.replace(/-/g, " "),
      "Discover this piece at Sreeja's Bridal Boutique, Kakinada.",
    ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const nav = useNavigate();

  const { data: p, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const cart = useCart();

  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [qty, setQty] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Loading />
        </div>
      </SiteLayout>
    );
  }

  if (error || !p) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Empty title="Product not found">
            This style may no longer be available.
            <div className="mt-4">
              <Link
                to="/shop"
                className="font-medium text-[#651E32] underline underline-offset-4"
              >
                Back to collection
              </Link>
            </div>
          </Empty>
        </div>
      </SiteLayout>
    );
  }

  const images = (p.images ?? []).filter(
    (src): src is string => typeof src === "string" && src.trim().length > 0,
  );

  const sizes = [...new Set(p.variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(p.variants.map((v) => v.color).filter(Boolean))];

  const variant = p.variants.find(
    (v) =>
      (!sizes.length || v.size === size) &&
      (!colors.length || v.color === color),
  );

  const final =
    p.discountPrice && p.discountPrice < p.price
      ? p.discountPrice
      : p.price;

  const hasDiscount = final < p.price;
  const discountPercent = hasDiscount
    ? Math.round(((p.price - final) / p.price) * 100)
    : 0;

  const enquiry = p.productType === "ENQUIRY_ONLY";
  const wished = cart.wishlist.includes(p.id);
  const currentImage = images[img];
  const currentImageFailed = currentImage
    ? failedImages.includes(currentImage)
    : false;

  const markImageFailed = (src: string) => {
    setFailedImages((current) =>
      current.includes(src) ? current : [...current, src],
    );
  };

  const wa = `https://wa.me/${settings?.whatsapp ?? "917285919381"}?text=${encodeURIComponent(
    `Hello Sreeja's Bridal Boutique, I'm interested in "${p.name}"${size ? `, size ${size}` : ""}${color ? `, colour ${color}` : ""}. ${typeof window !== "undefined" ? window.location.href : ""}`,
  )}`;

  const toggleWishlist = () => {
    cart.toggleWish(p.id);
    toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
  };

  const addToCart = (buyNow = false) => {
    if (!p.variants.length) {
      toast.error("This product is not available to purchase yet");
      return;
    }

    if (!variant) {
      toast.error(
        `Please choose ${[
          sizes.length ? "a size" : "",
          colors.length ? "a colour" : "",
        ]
          .filter(Boolean)
          .join(" and ")}`,
      );
      return;
    }

    if (variant.stock <= 0) {
      toast.error("This option is sold out");
      return;
    }

    if (qty > variant.stock) {
      toast.error(`Only ${variant.stock} left in stock`);
      return;
    }

    const ok = cart.add(
      {
        productId: p.id,
        variantId: variant.id,
        name: p.name,
        image: images[0] ?? "",
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price: final,
        quantity: qty,
      },
      variant.stock,
    );

    if (!ok) {
      toast.error(`Only ${variant.stock} left in stock`);
      return;
    }

    if (buyNow) {
      nav({ to: "/checkout" });
    } else {
      toast.success("Added to your bag");
    }
  };

  const chip = (active: boolean, disabled: boolean) =>
    `flex min-h-11 min-w-12 items-center justify-center rounded-sm border px-4 py-2 text-xs font-medium transition-all duration-200 ${
      active
        ? "border-[#651E32] bg-[#651E32] text-white shadow-sm"
        : "border-[#DED3C8] bg-white text-[#40212A] hover:border-[#651E32]"
    } ${
      disabled
        ? "cursor-not-allowed opacity-40 line-through hover:border-[#DED3C8]"
        : ""
    }`;

  const changeImage = (direction: -1 | 1) => {
    if (!images.length) return;

    setImg((current) => (current + direction + images.length) % images.length);
  };

  return (
    <SiteLayout>
      <main className="min-h-screen bg-[#FFFEFC] pb-24 text-[#38272C] lg:pb-10">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-7 lg:px-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-[10px] text-[#8A7D76] sm:text-xs"
          >
            <Link to="/" className="transition-colors hover:text-[#651E32]">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="transition-colors hover:text-[#651E32]">
              Shop
            </Link>
            <span>/</span>
            <span className="max-w-[55vw] truncate text-[#651E32]">
              {p.name}
            </span>
          </nav>
        </div>

        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-8 pt-4 sm:gap-9 sm:px-7 sm:pt-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:gap-12 lg:px-10 lg:pt-8">
          {/* Product gallery */}
          <section aria-label="Product images" className="min-w-0">
            {/*
              IMPORTANT:
              Only create a two-column gallery when thumbnails exist.
              With one image, the main image occupies the full width.
            */}
            <div
              className={
                images.length > 1
                  ? "grid grid-cols-1 gap-3 sm:grid-cols-[76px_minmax(0,1fr)] lg:gap-4"
                  : "grid grid-cols-1 gap-3"
              }
            >
              {/* Desktop thumbnails */}
              {images.length > 1 && (
                <div className="order-2 hidden max-h-[760px] flex-col gap-3 overflow-y-auto sm:order-1 sm:flex">
                  {images.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setImg(i)}
                      aria-label={`View product image ${i + 1}`}
                      aria-pressed={i === img}
                      className={`relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-sm border bg-[#F5F0EA] transition ${
                        i === img
                          ? "border-2 border-[#651E32]"
                          : "border-[#E7DDD3] hover:border-[#B08D57]"
                      }`}
                    >
                      {!failedImages.includes(src) ? (
                        <img
                          src={src}
                          alt={`${p.name} thumbnail ${i + 1}`}
                          loading="lazy"
                          onError={() => markImageFailed(src)}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center px-1 text-center text-[9px] text-[#8A796D]">
                          Image unavailable
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div
                className={
                  images.length > 1
                    ? "order-1 min-w-0 sm:order-2"
                    : "min-w-0"
                }
              >
                <div className="group relative aspect-[3/4] w-full overflow-hidden bg-[#F5F0EA]">
                  {currentImage && !currentImageFailed ? (
                    <button
                      type="button"
                      onClick={() => setZoomOpen(true)}
                      className="absolute inset-0 block h-full w-full cursor-zoom-in"
                      aria-label="Zoom product image"
                    >
                      <img
                        src={currentImage}
                        alt={p.name}
                        loading="eager"
                        decoding="async"
                        onError={() => markImageFailed(currentImage)}
                        className="absolute inset-0 h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.015]"
                      />
                    </button>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center text-sm text-[#8A796D]">
                      <span className="font-display text-3xl text-[#651E32]">
                        Sreeja's
                      </span>
                      <span>
                        {currentImage ? "This image could not be loaded" : "No product image available"}
                      </span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/10 to-transparent" />

                  <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5 sm:left-4 sm:top-4">
                    {p.newArrival && (
                      <span className="bg-white/95 px-2.5 py-1.5 text-[9px] font-semibold tracking-[0.12em] text-[#651E32] shadow-sm">
                        NEW ARRIVAL
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="bg-[#651E32] px-2.5 py-1.5 text-[9px] font-semibold tracking-[0.1em] text-white shadow-sm">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={toggleWishlist}
                    aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wished}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#651E32] shadow-sm transition hover:scale-105 sm:right-4 sm:top-4"
                  >
                    <Heart
                      className={`h-5 w-5 ${wished ? "fill-[#651E32]" : ""}`}
                      strokeWidth={1.6}
                    />
                  </button>

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => changeImage(-1)}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#651E32] shadow-sm transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => changeImage(1)}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#651E32] shadow-sm transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {currentImage && !currentImageFailed && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-[9px] font-medium text-[#651E32] shadow-sm">
                      <ZoomIn className="h-3.5 w-3.5" />
                      TAP TO ZOOM
                    </div>
                  )}
                </div>

                {/* Mobile thumbnails */}
                {images.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
                    {images.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        onClick={() => setImg(i)}
                        aria-label={`View image ${i + 1}`}
                        aria-pressed={i === img}
                        className={`relative h-[78px] w-[62px] shrink-0 overflow-hidden rounded-sm border-2 bg-[#F5F0EA] ${
                          i === img ? "border-[#651E32]" : "border-transparent"
                        }`}
                      >
                        {!failedImages.includes(src) ? (
                          <img
                            src={src}
                            alt=""
                            loading="lazy"
                            onError={() => markImageFailed(src)}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center px-1 text-[8px] text-[#8A796D]">
                            Unavailable
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="flex items-center px-2 text-[10px] text-[#8A7D76]">
                      {img + 1} / {images.length}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Product information */}
          <section className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="border-b border-[#EAE1D8] pb-5">
              <p className="mb-2 text-[9px] font-semibold tracking-[0.2em] text-[#967448] sm:text-[10px]">
                SREEJA'S BRIDAL BOUTIQUE
              </p>

              <div className="flex items-start justify-between gap-3">
                <h1 className="min-w-0 font-display text-3xl font-medium leading-tight text-[#40212A] sm:text-4xl">
                  {p.name}
                </h1>
                <button
                  type="button"
                  onClick={toggleWishlist}
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={wished}
                  className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E4DAD2] text-[#651E32] transition hover:border-[#651E32] sm:flex"
                >
                  <Heart
                    className={`h-[18px] w-[18px] ${wished ? "fill-[#651E32]" : ""}`}
                    strokeWidth={1.6}
                  />
                </button>
              </div>

              <p className="mt-2 text-xs text-[#83746E]">
                Timeless style for your special moments
              </p>

              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="text-2xl font-semibold tracking-tight text-[#40212A] sm:text-3xl">
                  {formatINR(final)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-[#8A7D76] line-through sm:text-base">
                      {formatINR(p.price)}
                    </span>
                    <span className="text-xs font-semibold text-[#967448]">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="mt-2 text-[10px] text-[#8A7D76]">
                Final price shown above
              </p>
            </div>

            {/* Size selection */}
            {sizes.length > 0 && (
              <fieldset className="border-b border-[#EAE1D8] py-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <legend className="text-[11px] font-semibold tracking-[0.12em] text-[#40212A]">
                    SELECT SIZE
                  </legend>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("For size guidance, please contact our boutique.")
                    }
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#651E32] underline underline-offset-4"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    SIZE HELP
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const matching = p.variants.filter(
                      (v) => v.size === s && (!color || v.color === color),
                    );
                    const unavailable =
                      matching.length > 0 && matching.every((v) => v.stock <= 0);

                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={unavailable}
                        className={chip(size === s, unavailable)}
                        aria-pressed={size === s}
                        onClick={() => {
                          setSize(s);
                          setQty(1);
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Colour selection */}
            {colors.length > 0 && (
              <fieldset className="border-b border-[#EAE1D8] py-5">
                <legend className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-[#40212A]">
                  SELECT COLOUR
                </legend>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const matching = p.variants.filter(
                      (v) => v.color === c && (!size || v.size === size),
                    );
                    const unavailable =
                      matching.length > 0 && matching.every((v) => v.stock <= 0);

                    return (
                      <button
                        key={c}
                        type="button"
                        disabled={unavailable}
                        className={chip(color === c, unavailable)}
                        aria-pressed={color === c}
                        onClick={() => {
                          setColor(c);
                          setQty(1);
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Stock information */}
            {!enquiry && (
              <div className="py-4">
                {variant ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {variant.stock > 0 ? (
                      <>
                        <Check className="h-4 w-4 text-[#66815C]" />
                        <span className="font-medium text-[#55704B]">
                          {variant.stock <= 3
                            ? `Only ${variant.stock} left`
                            : "In stock"}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium text-[#A23B42]">
                        This option is sold out
                      </span>
                    )}
                    {variant.sku && (
                      <span className="text-[#8A7D76]">
                        · Style code: {variant.sku}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#8A7D76]">
                    Select the available options to check stock.
                  </p>
                )}
              </div>
            )}

            {/* Purchase actions */}
            {enquiry ? (
              <div className="space-y-3 py-5">
                <p className="text-sm leading-6 text-[#786B67]">
                  Interested in this piece? Contact us for pricing, fittings
                  and availability.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-sm bg-[#651E32] text-xs tracking-[0.1em] text-white hover:bg-[#4B1726]"
                >
                  <a href={wa} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    ENQUIRE ON WHATSAPP
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-sm border-[#DCCFC1] text-xs tracking-[0.1em] text-[#651E32]"
                >
                  <Link to="/contact">CONTACT BOUTIQUE</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 shrink-0 items-center rounded-sm border border-[#DCCFC1]">
                    <button
                      type="button"
                      className="flex h-full w-9 items-center justify-center disabled:opacity-40"
                      aria-label="Decrease quantity"
                      onClick={() => setQty((current) => Math.max(1, current - 1))}
                      disabled={qty <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium" aria-live="polite">
                      {qty}
                    </span>
                    <button
                      type="button"
                      className="flex h-full w-9 items-center justify-center disabled:opacity-40"
                      aria-label="Increase quantity"
                      onClick={() =>
                        setQty((current) =>
                          variant ? Math.min(current + 1, variant.stock) : current + 1,
                        )
                      }
                      disabled={!!variant && qty >= variant.stock}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <Button
                    size="lg"
                    className="h-11 min-w-0 flex-1 rounded-sm bg-[#651E32] text-[11px] font-semibold tracking-[0.1em] text-white hover:bg-[#4B1726]"
                    onClick={() => addToCart()}
                  >
                    ADD TO BAG
                  </Button>

                  <button
                    type="button"
                    onClick={toggleWishlist}
                    aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wished}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[#DCCFC1] text-[#651E32] transition hover:border-[#651E32]"
                  >
                    <Heart
                      className={`h-[18px] w-[18px] ${wished ? "fill-[#651E32]" : ""}`}
                    />
                  </button>
                </div>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 w-full rounded-sm border-[#651E32] bg-white text-[11px] font-semibold tracking-[0.1em] text-[#651E32] hover:bg-[#F8F3EE]"
                  onClick={() => addToCart(true)}
                >
                  BUY NOW
                </Button>

                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2 text-xs text-[#651E32] transition hover:underline"
                >
                  <MessageCircle className="h-4 w-4" />
                  Have a question? Chat with us
                </a>
              </div>
            )}

            {/* Service information */}
            <div className="grid grid-cols-1 gap-3 border-y border-[#EAE1D8] py-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#967448]" />
                <div>
                  <p className="text-xs font-semibold text-[#40212A]">
                    Delivery information
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-[#8A7D76]">
                    Contact us for delivery timelines and availability.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#967448]" />
                <div>
                  <p className="text-xs font-semibold text-[#40212A]">
                    Personal assistance
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-[#8A7D76]">
                    Our boutique can help with product questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Product details */}
            {(p.description || p.fabric || p.careInstructions) && (
              <section className="space-y-5 py-6">
                <h2 className="font-display text-2xl text-[#40212A]">
                  About this piece
                </h2>
                {p.description && (
                  <div>
                    <h3 className="mb-2 text-[10px] font-semibold tracking-[0.13em] text-[#40212A]">
                      DESCRIPTION
                    </h3>
                    <p className="whitespace-pre-line break-words text-sm leading-6 text-[#786B67] [overflow-wrap:anywhere]">
                      {p.description}
                    </p>
                  </div>
                )}
                {p.fabric && (
                  <div className="border-t border-[#EAE1D8] pt-4">
                    <h3 className="mb-2 text-[10px] font-semibold tracking-[0.13em] text-[#40212A]">
                      FABRIC & MATERIAL
                    </h3>
                    <p className="whitespace-pre-line break-words text-sm leading-6 text-[#786B67]">
                      {p.fabric}
                    </p>
                  </div>
                )}
                {p.careInstructions && (
                  <div className="border-t border-[#EAE1D8] pt-4">
                    <h3 className="mb-2 text-[10px] font-semibold tracking-[0.13em] text-[#40212A]">
                      CARE INSTRUCTIONS
                    </h3>
                    <p className="whitespace-pre-line break-words text-sm leading-6 text-[#786B67]">
                      {p.careInstructions}
                    </p>
                  </div>
                )}
              </section>
            )}
          </section>
        </div>
      </main>

      {/* Sticky mobile purchase bar */}
      {!enquiry && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4DAD2] bg-[#FFFEFC]/95 px-4 py-3 shadow-[0_-5px_24px_rgba(45,24,30,0.08)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] text-[#786B67]">{p.name}</p>
              <p className="mt-0.5 text-sm font-semibold text-[#40212A]">
                {formatINR(final)}
              </p>
            </div>
            <Button
              size="lg"
              className="h-11 min-w-[145px] rounded-sm bg-[#651E32] px-5 text-[10px] font-semibold tracking-[0.1em] text-white hover:bg-[#4B1726]"
              onClick={() => addToCart()}
            >
              ADD TO BAG
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Full-screen image zoom */}
      {zoomOpen && currentImage && !currentImageFailed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#170E11]/95 p-3 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Product image viewer"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#651E32]"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                changeImage(-1);
              }}
              aria-label="Previous image"
              className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#651E32] sm:left-6"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <img
            src={currentImage}
            alt={p.name}
            onClick={(event) => event.stopPropagation()}
            onError={() => {
              markImageFailed(currentImage);
              setZoomOpen(false);
            }}
            className="max-h-[90vh] max-w-full object-contain"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                changeImage(1);
              }}
              aria-label="Next image"
              className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#651E32] sm:right-6"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          <p className="absolute bottom-4 text-xs text-white/80">
            {img + 1} / {images.length}
          </p>
        </div>
      )}
    </SiteLayout>
  );
}
