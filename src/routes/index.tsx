import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Instagram, MapPin, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import heroBridal from "@/assets/hero-bridal.jpg";
import catSarees from "@/assets/cat-sarees.jpg";
import catLehengas from "@/assets/cat-lehengas.jpg";
import catDesigner from "@/assets/cat-designer.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sreeja's Bridal Boutique | Bridal Wear, Sarees & Lehengas in Kakinada" },
      {
        name: "description",
        content:
          "Discover exquisite bridal wear, silk sarees, lehengas and designer fashion at Sreeja's Bridal Boutique, Kakinada, Andhra Pradesh.",
      },
      { property: "og:title", content: "Sreeja's Bridal Boutique | Kakinada" },
      {
        property: "og:description",
        content: "Elegance for every occasion — bridal and fashion collections from Kakinada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const COLLECTIONS = [
  { name: "Bridal Wear", image: heroBridal, to: "/shop" },
  { name: "Sarees", image: catSarees, to: "/shop" },
  { name: "Lehengas", image: catLehengas, to: "/shop" },
  { name: "Designer Wear", image: catDesigner, to: "/shop" },
];

function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="mb-4 text-[11px] font-medium tracking-[0.35em] text-primary">
              KAKINADA • ANDHRA PRADESH
            </p>
            <h1 className="font-display text-5xl font-medium leading-[1.05] lg:text-7xl">
              Elegance for Every Occasion
            </h1>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground lg:mx-0">
              Discover exquisite bridal and fashion collections from Sreeja's
              Bridal Boutique.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                to="/shop"
                className="inline-flex w-full items-center justify-center gap-2 bg-primary px-8 py-3.5 text-xs font-semibold tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
              >
                SHOP COLLECTION <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex w-full items-center justify-center border border-foreground/30 px-8 py-3.5 text-xs font-semibold tracking-[0.2em] transition-colors hover:border-primary hover:text-primary sm:w-auto"
              >
                EXPLORE BRIDAL
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md overflow-hidden lg:max-w-none">
              <img
                src={heroBridal}
                alt="Bride in a red and gold silk lehenga from Sreeja's Bridal Boutique"
                className="aspect-[4/5] w-full object-cover"
                width={1280}
                height={1600}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Collection */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-medium tracking-[0.35em] text-primary">
            CURATED FOR YOU
          </p>
          <h2 className="font-display text-4xl font-medium lg:text-5xl">
            Shop by Collection
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {COLLECTIONS.map((c) => (
            <Link key={c.name} to={c.to} className="group relative overflow-hidden">
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={1024}
                height={1280}
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 w-full p-4 text-center">
                <span className="font-display text-xl font-medium text-background lg:text-2xl">
                  {c.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bridal editorial */}
      <section className="bg-secondary/50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="overflow-hidden">
            <img
              src={catLehengas}
              alt="Blush pink bridal lehenga with silver embroidery"
              loading="lazy"
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="text-center lg:text-left">
            <p className="mb-2 text-[11px] font-medium tracking-[0.35em] text-primary">
              THE BRIDAL COLLECTION
            </p>
            <h2 className="font-display text-4xl font-medium leading-tight lg:text-5xl">
              Make Your Special Day Extraordinary
            </h2>
            <p className="mt-5 max-w-md text-muted-foreground lg:mx-0 mx-auto">
              Hand-embroidered lehengas, heirloom silk sarees and bespoke bridal
              ensembles — crafted to make your celebration unforgettable.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 bg-foreground px-8 py-3.5 text-xs font-semibold tracking-[0.2em] text-background transition-opacity hover:opacity-90"
            >
              EXPLORE BRIDAL COLLECTION <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8 lg:py-24">
        <Instagram className="mx-auto mb-4 h-7 w-7 text-primary" />
        <h2 className="font-display text-4xl font-medium">Follow Our Journey</h2>
        <p className="mt-3 text-muted-foreground">
          Behind-the-scenes, new arrivals and real brides — on Instagram.
        </p>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 border border-foreground/30 px-8 py-3 text-xs font-semibold tracking-[0.2em] transition-colors hover:border-primary hover:text-primary"
        >
          @SREEJASBRIDALBOUTIQUE
        </a>
      </section>

      {/* Store */}
      <section className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8 lg:py-20">
          <MapPin className="mx-auto mb-4 h-7 w-7 text-primary" />
          <h2 className="font-display text-4xl font-medium">Visit Our Boutique</h2>
          <p className="mt-3 text-muted-foreground">
            Sreeja's Bridal Boutique — Kakinada, Andhra Pradesh
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="https://maps.google.com/?q=Kakinada,Andhra+Pradesh"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-primary px-8 py-3.5 text-xs font-semibold tracking-[0.2em] text-primary-foreground hover:opacity-90 sm:w-auto"
            >
              GET DIRECTIONS
            </a>
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center gap-2 border border-foreground/30 px-8 py-3.5 text-xs font-semibold tracking-[0.2em] hover:border-primary hover:text-primary sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" /> CONTACT US
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
