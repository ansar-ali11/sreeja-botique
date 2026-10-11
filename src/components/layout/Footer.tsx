import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="font-display text-2xl font-semibold">SREEJA'S</div>
          <div className="mb-4 text-[9px] font-medium tracking-[0.35em] text-muted-foreground">
            BRIDAL BOUTIQUE
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Exquisite bridal and fashion collections handcrafted with love in
            Kakinada, Andhra Pradesh.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.2em]">SHOP</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-primary">All Products</Link></li>
            <li><Link to="/shop" className="hover:text-primary">Bridal Wear</Link></li>
            <li><Link to="/shop" className="hover:text-primary">Sarees</Link></li>
            <li><Link to="/shop" className="hover:text-primary">Lehengas</Link></li>
            <li><Link to="/shop" className="hover:text-primary">New Arrivals</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.2em]">CUSTOMER SERVICE</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/account/orders" className="hover:text-primary">Track Order</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
            <li><Link to="/policies/$slug" params={{ slug: "shipping" }} className="hover:text-primary">Shipping Policy</Link></li>
            <li><Link to="/policies/$slug" params={{ slug: "returns" }} className="hover:text-primary">Returns & Refunds</Link></li>
            <li><Link to="/policies/$slug" params={{ slug: "privacy" }} className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/policies/$slug" params={{ slug: "terms" }} className="hover:text-primary">Terms & Conditions</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.2em]">CONTACT</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Kakinada, Andhra Pradesh, India
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Coming soon
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Coming soon
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-primary" /> @sreejasbridalboutique
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sreeja's Bridal Boutique. All rights reserved.
      </div>
    </footer>
  );
}
