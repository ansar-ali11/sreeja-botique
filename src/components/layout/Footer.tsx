import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const shopLinks = [
  { label: "All Products", to: "/shop" },
  { label: "Bridal Wear", to: "/shop" },
  { label: "Sarees", to: "/shop" },
  { label: "Lehengas", to: "/shop" },
  { label: "New Arrivals", to: "/shop" },
];

const serviceLinks = [
  { label: "Track Order", to: "/account/orders" },
  { label: "Contact Us", to: "/contact" },
];

const policyLinks = [
  { label: "Shipping Policy", slug: "shipping" },
  { label: "Returns & Refunds", slug: "returns" },
  { label: "Privacy Policy", slug: "privacy" },
  { label: "Terms & Conditions", slug: "terms" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#B08D57]/30 bg-[#F5F0E8] text-[#40212A]">
      {/* Decorative gold accent */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#B08D57] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 sm:pb-12 sm:pt-16 lg:px-10 lg:pt-20">
        {/* Brand introduction */}
        <div className="grid gap-12 border-b border-[#B08D57]/30 pb-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.35fr_0.8fr_1fr_1fr] lg:gap-12 lg:pb-16">
          <div className="max-w-sm">
            <Link
              to="/"
              className="group inline-block"
              aria-label="Sreeja's Bridal Boutique home"
            >
              <span className="block font-display text-3xl font-medium tracking-[0.04em] text-[#651E32] transition-colors duration-300 group-hover:text-[#8B3049] sm:text-4xl">
                SREEJA'S
              </span>
              <span className="mt-1 block text-[9px] font-medium tracking-[0.36em] text-[#8D755C]">
                BRIDAL BOUTIQUE
              </span>
              <span className="mt-3 block h-px w-12 bg-[#B08D57] transition-all duration-500 group-hover:w-full" />
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-[#766B65]">
              Celebrating life's beautiful moments with bridal and occasion
              wear chosen with care in Kakinada, Andhra Pradesh.
            </p>

            <Link
              to="/shop"
              className="group mt-6 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-[#651E32]"
            >
              DISCOVER OUR COLLECTION
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Shop links */}
          <div>
            <h2 className="mb-5 flex items-center gap-3 text-[10px] font-semibold tracking-[0.22em] text-[#651E32]">
              <span className="h-px w-5 bg-[#B08D57]" />
              SHOP
            </h2>
            <ul className="space-y-3">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-2 text-sm text-[#766B65] transition-colors duration-300 hover:text-[#651E32]"
                  >
                    <span className="h-px w-0 bg-[#B08D57] transition-all duration-300 group-hover:w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service and policies */}
          <div>
            <h2 className="mb-5 flex items-center gap-3 text-[10px] font-semibold tracking-[0.22em] text-[#651E32]">
              <span className="h-px w-5 bg-[#B08D57]" />
              CUSTOMER CARE
            </h2>

            <ul className="space-y-3">
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-2 text-sm text-[#766B65] transition-colors duration-300 hover:text-[#651E32]"
                  >
                    <span className="h-px w-0 bg-[#B08D57] transition-all duration-300 group-hover:w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}

              {policyLinks.map((item) => (
                <li key={item.slug}>
                  <Link
                    to="/policies/$slug"
                    params={{ slug: item.slug }}
                    className="group inline-flex items-center gap-2 text-sm text-[#766B65] transition-colors duration-300 hover:text-[#651E32]"
                  >
                    <span className="h-px w-0 bg-[#B08D57] transition-all duration-300 group-hover:w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact information */}
          <div>
            <h2 className="mb-5 flex items-center gap-3 text-[10px] font-semibold tracking-[0.22em] text-[#651E32]">
              <span className="h-px w-5 bg-[#B08D57]" />
              FIND OUR BOUTIQUE
            </h2>

            <ul className="space-y-4 text-sm text-[#766B65]">
              <li className="flex items-start gap-3 leading-6">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#A17B43]" />
                <span>Kakinada, Andhra Pradesh, India</span>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#A17B43]" />
                <span>Phone details coming soon</span>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#A17B43]" />
                <span className="break-all">Email details coming soon</span>
              </li>

              <li>
                <a
                  href="https://www.instagram.com/sreejas_bridal_boutique?utm_source=ig_web_button_share_sheet&cplk=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 transition-colors duration-300 hover:text-[#651E32]"
                >
                  <Instagram className="h-4 w-4 shrink-0 text-[#A17B43] transition-transform duration-300 group-hover:scale-110" />
                  <span>@sreejasbridalboutique</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-[11px] leading-5 text-[#8B7D74]">
            © {new Date().getFullYear()} Sreeja's Bridal Boutique. All rights
            reserved.
          </p>

          <Link
            to="/"
            className="group inline-flex items-center gap-2 font-display text-sm italic text-[#8B7D74] transition-colors duration-300 hover:text-[#651E32]"
          >
            Made for your special moments
            <span className="h-px w-5 bg-[#B08D57] transition-all duration-300 group-hover:w-9" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
