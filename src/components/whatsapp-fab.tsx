import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  const phone = "919840441994";
  const text = encodeURIComponent("Hi Thayilam! I'd like to place an order.");
  return (
    <a
      href={`https://wa.me/${phone}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-50 flex items-center gap-2 rounded-full bg-olive text-cream pl-4 pr-5 py-3 shadow-[4px_4px_0_var(--brown)] ink-border-thin hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--brown)] transition-all"
    >
      <MessageCircle size={20} strokeWidth={1.8} />
      <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">
        Order on WhatsApp
      </span>
    </a>
  );
}
