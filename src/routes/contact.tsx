
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo(
      "Contact Us",
      "Get in touch with Sreeja’s Bridal Boutique for enquiries, order assistance, and collection questions.",
    ),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Product enquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(
      `${form.subject} — Enquiry from ${form.name}`,
    );

    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || "Not provided"}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`,
    );

    // Opens the visitor's email app with the enquiry prepared.
    // Replace this address with your actual boutique email.
    window.location.href = `mailto:YOUR_EMAIL@example.com?subject=${subject}&body=${body}`;

    setSubmitted(true);
  }

  return (
    <SiteLayout>
      <main className="overflow-hidden bg-[#FAF8F4] text-[#29221F]">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-[#641F32]">
          <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-[#D9BD83]/20 sm:h-[480px] sm:w-[480px]" />
          <div className="pointer-events-none absolute -right-8 -top-16 h-64 w-64 rounded-full border border-[#D9BD83]/20 sm:h-[400px] sm:w-[400px]" />

          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-[#D9BD83]" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#E4C995]">
                  We would love to hear from you
                </p>
              </div>

              <h1 className="font-display text-5xl font-normal leading-tight text-[#FAF4EA] sm:text-6xl lg:text-7xl">
                Let’s start a
                <span className="block italic text-[#E4C995]">
                  conversation.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-[#F0E2D9]/85 sm:text-base sm:leading-8">
                Have a question about a beautiful piece, an existing order, or
                a special occasion? We are here to help make your experience
                feel effortless.
              </p>

              <div className="mt-8 flex items-center gap-3 text-xs text-[#E4C995]">
                <Sparkles className="h-4 w-4" strokeWidth={1.4} />
                <span className="tracking-wide">
                  A personal touch, every step of the way
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact details + form */}
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-12 lg:py-20">
          {/* Contact information */}
          <aside>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#987849]">
              Get in touch
            </p>

            <h2 className="font-display text-3xl font-normal leading-tight sm:text-4xl">
              We’re here to
              <span className="block italic text-[#641F32]">
                make it special.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#756C65]">
              Whether you need help choosing a piece or have a question about
              an order, send us a message and we’ll be happy to hear from you.
            </p>

            <div className="mt-9 space-y-4">
              <a
                href="mailto:YOUR_EMAIL@example.com"
                className="group flex items-start gap-4 border border-[#E8DED2] bg-white p-5 transition-all duration-300 hover:border-[#C6A36A] hover:shadow-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#F5EEE5] text-[#641F32]">
                  <Mail className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[9px] uppercase tracking-[0.2em] text-[#987849]">
                    Email us
                  </span>
                  <span className="mt-2 block break-all text-sm text-[#641F32]">
                    YOUR_EMAIL@example.com
                  </span>
                  <span className="mt-1 block text-xs text-[#8B8179]">
                    For general and order enquiries
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[#987849] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>

              <div className="flex items-start gap-4 border border-[#E8DED2] bg-white p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#F5EEE5] text-[#641F32]">
                  <Phone className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#987849]">
                    Call us
                  </p>
                  <p className="mt-2 text-sm text-[#641F32]">
                    Contact number coming soon
                  </p>
                  <p className="mt-1 text-xs text-[#8B8179]">
                    Add your boutique phone number here
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border border-[#E8DED2] bg-white p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#F5EEE5] text-[#641F32]">
                  <Clock3 className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#987849]">
                    Response time
                  </p>
                  <p className="mt-2 text-sm text-[#641F32]">
                    We’ll get back to you
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#8B8179]">
                    Response times may vary depending on enquiry volume.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-[#E8DED2] pt-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#987849]">
                Follow our journey
              </p>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-3 text-sm text-[#641F32] transition-colors hover:text-[#987849]"
              >
                <Instagram className="h-5 w-5" />
                Find us on Instagram
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </aside>

          {/* Enquiry form */}
          <section className="border border-[#E8DED2] bg-white p-5 sm:p-8 lg:p-10">
            <div className="mb-8">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#987849]">
                Your message
              </p>
              <h2 className="font-display text-3xl font-normal text-[#641F32] sm:text-4xl">
                How can we help?
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#756C65]">
                Fill in the details below to prepare your enquiry.
              </p>
            </div>

            {submitted && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 border border-[#C6D9C7] bg-[#F0F7F0] p-4 text-sm text-[#456B49]"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  Your email app should open with your message prepared. Send
                  the email there to complete your enquiry.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#756C65]"
                  >
                    Your name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={(event) => {
                      setSubmitted(false);
                      setForm({ ...form, name: event.target.value });
                    }}
                    placeholder="Enter your name"
                    className="h-12 w-full border border-[#E8DED2] bg-[#FCFAF7] px-4 text-sm outline-none transition-colors placeholder:text-[#AAA097] focus:border-[#987849] focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#756C65]"
                  >
                    Email address *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(event) => {
                      setSubmitted(false);
                      setForm({ ...form, email: event.target.value });
                    }}
                    placeholder="you@example.com"
                    className="h-12 w-full border border-[#E8DED2] bg-[#FCFAF7] px-4 text-sm outline-none transition-colors placeholder:text-[#AAA097] focus:border-[#987849] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#756C65]"
                  >
                    Phone number
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => {
                      setSubmitted(false);
                      setForm({ ...form, phone: event.target.value });
                    }}
                    placeholder="Your contact number"
                    className="h-12 w-full border border-[#E8DED2] bg-[#FCFAF7] px-4 text-sm outline-none transition-colors placeholder:text-[#AAA097] focus:border-[#987849] focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#756C65]"
                  >
                    Enquiry type *
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={(event) => {
                      setSubmitted(false);
                      setForm({ ...form, subject: event.target.value });
                    }}
                    className="h-12 w-full border border-[#E8DED2] bg-[#FCFAF7] px-4 text-sm outline-none focus:border-[#987849] focus:bg-white"
                  >
                    <option>Product enquiry</option>
                    <option>Order assistance</option>
                    <option>Shipping and delivery</option>
                    <option>Returns and exchanges</option>
                    <option>Bridal collection</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#756C65]"
                >
                  Your message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(event) => {
                    setSubmitted(false);
                    setForm({ ...form, message: event.target.value });
                  }}
                  placeholder="Tell us how we can help..."
                  className="w-full resize-y border border-[#E8DED2] bg-[#FCFAF7] p-4 text-sm leading-6 outline-none transition-colors placeholder:text-[#AAA097] focus:border-[#987849] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[#641F32] px-6 text-[10px] font-medium uppercase tracking-[0.17em] text-white transition-colors duration-300 hover:bg-[#4B1726] sm:w-auto"
              >
                Prepare your message
                <Send className="h-4 w-4" />
              </button>

              <p className="text-[11px] leading-5 text-[#8B8179]">
                This form prepares a message in your default email application.
                It does not send your enquiry directly from the website.
              </p>
            </form>
          </section>
        </section>

        {/* Bottom banner */}
        <section className="border-t border-[#E8DED2] bg-[#F0E7DB]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#987849]">
                Still exploring?
              </p>
              <h2 className="mt-2 font-display text-2xl text-[#641F32] sm:text-3xl">
                Your next favourite piece awaits.
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex h-12 items-center justify-center gap-3 self-start bg-[#641F32] px-6 text-[10px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#4B1726] md:self-auto"
            >
              Explore collections
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
