"use client";

import Link from "next/link";

import CharGround from "@/components/CharGround";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import RevealHeading from "@/components/motion/RevealHeading";
import RevealImage from "@/components/motion/RevealImage";
import { ALT, WHOLESALE } from "@/data/site";
import { useGlideLink } from "@/lib/useGlideLink";

const LABEL = "text-[12px] uppercase tracking-widest2 text-gold-light";

/**
 * The brochure's wholesale page, word for word: who the bottle is for, who already
 * pours it, and where it can be had. What it costs is a conversation, so the last
 * thing here is the way to start one.
 */
export default function Wholesale() {
  const glide = useGlideLink();

  return (
    <CharGround id="wholesale" aria-label={WHOLESALE.title} className="scroll-mt-16 overflow-hidden py-24 sm:py-32 lg:py-40 short:py-16">
      <div className="safe-gutter mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24 short:grid-cols-[1.2fr_0.8fr] short:gap-8">
          <div>
            <RevealHeading
              text={WHOLESALE.title}
              className="text-balance font-display text-[clamp(2.3rem,10.5vw,3rem)] font-normal leading-[1.02] tracking-tight text-ivory sm:text-[3.6rem] lg:text-[4.4rem] short:text-[2.2rem]"
            />
            <Reveal delay={0.05}>
              <span aria-hidden className="mt-8 block h-px w-16 bg-gold short:mt-4" />
            </Reveal>
            <RevealGroup stagger={0.08} className="mt-8 max-w-2xl space-y-5 short:mt-4 short:space-y-3">
              {WHOLESALE.paragraphs.map((text) => (
                <RevealItem key={text} as="p" className="text-pretty text-[15.5px] leading-[1.85] text-ivory/85 sm:text-[16.5px] short:text-[14px] short:leading-[1.65]">
                  {text}
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <div className="mx-auto w-full max-w-[17rem] lg:max-w-[20rem] short:max-w-[10rem]">
            <RevealImage src="/images/brochure/retail.webp" alt={ALT.retail} sizes="(min-width: 1024px) 20rem, 17rem" className="aspect-[366/520] w-full" />
          </div>
        </div>

        {/* The partners, as a wall of names rather than a row of logos. */}
        <div className="mt-16 border-t border-ivory/15 pt-10 lg:mt-24 lg:pt-14 short:mt-10 short:pt-6">
          <Reveal as="h3" className={`${LABEL} font-normal`}>
            {WHOLESALE.partnersLabel}
          </Reveal>
          <Reveal delay={0.06}>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-display text-[clamp(1.25rem,5.2vw,1.7rem)] leading-snug text-ivory sm:gap-x-7 sm:text-[2rem] lg:text-[2.4rem] short:text-[1.3rem]">
              {WHOLESALE.partners.map((partner, index) => (
                <li key={partner} className="flex items-center gap-5 sm:gap-7">
                  <span>{partner}</span>
                  {index < WHOLESALE.partners.length - 1 ? <span aria-hidden className="h-1 w-1 rotate-45 bg-gold" /> : null}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 border-t border-ivory/15 pt-10 sm:grid-cols-[1fr_auto] lg:mt-20 lg:gap-16 lg:pt-14 short:mt-10 short:grid-cols-[1fr_auto] short:gap-6 short:pt-6">
          <Reveal>
            <h3 className={`${LABEL} font-normal`}>{WHOLESALE.channelsLabel}</h3>
            <ul className="mt-5 space-y-1.5 text-[15.5px] text-ivory/90 sm:text-[16.5px]">
              {WHOLESALE.channels.map((state) => (
                <li key={state}>{state}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.06} className="sm:self-end short:self-end">
            <Link
              href="/#contact"
              onClick={(event) => glide(event, "/#contact")}
              className="inline-block border border-gold-light/70 px-8 py-4 text-[12px] uppercase tracking-widest2 text-gold-light transition-colors duration-500 ease-lux hover:bg-gold-light hover:text-ink active:bg-gold-light active:text-ink short:py-3"
            >
              {WHOLESALE.cta}
            </Link>
          </Reveal>
        </div>
      </div>
    </CharGround>
  );
}
