import { LeafIcon, SparkIcon } from "./icons";

const LETTERS = [
  {
    body: "The moment I opened the pack, the aroma itself reminded me of snacks made at my grandmother’s home. Fresh, crispy, and not overly oily like regular market snacks. Even the packing felt premium and hygienic.",
    name: "M Raghu Nandhan",
    place: "Hyderabad",
  },
  {
    body: "Thayilam brought back childhood memories with every bite. Freshly made, perfectly seasoned, and beautifully packed.",
    name: "K. Radha Saranya",
    place: "Hyderabad",
  },
  {
    body: "Thayilam feels less like ordering snacks online and more like receiving a homemade parcel from family. Authentic taste, fresh preparation, and excellent packaging made the whole experience special",
    name: "P Uma",
    place: "Hyderabad",
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
