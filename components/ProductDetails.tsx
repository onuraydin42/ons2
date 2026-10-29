"use client";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import RevealHeading from "@/components/motion/RevealHeading";
import RevealImage from "@/components/motion/RevealImage";
import { product } from "@/data/product";

/* The studio plate is shot on black, so its sides already disappear into the
 * page. Only the lit floor along the bottom would show as an edge, so the fade
 * runs top and bottom and leaves the boxes either side whole. */
const FEATHER = "linear-gradient(180deg, transparent 0%, #000 7%, #000 76%, transparent 100%)";

export default function ProductDetails() {
  return (
    <section id="discover" className="relative bg-ink-900 py-28 sm:py-36 lg:py-44">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 sm:px-10 lg:grid-cols-2 lg:gap-24 lg:px-16">
        {/* The box matches the plate's own 3:2 so the image fills it exactly;
            a mask only lines up with the picture when the two share a shape. */}
        <RevealImage
          src={product.detailsSection.image}
          alt={product.detailsSection.imageAlt}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[3/2] w-full"
          imageClassName="object-cover"
          style={{ maskImage: FEATHER, WebkitMaskImage: FEATHER }}
        />

        <div>
          <Reveal as="p" className="text-[10px] font-light uppercase tracking-widest3 text-ice/50">
            {product.name}
          </Reveal>

          <RevealHeading
            text={product.detailsSection.title}
            className="text-metal mt-6 text-balance font-display text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          />

          <Reveal
            as="p"
            delay={0.1}
            className="mt-8 max-w-xl text-pretty text-sm font-light leading-relaxed text-white/55 sm:text-base"
          >
            {product.detailsSection.description}
          </Reveal>

          {/* A grid rather than a wrapping row: three columns always break
              cleanly, where a flex row strands a leading rule on the next line. */}
          <RevealGroup
            stagger={0.1}
            delayChildren={0.15}
            className="mt-10 grid grid-cols-1 gap-y-3 sm:grid-cols-3 sm:gap-x-6"
          >
            {product.features.map((feature) => (
              <RevealItem
                key={feature}
                as="p"
                className="border-t border-white/10 pt-3 text-[10px] font-light uppercase leading-relaxed tracking-widest2 text-white/45"
              >
                {feature}
              </RevealItem>
            ))}
          </RevealGroup>

          <RevealGroup
            stagger={0.12}
            delayChildren={0.1}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-10"
          >
            {product.stats.map((stat) => (
              <RevealItem key={stat.label}>
                <p className="text-[9px] font-light uppercase tracking-widest2 text-white/35 sm:text-[10px]">
                  {stat.label}
                </p>
                <p className="text-metal mt-3 font-display text-4xl tracking-tight sm:text-5xl">
                  {stat.val}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
