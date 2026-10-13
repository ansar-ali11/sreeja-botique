import { Link } from "@tanstack/react-router";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
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

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Announcement strip */}
      <div className="relative overflow-hidden bg-primary px-3 py-2 text-center text-[9px] font-medium tracking-[0.13em] text-primary-foreground sm:text-[10px] sm:tracking-[0.2em]">
        <span className="mx-auto block max-w-7xl animate-fade-in break-words">
          {DEFAULT_SETTINGS.announcement}
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 h-px w-24 -translate-x-1/2 bg-[#B08D57]"
        />
      </div>

      {/* Main navigation */}
      <header
        className={`sticky top-0 z-50 border-b transition-[box-shadow,background-color] duration-500 ${
          scrolled
            ? "border-[#B08D57]/30 bg-background/95 shadow-md backdrop-blur-xl"
            : "border-border/70 bg-background"
        }`}
      >
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 sm:px-5 sm:py-4 lg:flex lg:justify-between lg:gap-6 lg:px-8">
          {/* Mobile menu */}
          <button
            type="button"
            className="group flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <Menu className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          </button>

          {/* Boutique wordmark */}
          <Link
            to="/"
            className="group flex min-w-0 flex-col items-center justify-self-center leading-none lg:mr-4"
            aria-label="Sreeja's Bridal Boutique home"
          >
            <span className="font-display text-xl font-medium tracking-[0.06em] text-primary transition-all duration-300 group-hover:tracking-[0.1em] sm:text-2xl lg:text-3xl">
              SREEJA'S
            </span>

            <span className="mt-1.5 whitespace-nowrap text-[7px] font-medium tracking-[0.22em] text-muted-foreground transition-colors duration-300 group-hover:text-primary sm:text-[9px] sm:tracking-[0.32em]">
              BRIDAL BOUTIQUE
            </span>

            <span
              aria-hidden="true"
              className="mt-2 h-px w-8 bg-[#B08D57] transition-all duration-500 group-hover:w-full"
            />
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-3 lg:flex xl:gap-5 2xl:gap-7"
          >
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ "data-active": "true" }}
                className="luxury-link whitespace-nowrap py-2 text-[9px] font-medium tracking-[0.12em] text-foreground/80 transition-colors duration-300 hover:text-primary data-[active=true]:text-primary xl:text-[10px] xl:tracking-[0.16em]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Customer actions */}
          <div className="flex items-center justify-self-end gap-2 sm:gap-3 lg:gap-2 xl:gap-3">
            <Link
              to="/search"
              aria-label="Search"
              className="group flex h-9 w-8 items-center justify-center rounded-full transition-colors hover:bg-secondary sm:w-9"
            >
              <Search className="h-[18px] w-[18px] transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
            </Link>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="group hidden h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary sm:flex"
            >
              <Heart className="h-[18px] w-[18px] transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
            </Link>

            <Link
              to="/account"
              aria-label="Account"
              className="group hidden h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary sm:flex"
            >
              <User className="h-[18px] w-[18px] transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
            </Link>

            <Link
              to="/cart"
              aria-label={`Cart, ${count} items`}
              className="group relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            >
              <ShoppingBag className="h-[18px] w-[18px] transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />

              {count > 0 && (
                <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full border border-background bg-primary px-1 text-[9px] font-medium text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full animate-fade-in bg-foreground/45 backdrop-blur-[2px]"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          />

          <aside
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 left-0 flex w-[min(84vw,340px)] animate-reveal flex-col overflow-y-auto border-r border-[#B08D57]/30 bg-background p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-8 flex items-center justify-between gap-3 border-b border-border pb-5">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex flex-col leading-none"
              >
                <span className="font-display text-2xl font-medium text-primary">
                  SREEJA'S
                </span>
                <span className="mt-1.5 text-[8px] tracking-[0.25em] text-muted-foreground">
                  BRIDAL BOUTIQUE
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary"
              >
                <X className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
              </button>
            </div>

            <p className="brand-eyebrow mb-3 text-[#987746]">
              Discover the collection
            </p>

            <nav className="flex flex-col gap-1">
              {NAV.map((item, index) => (
                <Link
                  key={item.label}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className="group flex animate-fade-up items-center justify-between rounded-sm px-3 py-3.5 text-xs font-medium tracking-[0.16em] text-foreground/85 transition-all duration-300 hover:translate-x-1 hover:bg-secondary hover:text-primary"
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="text-[#B08D57] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  >
                    →
                  </span>
                </Link>
              ))}
            </nav>

            <div className="my-5 h-px bg-border" />

            <nav aria-label="Customer links" className="flex flex-col gap-1">
              {[
                { label: "SEARCH", to: "/search" },
                { label: "WISHLIST", to: "/wishlist" },
                { label: "ACCOUNT", to: "/account" },
                { label: `CART (${count})`, to: "/cart" },
              ].map((item, index) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${(index + NAV.length) * 45}ms` }}
                  className="flex animate-fade-up items-center gap-3 rounded-sm px-3 py-3 text-xs tracking-[0.14em] text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  {item.label === "SEARCH" && <Search className="h-4 w-4" />}
                  {item.label === "WISHLIST" && <Heart className="h-4 w-4" />}
                  {item.label === "ACCOUNT" && <User className="h-4 w-4" />}
                  {item.label.startsWith("CART") && (
                    <ShoppingBag className="h-4 w-4" />
                  )}
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <div className="mb-4 h-px bg-[#B08D57]/50" />
              <p className="font-display text-xl italic text-primary">
                Made for your special moments.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
