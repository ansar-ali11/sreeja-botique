import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout, PageTitle } from "@/components/SiteLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/shop/AddressForm";
import { useAuth } from "@/lib/auth";
import { deleteAddress, listAddresses } from "@/lib/api";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  head: () => seo("My Account", "Manage your profile, addresses and orders."),
  component: () => (
    <SiteLayout>
      <PageTitle title="My Account" />
      <RequireAuth>
        <Account />
      </RequireAuth>
    </SiteLayout>
  ),
});

function Account() {
  const { user, isAdmin, logout } = useAuth();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  console.log("[Account] Component rendered", {
    uid: user?.uid,
    email: user?.email,
    isAdmin,
  });

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    error: addressesError,
  } = useQuery({
    queryKey: ["addresses", user!.uid],
    queryFn: async () => {
      console.log("[Account] Fetching addresses for:", user!.uid);

      try {
        const result = await listAddresses(user!.uid);
        console.log("[Account] Addresses fetched:", result.length);
        return result;
      } catch (error) {
        console.error("[Account] Address fetch failed:", error);
        throw error;
      }
    },
  });

  console.log("[Account] Address query state:", {
    addressesLoading,
    addressesCount: addresses.length,
    addressesError,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-2xl">
            {user!.displayName || "Hello"}
          </p>
          <p className="text-sm text-muted-foreground">{user!.email}</p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link
              to="/myorders"
              onClick={() => {
                console.log("[My Orders] Link clicked");
                console.log("[My Orders] Current URL:", window.location.href);
                console.log("[My Orders] Target: /account/orders");
              }}
            >
              My orders
            </Link>
          </Button>

          {isAdmin && (
            <Button asChild variant="outline">
              <Link to="/admin">Admin</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              console.log("[Account] Sign out clicked");
              logout();
            }}
          >
            Sign out
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex justify-between">
          <h2 className="font-display text-2xl">Addresses</h2>
          {!adding && (
            <Button size="sm" onClick={() => setAdding(true)}>
              Add address
            </Button>
          )}
        </div>

        {adding && (
          <AddressForm
            onSaved={() => {
              console.log("[Account] Address saved");
              setAdding(false);
              qc.invalidateQueries({ queryKey: ["addresses"] });
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {addressesError && (
          <p className="text-sm text-destructive">
            Could not load addresses. Check the browser console.
          </p>
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="border p-4 text-sm">
              <p className="font-medium">{a.fullName}</p>
              <p>
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
              </p>
              <p>
                {a.city}, {a.state} {a.pincode}
              </p>
              <p>{a.phone}</p>

              <button
                className="mt-2 text-xs underline"
                onClick={async () => {
                  try {
                    console.log("[Account] Removing address:", a.id);
                    await deleteAddress(user!.uid, a.id);
                    toast.success("Removed");
                    await qc.invalidateQueries({
                      queryKey: ["addresses"],
                    });
                  } catch (error) {
                    console.error("[Account] Delete address failed:", error);
                    toast.error("Could not remove address");
                  }
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        {!addressesLoading && !addresses.length && !adding && (
          <p className="text-sm text-muted-foreground">
            No saved addresses yet.
          </p>
        )}
      </section>
      <Outlet />
    </div>
  );
}
