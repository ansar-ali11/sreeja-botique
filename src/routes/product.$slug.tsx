import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, MessageCircle, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, Loading, Empty } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { getProductBySlug, getSettings } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/types";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => seo(params.slug.replace(/-/g, " "), "Discover this piece at Sreeja's Bridal Boutique, Kakinada."),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const nav = useNavigate();
  const { data: p, isLoading } = useQuery({ queryKey: ["product", slug], queryFn: () => getProductBySlug(slug) });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const cart = useCart();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [qty, setQty] = useState(1);

  if (isLoading) return <SiteLayout><Loading /></SiteLayout>;
  if (!p) return <SiteLayout><Empty title="Product not found"><Link to="/shop" className="underline">Back to shop</Link></Empty></SiteLayout>;

  const sizes = [...new Set(p.variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(p.variants.map((v) => v.color).filter(Boolean))];
  const variant = p.variants.find((v) => (!sizes.length || v.size === size) && (!colors.length || v.color === color));
  const final = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
  const enquiry = p.productType === "ENQUIRY_ONLY";
  const wa = `https://wa.me/${settings?.whatsapp ?? "917285919381"}?text=${encodeURIComponent(
    `Hello Sreeja's Bridal Boutique, I'm interested in "${p.name}"${size ? `, size ${size}` : ""}${color ? `, colour ${color}` : ""}. ${typeof window !== "undefined" ? window.location.href : ""}`,
  )}`;

  const addToCart = (buyNow = false) => {
    if (!variant) return toast.error("Please choose a size and colour");
    if (variant.stock <= 0) return toast.error("This option is sold out");
    const ok = cart.add({ productId: p.id, variantId: variant.id, name: p.name, image: p.images[0] ?? "", sku: variant.sku, size: variant.size, color: variant.color, price: final, quantity: qty }, variant.stock);
    if (!ok) return toast.error(`Only ${variant.stock} left in stock`);
    if (buyNow) nav({ to: "/checkout" }); else toast.success("Added to your bag");
  };

  const chip = (active: boolean, disabled: boolean) =>
    `min-w-12 border px-3 py-2 text-sm transition ${active ? "border-foreground bg-foreground text-background" : "hover:border-foreground"} ${disabled ? "opacity-40 line-through" : ""}`;

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="aspect-[3/4] overflow-hidden bg-secondary">
            {p.images[img] && <img src={p.images[img]} alt={p.name} className="h-full w-full object-cover" />}
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {p.images.map((src, i) => (
                <button key={src} onClick={() => setImg(i)} aria-label={`View image ${i + 1}`} className={`h-24 w-20 shrink-0 border-2 ${i === img ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <h1 className="font-display text-4xl font-medium">{p.name}</h1>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl">{formatINR(final)}</span>
            {final < p.price && <span className="text-muted-foreground line-through">{formatINR(p.price)}</span>}
          </div>
          {sizes.length > 0 && (
            <fieldset><legend className="mb-2 text-xs tracking-widest">SIZE</legend>
              <div className="flex flex-wrap gap-2">{sizes.map((s) => {
                const none = p.variants.filter((v) => v.size === s).every((v) => v.stock <= 0);
                return <button key={s} className={chip(size === s, none)} aria-pressed={size === s} onClick={() => setSize(s)}>{s}</button>;
              })}</div>
            </fieldset>
          )}
          {colors.length > 0 && (
            <fieldset><legend className="mb-2 text-xs tracking-widest">COLOUR</legend>
              <div className="flex flex-wrap gap-2">{colors.map((c) => {
                const none = p.variants.filter((v) => v.color === c && (!size || v.size === size)).every((v) => v.stock <= 0);
                return <button key={c} className={chip(color === c, none)} aria-pressed={color === c} onClick={() => setColor(c)}>{c}</button>;
              })}</div>
            </fieldset>
          )}
          {!enquiry && variant && (
            <p className="text-sm text-muted-foreground">{variant.stock <= 0 ? "Sold out" : variant.stock <= 3 ? `Only ${variant.stock} left` : "In stock"} · SKU {variant.sku}</p>
          )}
          {enquiry ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">This piece is made to order or available in-store. Message us for pricing, fittings and availability.</p>
              <Button asChild size="lg" className="w-full tracking-widest"><a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" />ENQUIRE ON WHATSAPP</a></Button>
              <Button asChild size="lg" variant="outline" className="w-full tracking-widest"><Link to="/contact">CONTACT BOUTIQUE</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border">
                  <button className="p-3" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-3 w-3" /></button>
                  <span className="w-8 text-center" aria-live="polite">{qty}</span>
                  <button className="p-3" aria-label="Increase quantity" onClick={() => setQty(qty + 1)}><Plus className="h-3 w-3" /></button>
                </div>
                <Button size="lg" className="flex-1 tracking-widest" onClick={() => addToCart()}>ADD TO BAG</Button>
                <Button size="lg" variant="outline" aria-label="Wishlist" onClick={() => cart.toggleWish(p.id)}>
                  <Heart className={`h-4 w-4 ${cart.wishlist.includes(p.id) ? "fill-primary text-primary" : ""}`} />
                </Button>
              </div>
              <Button size="lg" variant="secondary" className="w-full tracking-widest" onClick={() => addToCart(true)}>BUY NOW</Button>
              <a href={wa} target="_blank" rel="noreferrer" className="block text-center text-sm underline">Questions? Ask us on WhatsApp</a>
            </div>
          )}
          <div className="space-y-4 border-t pt-6 text-sm leading-relaxed">
            <p className="whitespace-pre-line">{p.description}</p>
            {p.fabric && <p><span className="text-xs tracking-widest">FABRIC</span><br />{p.fabric}</p>}
            {p.careInstructions && <p><span className="text-xs tracking-widest">CARE</span><br />{p.careInstructions}</p>}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
