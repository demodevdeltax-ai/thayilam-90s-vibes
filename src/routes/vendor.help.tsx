import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, MessageSquare, Mail, Phone, BookOpen } from "lucide-react";
import { PageHeader, VendorCard } from "@/components/vendor/ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vendor/help")({
  head: () => ({ meta: [{ title: "Help — Vendor Panel" }] }),
  component: HelpPage,
});

const FAQS = [
  { q: "When do payouts happen?", a: "Every Monday, NEFT to the bank account on file. Orders settle 3 days after delivery." },
  { q: "How do I add a new weight variant?", a: "Open My Products → Add new product (or edit an existing one) and use 'Add variant' under Price." },
  { q: "Can I pause my store for a few days?", a: "Yes — flip Holiday mode in Store Settings. Orders stop, and your store is hidden from search." },
  { q: "What if a courier loses my package?", a: "Mark the order disputed in Orders and our team will step in within one working day." },
  { q: "Are there packaging guidelines?", a: "Food-safe brown paper, jute thread, and a small handwritten tag — see our packaging guide PDF." },
];

function HelpPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <>
      <PageHeader title="Help & support" subtitle="We're a phone call away — promise." />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <VendorCard padding={false}>
            <div className="p-5 border-b border-[#E8E6DF]">
              <h2 className="text-base font-semibold text-[#1f1d1a]">Frequently asked</h2>
              <p className="text-xs text-[#7a766c] mt-0.5">Quick answers from the Thayilam team.</p>
            </div>
            <ul>
              {FAQS.map((f, i) => {
                const open = openIdx === i;
                return (
                  <li key={f.q} className="border-b border-[#F1EFE7] last:border-0">
                    <button
                      onClick={() => setOpenIdx(open ? null : i)}
                      className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-[#FAFAF7]"
                    >
                      <span className="text-sm font-medium text-[#1f1d1a]">{f.q}</span>
                      <ChevronDown size={15} className={`text-[#7a766c] transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && <p className="px-5 pb-5 -mt-2 text-sm text-[#4a463e] leading-relaxed">{f.a}</p>}
                  </li>
                );
              })}
            </ul>
          </VendorCard>

          <VendorCard>
            <h3 className="text-sm font-semibold text-[#1f1d1a]">Send us a message</h3>
            <div className="mt-3 space-y-2">
              <input placeholder="Subject" maxLength={120} className="w-full h-10 px-3 text-sm rounded-md border border-[#E8E6DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B7C4A]/30 focus:border-[#6B7C4A]" />
              <textarea rows={4} placeholder="How can we help?" maxLength={1000} className="w-full px-3 py-2 text-sm rounded-md border border-[#E8E6DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B7C4A]/30 focus:border-[#6B7C4A]" />
              <div className="flex justify-end">
                <Button className="rounded-full bg-[#C4541A] hover:bg-[#a8470e] text-white">
                  <MessageSquare size={14} className="mr-1.5" /> Send message
                </Button>
              </div>
            </div>
          </VendorCard>
        </div>

        <div className="space-y-3">
          <VendorCard>
            <h3 className="text-sm font-semibold text-[#1f1d1a]">Contact us</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-center gap-3"><Phone size={14} className="text-[#6B7C4A]" /> <a className="text-[#1f1d1a] hover:text-[#C4541A]" href="tel:+914444223344">+91 44 4422 3344</a></li>
              <li className="flex items-center gap-3"><Mail size={14} className="text-[#6B7C4A]" /> <a className="text-[#1f1d1a] hover:text-[#C4541A]" href="mailto:vendors@thayilam.in">vendors@thayilam.in</a></li>
              <li className="flex items-center gap-3"><BookOpen size={14} className="text-[#6B7C4A]" /> <a className="text-[#1f1d1a] hover:text-[#C4541A]" href="#">Vendor handbook (PDF)</a></li>
            </ul>
          </VendorCard>

          <VendorCard className="bg-[#FAF7EE]">
            <div className="text-[11px] uppercase tracking-wider text-[#6B7C4A] mb-1">Support hours</div>
            <p className="text-sm text-[#1f1d1a] leading-relaxed">
              Mon–Sat, 9 am – 7 pm IST.<br />
              Closed on Sundays — even <em>amma</em> rests.
            </p>
          </VendorCard>
        </div>
      </div>
    </>
  );
}
