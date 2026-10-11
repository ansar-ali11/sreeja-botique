import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageTitle, Loading, Empty } from "@/components/SiteLayout";
import { ProductGrid } from "@/components/shop/ProductCard";
import { listProducts } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/wishlist")({
  head: () => seo("Wishlist", "Your saved pieces from Sreeja's Bridal Boutique."),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useCart();
  const { data, isLoading } = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const items = (data ?? []).filter((p) => wishlist.includes(p.id));
  return (
    <SiteLayout>
      <PageTitle title="Wishlist" />
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {isLoading && wishlist.length ? <Loading /> : items.length === 0 ? (
          <Empty title="Your wishlist is empty">Tap the heart on any piece to save it. <Link to="/shop" className="underline">Browse the collection</Link></Empty>
        ) : <ProductGrid products={items} />}
      </div>
    </SiteLayout>
  );
}
