import { Link } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import {
  AntennaIcon,
  BottleIcon,
  WatchIcon,
  DabbaIcon,
  ColaIcon,
  BiscuitIcon,
  HeartIcon,
  ShieldIcon,
  HandsIcon,
  ChefIcon,
  ListIcon,
  CartIcon,
  ScooterIcon,
  SparkIcon,
  FlowerIcon,
  LeafIcon,
  RibbonIcon,
  MangoIcon,
} from "@/components/icons";


function RouteHead() {
  return (
    <Helmet>
      <title>{"Our Story — Thayilam | Taste the 90s again"}</title>
      <meta name="description" content="Thayilam brings back authentic homemade Indian snacks from the 90s — small-batch, hand-rolled, made by home chefs across India." />
      <meta property="og:title" content="Our Story — Thayilam" />
      <meta property="og:description" content="We're a small kitchen of memories — supporting home chefs, no preservatives, packed with nostalgia." />
    </Helmet>
  );
}

export default AboutPage;


const NOSTALGIA = [
  { Icon: AntennaIcon, label: "Doordarshan" },
  { Icon: BottleIcon, label: "Bisleri" },
  { Icon: WatchIcon, label: "HMT" },
  { Icon: DabbaIcon, label: "Steel dabba" },
  { Icon: ColaIcon, label: "Campa Cola" },
  { Icon: BiscuitIcon, label: "Parle-G" },
];

const VALUES = [
  {
    Icon: HeartIcon,
    title: "Made with love",
    body: "Every box leaves a kitchen, not a factory. Tied with thread, tasted by paati first.",
  },
  {
    Icon: ShieldIcon,
    title: "No preservatives",
    body: "If amma wouldn't put it in your tiffin, we won't put it in our box. Only ghee, jaggery and time.",
  },
  {
    Icon: HandsIcon,
    title: "Supporting home chefs",
    body: "Every order pays a real woman in a real kitchen. We take a thin slice — they keep the rest.",
  },
];

const STEPS = [
  { Icon: ChefIcon, title: "Vendor cooks fresh", body: "A home chef rolls a small batch that morning." },
  { Icon: ListIcon, title: "Lists on Thayilam", body: "Photos, weight, the whole recipe — up it goes." },
  { Icon: CartIcon, title: "You order", body: "Pick a dabba, pay on UPI, leave a sweet note." },
  { Icon: ScooterIcon, title: "Delivered home", body: "Packed in newspaper and thread, on its way." },
];

const VENDORS = [
  {
    name: "Lakshmi Paati",
    city: "Mylapore, Chennai",
    specialty: "Mysore Pak & Thattai",
    quote:
      "I have been frying murukku since my marriage in 1971. The recipe is from my mother. The kadai is the same.",
    initials: "LP",
  },
  {
    name: "Kavitha Akka",
    city: "T. Nagar, Chennai",
    specialty: "Ribbon Pakoda & Mixture",
    quote:
      "My children studied with this kadai. Now their children eat from it. Thayilam helped me reach Bombay.",
    initials: "KA",
  },
  {
    name: "Saraswati Amma",
    city: "Madurai",
    specialty: "Ghee Ladoo & Adhirasam",
    quote:
      "Festival days I wake at 4. The ghee has to sing before the besan goes in. No shortcut, no machine.",
    initials: "SA",
  },
];

function AboutPage() {
  return (
    <>
      <RouteHead />
      <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative paper py-20 md:py-32 overflow-hidden">
          <div className="absolute top-10 left-10 text-olive/40 hidden md:block">
            <FlowerIcon size={56} />
          </div>
          <div className="absolute bottom-10 right-10 text-rust/40 hidden md:block stamp-rotate-r">
            <RibbonIcon size={64} />
          </div>
          <div className="absolute top-16 right-20 text-olive/30 hidden md:block stamp-rotate-l">
            <MangoIcon size={48} />
          </div>

          <div className="mx-auto max-w-4xl px-6 text-center relative">
            <div className="flex items-center justify-center gap-3 text-olive mb-6">
              <SparkIcon size={20} />
              <span className="text-xs tracking-[0.3em] uppercase">Vol. I — Est. 1994</span>
              <SparkIcon size={20} />
            </div>

            <h1 className="font-display text-5xl md:text-7xl text-brown leading-[1.05]">
              Taste the
              <span className="font-script text-rust block text-7xl md:text-[8.5rem] my-2 leading-none">
                90s again.
              </span>
            </h1>

            <div className="dashed-rule my-10 mx-auto max-w-md" />

            <p className="text-lg md:text-xl text-brown/80 max-w-2xl mx-auto leading-relaxed">
              Before food courts, before delivery apps, before five-flavour-of-the-week —
              there was a steel dabba on the kitchen counter, a piece of newspaper for a
              wrapper, and a grandmother who knew exactly how much ghee was{" "}
              <em>"konjam jaasti"</em>. We're bringing all of that back, one small box at
              a time.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-rust text-cream text-sm uppercase tracking-[0.2em] hover:bg-rust/90 transition-colors"
              >
                Shop the dabba
              </Link>
              <a
                href="#vendors"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full ink-border-thin text-brown text-sm uppercase tracking-[0.2em] hover:bg-brown/5 transition-colors"
              >
                Meet our chefs
              </a>
            </div>
          </div>
        </section>

        {/* NOSTALGIA STRIP */}
        <section className="paper-sand border-y border-brown/30 py-14">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-10">
              <div className="text-xs tracking-[0.3em] uppercase text-olive">
                — Things we miss —
              </div>
              <h2 className="font-script text-4xl md:text-5xl text-brown mt-2">
                Sunday afternoons, frozen in ink.
              </h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-4">
              {NOSTALGIA.map(({ Icon, label }, i) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center text-brown"
                  style={{ transform: `rotate(${[-2, 1, -1, 2, -1.5, 1.5][i]}deg)` }}
                >
                  <div className="paper rounded-2xl ink-border-thin p-5 w-24 h-24 grid place-items-center mb-3">
                    <Icon size={56} className="text-brown" />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-brown/70">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MISSION / VALUES */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-14">
              <div className="text-xs tracking-[0.3em] uppercase text-olive mb-3">
                — Our mission —
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-brown">
                Three rules, taped to the
                <span className="italic"> kitchen wall.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {VALUES.map(({ Icon, title, body }, i) => (
                <div
                  key={title}
                  className="paper-sand ink-border rounded-3xl p-8 relative"
                  style={{ transform: `rotate(${[-0.6, 0.4, -0.3][i]}deg)` }}
                >
                  <div className="absolute inset-3 border border-dashed border-brown/30 rounded-2xl pointer-events-none" />
                  <div className="relative">
                    <div className="text-rust mb-4">
                      <Icon size={48} />
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-brown/60 mb-2">
                      Rule no. {i + 1}
                    </div>
                    <h3 className="font-display text-2xl text-brown mb-3">{title}</h3>
                    <div className="dashed-rule mb-3 w-16" />
                    <p className="text-brown/80 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="paper-sand border-y border-brown/30 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 text-olive mb-3">
                <SparkIcon size={18} />
                <span className="text-xs tracking-[0.3em] uppercase">How it works</span>
                <SparkIcon size={18} />
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-brown">
                From <span className="font-script text-rust">paati's kadai</span> to your
                doorstep.
              </h2>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-4">
              {/* Connecting dashed line on desktop */}
              <div
                className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--brown) 50%, transparent 50%)",
                  backgroundSize: "12px 1.5px",
                  backgroundRepeat: "repeat-x",
                }}
                aria-hidden
              />

              {STEPS.map(({ Icon, title, body }, i) => (
                <div key={title} className="relative flex flex-col items-center text-center">
                  <div className="paper ink-border rounded-full w-24 h-24 grid place-items-center mb-5 relative z-10">
                    <Icon size={44} className="text-rust" />
                  </div>
                  <div className="font-script text-3xl text-olive leading-none mb-1">
                    0{i + 1}
                  </div>
                  <h3 className="font-display text-xl text-brown mb-2">{title}</h3>
                  <p className="text-sm text-brown/75 max-w-[200px] leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VENDOR STORIES */}
        <section id="vendors" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-14">
              <div className="text-xs tracking-[0.3em] uppercase text-olive mb-3">
                — Inland letters —
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-brown">
                The hands behind the <span className="italic">dabba.</span>
              </h2>
              <p className="mt-4 text-brown/75 max-w-xl mx-auto">
                Three of the women whose kitchens make Thayilam possible. Every order
                you place pays them directly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {VENDORS.map((v, i) => (
                <article
                  key={v.name}
                  className="paper ink-border-thin rounded-2xl p-7 flex flex-col"
                  style={{ transform: `rotate(${[-0.8, 0.5, -0.4][i]}deg)` }}
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-16 w-16 rounded-full ink-border bg-sand grid place-items-center font-display text-2xl text-rust shrink-0">
                      {v.initials}
                    </div>
                    <div>
                      <div className="font-display text-xl text-brown leading-tight">
                        {v.name}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-brown/60 mt-1">
                        {v.city}
                      </div>
                    </div>
                  </div>

                  <div className="dashed-rule mb-4" />

                  <div className="flex items-center gap-2 text-olive mb-3">
                    <LeafIcon size={16} />
                    <span className="text-xs uppercase tracking-widest">
                      Specialty
                    </span>
                  </div>
                  <div className="font-script text-2xl text-rust mb-4">
                    {v.specialty}
                  </div>

                  <blockquote className="font-display italic text-brown/85 text-base leading-relaxed flex-1 relative pl-4">
                    <span className="absolute -left-1 -top-2 font-script text-5xl text-rust/40 leading-none">
                      "
                    </span>
                    {v.quote}
                    <span className="font-script text-3xl text-rust/40 leading-none">
                      "
                    </span>
                  </blockquote>
                </article>
              ))}
            </div>

            <div className="mt-14 text-center">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-rust text-cream text-sm uppercase tracking-[0.2em] hover:bg-rust/90 transition-colors"
              >
                Shop from our chefs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFab />
    </div>
    </>
  );
}
