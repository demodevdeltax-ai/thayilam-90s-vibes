import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Categories } from "@/components/categories";
import { ProductGrid } from "@/components/product-grid";
import { Story } from "@/components/story";
import { Letters } from "@/components/letters";
import { Visit } from "@/components/visit";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Thayilam — Nostalgia in every bite. 90s snacks, made fresh." },
      {
        name: "description",
        content:
          "Hand-rolled ladoos, slow-fried murukku, chakli, mixture, pickles and sweets — small-batch 90s Indian snacks made fresh in Chennai kitchens.",
      },
      { property: "og:title", content: "Thayilam — A sweet surprise" },
      {
        property: "og:description",
        content:
          "90s Indian nostalgia snacks, hand-rolled and packed daily. Order on WhatsApp.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Categories />
        <ProductGrid />
        <Story />
        <Letters />
        <Visit />
      </main>
      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}
