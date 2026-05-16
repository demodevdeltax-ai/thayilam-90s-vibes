import { FlowerIcon } from "./icons";
import toranImg from "@/assets/border-toran.png";

export function Visit() {
  const features = [
    {
      label: "Freshly Prepared Daily",
      value:
        "Small-batch snacks made with authentic recipes and honest ingredients.",
    },
    {
      label: "Taste That Feels Like Home",
      value:
        "Traditional flavors inspired by the kitchens we grew up in.",
    },
    {
      label: "No Stock Policy",
      value:
        "All orders are Freshly prepared today. Packed today. Delivered today.",
    },
  ];

  return (
    <section
      id="visit"
      className="relative overflow-hidden py-16 sm:py-20 md:py-28 paper-sand border-y border-brown/20"
    >
      {/* Anchor */}
      <span id="contact" className="block -mt-24 pt-24" aria-hidden />

      {/* Top Border Decoration */}
      <img
        src={toranImg}
        alt=""
        aria-hidden
        className="absolute top-0 left-0 w-full h-14 sm:h-16 md:h-20 object-cover object-top opacity-70 pointer-events-none select-none"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-8 relative z-10">
        {/* Top Label */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-olive mb-5 md:mb-6 mt-8 md:mt-10">
          <FlowerIcon size={18} />
          <span className="text-[10px] sm:text-xs tracking-[0.22em] uppercase text-center">
            Made for Evenings Together
          </span>
          <FlowerIcon size={18} />
        </div>

        {/* Heading */}
        <div className="text-center max-w-5xl mx-auto">
          <h2 className="font-display text-3xl leading-tight sm:text-5xl md:text-6xl text-brown">
            Best enjoyed with chai,
            <br className="hidden sm:block" />
            conversations
          </h2>

          <div className="mt-3 text-[10px] sm:text-xs tracking-[0.28em] uppercase text-brown/70">
            with
          </div>

          <div className="font-script text-rust text-5xl sm:text-6xl md:text-7xl leading-none mt-2">
            people you love
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {features.map(({ label, value }) => (
            <div
              key={label}
              className="
                paper 
                ink-border-thin 
                rounded-2xl 
                p-6 md:p-7
                min-h-[220px]
                flex 
                flex-col 
                justify-center
                transition-transform 
                duration-300
                hover:-translate-y-1
              "
            >
              <h3
                className="
                  text-sm 
                  sm:text-[15px]
                  md:text-[16px]
                  font-bold 
                  uppercase 
                  tracking-wide 
                  text-red-700 
                  leading-snug
                "
              >
                {label}
              </h3>

              <p
                className="
                  mt-4 
                  text-base 
                  md:text-lg 
                  leading-relaxed 
                  text-brown/80
                "
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}