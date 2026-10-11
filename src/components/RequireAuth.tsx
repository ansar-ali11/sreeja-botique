import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Loading } from "@/components/SiteLayout";

export function RequireAuth({
  children,
  admin,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/login",
        search: {
          next: location.pathname,
        },
        replace: true,
      });
    }
  }, [loading, user, navigate, location.pathname]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Loading />;
  }

  if (admin && !isAdmin) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-display text-3xl">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This account does not have admin access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}