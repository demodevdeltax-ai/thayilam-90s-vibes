import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Shop } from "@/components/shop";
import { Story } from "@/components/story";
import { Letters } from "@/components/letters";
import { Visit } from "@/components/visit";
import { SiteFooter } from "@/components/site-footer";
import { Divider } from "@/components/divider";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Thayilam — A sweet surprise from a small Chennai kitchen" },
      {
        name: "description",
        content:
          "Hand-rolled ladoos, slow-fried murukku and 90s Indian snacks made in small batches in a Chennai kitchen. Tied with thread, packed with memory.",
      },
      { property: "og:title", content: "Thayilam — A sweet surprise" },
      {
        property: "og:description",
        content:
          "90s Indian nostalgia snacks, hand-rolled and packed daily. Murukku, ladoo, mysore pak, jangri and more.",
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
        <Divider />
        <Shop />
        <Divider />
        <Story />
        <Divider />
        <Letters />
        <Visit />
      </main>
      <SiteFooter />
    </div>
  );
}
