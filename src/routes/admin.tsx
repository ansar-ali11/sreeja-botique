import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BarChart3, FolderTree, LayoutDashboard, Package, Settings, ShoppingCart, Tag, Users, Store } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  head: () => ({ ...seo("Admin", "Store administration."), meta: [...seo("Admin", "Store administration.").meta, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products & Inventory", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  return (
    <RequireAuth admin>
      <div className="flex min-h-screen bg-muted/40">
        <aside className="hidden w-60 shrink-0 border-r bg-background p-4 md:block">
          <Link to="/" className="mb-8 block font-display text-xl font-semibold">SREEJA'S <span className="text-xs text-muted-foreground">admin</span></Link>
          <nav className="space-y-1">
            {NAV.map(({ to, label, icon: I }) => (
              <Link key={to} to={to} activeOptions={{ exact: to === "/admin" }} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted" activeProps={{ className: "bg-secondary font-medium text-primary" }}>
                <I className="h-4 w-4" />{label}
              </Link>
            ))}
            <Link to="/" className="mt-6 flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground"><Store className="h-4 w-4" />View store</Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <nav className="flex gap-2 overflow-x-auto border-b bg-background p-2 md:hidden">
            {NAV.map(({ to, label }) => <Link key={to} to={to} activeOptions={{ exact: to === "/admin" }} className="whitespace-nowrap rounded px-3 py-1.5 text-xs" activeProps={{ className: "bg-secondary text-primary" }}>{label}</Link>)}
          </nav>
          <div className="p-4 lg:p-8"><Outlet /></div>
        </div>
      </div>
    </RequireAuth>
  );
}

export function AdminHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-3xl">{title}</h1><div className="flex gap-2">{children}</div></div>;
}
