import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/PageStub";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Sreeja's Bridal Boutique" },
      { name: "description", content: "The story of Sreeja's Bridal Boutique, Kakinada." },
      { property: "og:title", content: "About | Sreeja's Bridal Boutique" },
      { property: "og:description", content: "The story of Sreeja's Bridal Boutique, Kakinada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PageStub title="About the Boutique" />,
});
