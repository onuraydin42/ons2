"use client";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import RevealHeading from "@/components/motion/RevealHeading";
import RevealImage from "@/components/motion/RevealImage";
import { product } from "@/data/product";

const STEPS = [
  { step: "01", label: "Field", note: "Single-estate soft winter wheat." },
  { step: "02", label: "Mash", note: "Milled and mashed in the same valley." },
  { step: "03", label: "Column", note: "Twelve passes, each one quieter." },
  { step: "04", label: "Quartz", note: "Filtered through Nordic sand." },
  { step: "05", label: "Water", note: "Glacial melt, down to 40% ABV." },
];

export default function CraftSection() {
  return (
    <section id="craft" className="relative bg-ink-900 py-28 sm:py-36 lg:py-44">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24 lg:px-16">
        <div>
          <Reveal as="p" className="text-[10px] font-light uppercase tracking-widest3 text-ice/50">
            Craft
          </Reveal>

          <RevealHeading
            text={product.craftSection.title}
            className="text-metal mt-6 text-balance font-display text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          />

          <Reveal
            as="p"
            delay={0.1}
            className="mt-8 max-w-xl text-pretty text-sm font-light leading-relaxed text-white/55 sm:text-base"
          >
            {product.craftSection.description}
          </Reveal>

          {/* The five steps arrive in order, which is the point of the list. */}
          <RevealGroup stagger={0.11} className="mt-14 border-t border-white/10">
            {STEPS.map((item) => (
              <RevealItem
                key={item.step}
                className="flex items-baseline gap-6 border-b border-white/10 py-5 sm:gap-10"
              >
                <span className="w-8 shrink-0 text-[10px] font-light tracking-widest2 text-ice/40">
                  {item.step}
                </span>
                <span className="w-24 shrink-0 text-xs font-light uppercase tracking-widest2 text-platinum/85 sm:w-32 sm:text-sm">
                  {item.label}
                </span>
                <span className="text-pretty text-xs font-light leading-relaxed text-white/45 sm:text-sm">
                  {item.note}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <RevealImage
          src="/images/editorial/lux.webp"
          alt=""
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="aspect-[3/4] w-full lg:sticky lg:top-28 lg:aspect-[3/4.4]"
        />
      </div>
    </section>
  );
}
