import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/PageStub";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Sreeja's Bridal Boutique" },
      { name: "description", content: "Visit or contact Sreeja's Bridal Boutique in Kakinada." },
      { property: "og:title", content: "Contact | Sreeja's Bridal Boutique" },
      { property: "og:description", content: "Visit or contact Sreeja's Bridal Boutique in Kakinada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PageStub title="Contact Us" />,
});
