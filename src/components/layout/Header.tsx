import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { useCart } from "@/lib/cart";

const NAV = [
  { label: "HOME", to: "/" },
  { label: "SHOP", to: "/shop" },
  { label: "COLLECTIONS", to: "/shop" },
  { label: "NEW ARRIVALS", to: "/shop" },
  { label: "BRIDAL", to: "/shop" },
  { label: "ABOUT", to: "/about" },
  { label: "CONTACT", to: "/contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="bg-foreground py-2 text-center text-[11px] font-medium tracking-[0.2em] text-background">
        {DEFAULT_SETTINGS.announcement}
      </div>
      <header
        className={`sticky top-0 z-50 border-b bg-background/95 backdrop-blur transition-shadow ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex flex-col items-center leading-none">
            <span className="font-display text-2xl font-semibold tracking-wide lg:text-3xl">
              SREEJA'S
            </span>
            <span className="text-[9px] font-medium tracking-[0.35em] text-muted-foreground">
              BRIDAL BOUTIQUE
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-[11px] font-medium tracking-[0.18em] text-foreground/80 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/search" aria-label="Search">
              <Search className="h-5 w-5 transition-colors hover:text-primary" />
            </Link>
            <Link to="/wishlist" aria-label="Wishlist" className="hidden sm:block">
              <Heart className="h-5 w-5 transition-colors hover:text-primary" />
            </Link>
            <Link to="/account" aria-label="Account" className="hidden sm:block">
              <User className="h-5 w-5 transition-colors hover:text-primary" />
            </Link>
            <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative">
              <ShoppingBag className="h-5 w-5 transition-colors hover:text-primary" />
              {count > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{count}</span>}
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-background p-6 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-xl font-semibold">SREEJA'S</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium tracking-[0.2em] text-foreground/80"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/wishlist"
                onClick={() => setOpen(false)}
                className="text-xs font-medium tracking-[0.2em] text-foreground/80"
              >
                WISHLIST
              </Link>
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="text-xs font-medium tracking-[0.2em] text-foreground/80"
              >
                ACCOUNT
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
