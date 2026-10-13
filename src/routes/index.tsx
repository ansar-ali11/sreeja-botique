import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Instagram,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import heroBridal from "@/assets/hero-bridal.jpg";
import catSarees from "@/assets/cat-sarees.jpg";
import catLehengas from "@/assets/cat-lehengas.jpg";
import catDesigner from "@/assets/cat-designer.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Sreeja's Bridal Boutique | Bridal Wear, Sarees & Lehengas in Kakinada",
      },
      {
        name: "description",
        content:
          "Discover exquisite bridal wear, silk sarees, lehengas and designer fashion at Sreeja's Bridal Boutique, Kakinada, Andhra Pradesh.",
      },
      {
        property: "og:title",
        content: "Sreeja's Bridal Boutique | Kakinada",
      },
      {
        property: "og:description",
        content:
          "Elegance for every occasion — bridal and fashion collections from Kakinada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const COLLECTIONS = [
  {
    number: "01",
    name: "Bridal Wear",
    subtitle: "For your forever moment",
    image: heroBridal,
    to: "/shop",
  },
  {
    number: "02",
    name: "Silk Sarees",
    subtitle: "Timeless Indian elegance",
    image: catSarees,
    to: "/shop",
  },
  {
    number: "03",
    name: "Lehengas",
    subtitle: "Made for celebrations",
    image: catLehengas,
    to: "/shop",
  },
  {
    number: "04",
    name: "Designer Wear",
    subtitle: "Your own kind of beautiful",
    image: catDesigner,
    to: "/shop",
  },
];

function HomePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <Header />

      {/* Editorial hero */}
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-12 -z-10 h-80 w-80 rounded-full bg-[#B08D57]/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[680px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:px-10 lg:py-16">
          <div className="order-2 py-4 text-center lg:order-1 lg:py-10 lg:text-left">
            <div className="animate-fade-up flex items-center justify-center gap-3 lg:justify-start">
              <span className="h-px w-9 bg-[#B08D57]" />
              <p className="brand-eyebrow">
                SREEJA'S BRIDAL BOUTIQUE
              </p>
              <span className="h-px w-9 bg-[#B08D57] lg:hidden" />
            </div>

            <h1 className="animate-fade-up stagger-1 mx-auto mt-6 max-w-xl font-display text-5xl font-medium leading-[0.98] tracking-[-0.035em] sm:text-6xl md:text-7xl lg:mx-0 lg:mt-8 lg:text-[5.5rem]">
              Every thread
              <br />
              <span className="italic text-primary">tells a story.</span>
            </h1>

            <p className="animate-fade-up stagger-2 mx-auto mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 lg:mx-0">
              From the first celebration to the most unforgettable day,
              discover Indian occasion wear chosen to make every moment
              extraordinary.
            </p>

            <div className="animate-fade-up stagger-3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/shop"
                className="group inline-flex min-h-12 w-full items-center justify-center gap-3 bg-primary px-7 py-4 text-[10px] font-semibold tracking-[0.2em] text-primary-foreground transition-all duration-300 hover:bg-[#4A1423] hover:shadow-lg sm:w-auto"
              >
                DISCOVER THE COLLECTION
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/shop"
                className="luxury-link inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 py-4 text-[10px] font-semibold tracking-[0.2em] sm:w-auto"
              >
                EXPLORE BRIDAL
              </Link>
            </div>

            <div className="animate-fade-up stagger-4 mt-10 flex items-center justify-center gap-4 lg:justify-start">
              <div className="flex -space-x-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-[#E9D9CD]">
                  <Sparkles className="h-4 w-4 text-primary" />
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-[#D7C3A4]">
                  <Sparkles className="h-4 w-4 text-primary" />
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-[#F1E8DC]">
                  <Sparkles className="h-4 w-4 text-primary" />
                </span>
              </div>
              <p className="text-left text-xs leading-5 text-muted-foreground">
                <span className="block font-medium text-foreground">
                  Thoughtfully selected styles
                </span>
                For life's most meaningful moments
              </p>
            </div>
          </div>

          <div className="animate-reveal order-1 lg:order-2">
            <div className="relative mx-auto max-w-lg pl-3 pb-3 sm:pl-5 sm:pb-5 lg:max-w-none">
              <div className="absolute bottom-0 left-0 right-8 top-8 border border-[#B08D57]/60 sm:right-12 sm:top-12" />

              <div className="luxury-image relative aspect-[4/4.7] overflow-hidden bg-secondary">
                <img
                  src={heroBridal}
                  alt="Bridal red and gold traditional Indian wedding attire"
                  className="h-full w-full object-cover"
                  width={1280}
                  height={1504}
                  fetchPriority="high"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#281016]/40 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-8 sm:left-8 sm:right-8">
                  <div>
                    <p className="text-[9px] font-medium tracking-[0.3em] text-white/80">
                      MADE FOR YOUR MOMENT
                    </p>
                    <p className="mt-2 font-display text-2xl italic sm:text-3xl">
                      A celebration of you.
                    </p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/60">
                    <ArrowRight className="h-4 w-4 -rotate-45" />
                  </span>
                </div>
              </div>

              <div className="absolute -right-1 top-12 hidden bg-background px-4 py-3 shadow-sm sm:block lg:-right-4 lg:top-16">
                <p className="font-display text-xl italic text-primary">
                  Elegance, always.
                </p>
                <p className="mt-1 text-[8px] tracking-[0.22em] text-muted-foreground">
                  SREEJA'S BRIDAL BOUTIQUE
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand values strip */}
      <section className="border-y border-border/70 bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border/70 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-10">
          <div className="flex items-center justify-center gap-3 py-5 sm:py-6">
            <Sparkles className="h-4 w-4 shrink-0 text-[#B08D57]" />
            <span className="text-center text-[10px] font-medium tracking-[0.15em] sm:text-[9px] lg:text-[10px]">
              OCCASION-READY ELEGANCE
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 py-5 sm:py-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B08D57]" />
            <span className="text-center text-[10px] font-medium tracking-[0.15em] sm:text-[9px] lg:text-[10px]">
              TIMELESS INDIAN STYLE
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 py-5 sm:py-6">
            <MapPin className="h-4 w-4 shrink-0 text-[#B08D57]" />
            <span className="text-center text-[10px] font-medium tracking-[0.15em] sm:text-[9px] lg:text-[10px]">
              PROUDLY ROOTED IN KAKINADA
            </span>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
        <div className="mb-8 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="brand-eyebrow mb-3">A WORLD OF BEAUTY</p>
            <h2 className="font-display text-4xl font-medium leading-tight tracking-[-0.025em] sm:text-5xl lg:text-6xl">
              Find your <span className="italic text-primary">occasion.</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="luxury-link inline-flex w-fit items-center gap-2 pb-1 text-[10px] font-semibold tracking-[0.16em]"
          >
            VIEW ALL COLLECTIONS
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 lg:gap-6">
          {COLLECTIONS.map((collection, index) => (
            <Link
              key={collection.name}
              to={collection.to}
              className={`group min-w-0 animate-fade-up stagger-${Math.min(index + 1, 4)}`}
            >
              <div className="luxury-image relative aspect-[3/4] overflow-hidden bg-secondary">
                <img
                  src={collection.image}
                  alt={collection.name}
                  loading="lazy"
                  width={1024}
                  height={1365}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#211016]/75 via-[#211016]/5 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-100" />

                <span className="absolute left-3 top-3 border border-white/50 px-2 py-1 text-[9px] tracking-[0.15em] text-white sm:left-4 sm:top-4 sm:px-3">
                  {collection.number}
                </span>

                <span className="absolute bottom-4 left-3 right-3 text-white sm:bottom-6 sm:left-5 sm:right-5">
                  <span className="block font-display text-xl leading-tight sm:text-2xl lg:text-3xl">
                    {collection.name}
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-1 text-[8px] tracking-[0.12em] text-white/80 sm:text-[9px] sm:tracking-[0.16em]">
                    <span>{collection.subtitle}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bridal editorial */}
      <section className="relative overflow-hidden bg-secondary/60">
        <div className="pointer-events-none absolute -right-28 top-0 h-72 w-72 rounded-full bg-[#B08D57]/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-28">
          <div className="animate-reveal relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -bottom-3 -left-3 right-8 top-8 border border-[#B08D57]/70 sm:-bottom-4 sm:-left-4 sm:right-12 sm:top-12" />
            <div className="luxury-image relative aspect-[4/4.7] overflow-hidden bg-background">
              <img
                src={catLehengas}
                alt="Blush pink bridal lehenga with intricate embroidery"
                loading="lazy"
                width={1024}
                height={1203}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="animate-fade-up relative pt-3 text-center lg:pt-0 lg:text-left">
            <p className="brand-eyebrow mb-4">THE BRIDAL EDIT</p>
            <h2 className="font-display text-4xl font-medium leading-[1.08] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
              For the day
              <br />
              <span className="italic text-primary">you'll remember</span>
              <br />
              forever.
            </h2>

            <div className="brand-divider mx-auto my-6 lg:mx-0" />

            <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 lg:mx-0">
              Discover statement lehengas, beautiful sarees and occasion wear
              for the moments that become lifelong memories. Find a look that
              feels unmistakably yours.
            </p>

            <Link
              to="/shop"
              className="group mt-8 inline-flex min-h-12 items-center justify-center gap-4 bg-primary px-7 py-4 text-[10px] font-semibold tracking-[0.18em] text-primary-foreground transition-all duration-300 hover:bg-[#4A1423] hover:shadow-lg"
            >
              EXPLORE BRIDAL STYLES
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <p className="mt-5 font-display text-lg italic text-muted-foreground">
              An occasion. A memory. Your story.
            </p>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="animate-fade-up">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#B08D57]/60">
            <Instagram className="h-5 w-5 text-primary" />
          </div>

          <p className="brand-eyebrow mb-3">A LITTLE INSPIRATION</p>
          <h2 className="font-display text-4xl font-medium sm:text-5xl lg:text-6xl">
            A glimpse into our <span className="italic text-primary">world.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
            New arrivals, beautiful details and inspiration for your next
            celebration.
          </p>

          <a
            href="https://www.instagram.com/sreejas_bridal_boutique?utm_source=ig_web_button_share_sheet&cplk=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noreferrer"
            className="group mt-7 inline-flex items-center gap-3 border border-border px-6 py-4 text-[10px] font-semibold tracking-[0.18em] transition-all duration-300 hover:border-primary hover:text-primary"
          >
            <Instagram className="h-4 w-4" />
            @SREEJASBRIDALBOUTIQUE
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </section>

      {/* Visit the boutique */}
      <section className="relative overflow-hidden border-y border-border/70 bg-card">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[#B08D57]" />

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <MapPin className="mx-auto mb-5 h-6 w-6 text-[#B08D57]" />
            <p className="brand-eyebrow mb-3">COME SAY HELLO</p>
            <h2 className="font-display text-4xl font-medium sm:text-5xl lg:text-6xl">
              Your next favourite look <span className="italic text-primary">awaits.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
              Visit Sreeja's Bridal Boutique in Kakinada and discover styles
              for your most special occasions.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="https://maps.google.com/?q=Kakinada,Andhra+Pradesh"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-7 py-4 text-[10px] font-semibold tracking-[0.18em] text-primary-foreground transition-all duration-300 hover:bg-[#4A1423] sm:w-auto"
              >
                <MapPin className="h-4 w-4" />
                GET DIRECTIONS
              </a>

              <Link
                to="/contact"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-border px-7 py-4 text-[10px] font-semibold tracking-[0.18em] transition-all duration-300 hover:border-primary hover:text-primary sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                CONTACT THE BOUTIQUE
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
