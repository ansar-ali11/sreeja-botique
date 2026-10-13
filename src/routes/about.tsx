
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Gem,
  Sparkles,
  Flower2,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seo(
      "About Us",
      "Discover the story, craftsmanship, and timeless elegance of Sreeja’s Bridal Boutique.",
    ),
  component: AboutPage,
});

const values = [
  {
    number: "01",
    icon: Gem,
    title: "Timeless Elegance",
    description:
      "Discover thoughtfully selected designs that celebrate tradition while embracing modern sophistication.",
  },
  {
    number: "02",
    icon: Heart,
    title: "Made for Your Moments",
    description:
      "From wedding celebrations to meaningful occasions, find pieces that make every moment feel special.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Attention to Detail",
    description:
      "We appreciate the little details, beautiful finishes, and distinctive touches that make a piece memorable.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <main className="overflow-hidden bg-[#FAF8F4] text-[#29221F]">
        {/* Hero */}
        <section className="relative isolate flex min-h-[440px] items-center overflow-hidden bg-[#641F32] sm:min-h-[520px]">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#421421]/95 via-[#641F32]/85 to-[#641F32]/40" />

          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border border-[#D9BD83]/20 sm:h-[500px] sm:w-[500px]" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full border border-[#D9BD83]/20 sm:h-[420px] sm:w-[420px]" />

          <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
            <div className="max-w-2xl animate-[fadeInUp_0.8s_ease-out_both]">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-[#D9BD83]" />
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#E4C995] sm:text-xs">
                  The heart behind the boutique
                </p>
              </div>

              <h1 className="font-display text-5xl font-normal leading-[1.08] tracking-tight text-[#FAF4EA] sm:text-6xl lg:text-7xl">
                A story of
                <span className="block italic text-[#E4C995]">
                  grace & elegance.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-sm leading-7 text-[#F0E2D9]/85 sm:text-base sm:leading-8">
                Every celebration has a story. We are here to help you find
                beautiful pieces that become part of yours.
              </p>

              <Link
                to="/shop"
                className="mt-9 inline-flex h-12 items-center gap-4 bg-[#E4C995] px-6 text-[10px] font-medium uppercase tracking-[0.16em] text-[#421421] transition-all duration-300 hover:bg-white"
              >
                Explore our collection
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 hidden items-center gap-3 text-[9px] uppercase tracking-[0.22em] text-[#E4C995] md:flex">
            <span className="h-px w-8 bg-[#D9BD83]" />
            Beauty in every detail
          </div>
        </section>

        {/* Our story */}
        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-12 lg:py-28">
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -bottom-4 -left-4 h-full w-full border border-[#C6A36A]/50" />

            <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden bg-[#F0E7DB] px-8 py-12 sm:min-h-[440px]">
              <div className="absolute inset-5 border border-[#C6A36A]/30" />

              <div className="relative max-w-sm text-center">
                <Flower2
                  className="mx-auto h-12 w-12 text-[#987849]"
                  strokeWidth={1}
                />
                <p className="mt-7 font-display text-4xl leading-tight text-[#641F32] sm:text-5xl">
                  Beauty that
                  <span className="block italic">feels personal.</span>
                </p>
                <span className="mx-auto mt-6 block h-px w-16 bg-[#C6A36A]" />
                <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-[#756C65]">
                  Sreeja’s Bridal Boutique
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#987849]">
              Our story
            </p>

            <h2 className="font-display text-4xl font-normal leading-tight tracking-tight sm:text-5xl">
              Celebrating the
              <span className="block italic text-[#641F32]">
                beauty of you.
              </span>
            </h2>

            <div className="mt-7 space-y-5 text-sm leading-7 text-[#756C65]">
              <p>
                At Sreeja’s Bridal Boutique, we believe that what you wear
                should feel as special as the moment you wear it for.
              </p>
              <p>
                Our boutique brings together an appreciation for bridal
                beauty, graceful style, and the traditions that make every
                celebration meaningful. We want discovering your next
                favourite piece to feel just as memorable as wearing it.
              </p>
              <p>
                Whether you are preparing for a wedding, celebrating a
                milestone, or searching for something beautiful for yourself,
                we invite you to explore a collection chosen with care.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4 border-t border-[#E8DED2] pt-6">
              <span className="font-display text-3xl italic text-[#641F32]">
                With love,
              </span>
              <span className="h-px w-10 bg-[#C6A36A]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#756C65]">
                Sreeja’s Bridal Boutique
              </span>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-y border-[#E8DED2] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="mx-auto mb-12 max-w-xl text-center sm:mb-16">
              <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#987849]">
                What makes us special
              </p>
              <h2 className="font-display text-4xl font-normal sm:text-5xl">
                More than a beautiful piece
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#756C65]">
                The details matter. So does how you feel when you discover
                something that is right for you.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <article
                    key={value.number}
                    className="group border border-[#E8DED2] bg-[#FAF8F4] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#C6A36A] hover:shadow-[0_14px_35px_rgba(67,39,31,0.06)] sm:p-9"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl italic text-[#C6A36A]">
                        {value.number}
                      </span>
                      <Icon
                        className="h-6 w-6 text-[#641F32] transition-transform duration-300 group-hover:scale-110"
                        strokeWidth={1.3}
                      />
                    </div>

                    <h3 className="mt-9 font-display text-2xl font-normal text-[#641F32]">
                      {value.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-[#756C65]">
                      {value.description}
                    </p>

                    <span className="mt-7 block h-px w-10 bg-[#C6A36A] transition-all duration-300 group-hover:w-16" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="relative overflow-hidden bg-[#F0E7DB]">
          <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-[#C6A36A]/30" />
          <div className="pointer-events-none absolute -right-2 -top-14 h-52 w-52 rounded-full border border-[#C6A36A]/30" />

          <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-24">
            <Sparkles
              className="mx-auto h-7 w-7 text-[#987849]"
              strokeWidth={1.2}
            />

            <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[#987849]">
              Your next special moment
            </p>

            <h2 className="mt-4 font-display text-4xl font-normal leading-tight sm:text-5xl">
              Find something
              <span className="block italic text-[#641F32]">
                that feels like you.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#756C65]">
              Explore our collection and discover beautiful pieces for the
              moments you will always remember.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex h-12 items-center gap-3 bg-[#641F32] px-7 text-[10px] uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-[#4B1726]"
            >
              Discover the collection
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
