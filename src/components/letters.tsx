import { LeafIcon, SparkIcon } from "./icons";

const LETTERS = [
  {
    body: "The mysore pak arrived wrapped in newspaper and brown thread. I cried a little. It tasted exactly like my Madurai summers.",
    name: "Lakshmi R.",
    place: "Bengaluru",
  },
  {
    body: "Sent a box to my son in Boston. He called me at 2am to say it tasted like Sunday morning at our old house.",
    name: "Mr. Subramaniam",
    place: "Mylapore",
  },
  {
    body: "The murukku is dangerous. I finished a 200g packet standing at the kitchen counter, watching the rain.",
    name: "Anjali D.",
    place: "Pune",
  },
];

export function Letters() {
  return (
    <section id="letter" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 text-olive mb-3">
            <SparkIcon size={18} />
            <span className="text-xs tracking-[0.25em] uppercase">Inland letters</span>
            <SparkIcon size={18} />
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-brown">
            Notes from the <span className="italic">post box.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {LETTERS.map((l, i) => (
            <figure
              key={l.name}
              className="paper ink-border-thin rounded-2xl p-7 flex flex-col"
              style={{ transform: `rotate(${[-1.2, 0.6, -0.4][i]}deg)` }}
            >
              <LeafIcon size={26} className="text-olive mb-3" />
              <blockquote className="font-display italic text-brown text-lg leading-relaxed flex-1">
                "{l.body}"
              </blockquote>
              <div className="dashed-rule my-5" />
              <figcaption className="flex items-baseline justify-between">
                <span className="font-script text-2xl text-rust">{l.name}</span>
                <span className="text-xs uppercase tracking-widest text-brown/60">
                  {l.place}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
