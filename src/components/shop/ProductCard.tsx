import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatINR, type Product } from "@/lib/types";

export function ProductCard({ p }: { p: Product }) {
  const { wishlist, toggleWish } = useCart();
  const wished = wishlist.includes(p.id);
  const sale = p.discountPrice && p.discountPrice < p.price;
  const outOfStock = p.productType === "BUY_ONLINE" && p.variants.every((v) => v.stock <= 0);
  return (
    <div className="group relative">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
        <div className="aspect-[3/4] overflow-hidden bg-secondary">
          {p.images[0] ? (
            <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-display text-lg leading-tight">{p.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{formatINR(sale ? p.discountPrice! : p.price)}</span>
            {sale && <span className="text-muted-foreground line-through">{formatINR(p.price)}</span>}
          </div>
        </div>
      </Link>
      <div className="absolute left-2 top-2 flex flex-col gap-1">
        {p.newArrival && <span className="bg-background px-2 py-0.5 text-[10px] tracking-widest">NEW</span>}
        {p.productType === "ENQUIRY_ONLY" && <span className="bg-primary px-2 py-0.5 text-[10px] tracking-widest text-primary-foreground">ENQUIRE</span>}
        {outOfStock && <span className="bg-foreground px-2 py-0.5 text-[10px] tracking-widest text-background">SOLD OUT</span>}
      </div>
      <button
        onClick={() => toggleWish(p.id)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-2 top-2 rounded-full bg-background/90 p-2"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-primary text-primary" : ""}`} />
      </button>
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
