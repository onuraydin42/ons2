"use client";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import RevealHeading from "@/components/motion/RevealHeading";
import SocialIcons from "@/components/SocialIcons";
import { CONTACT } from "@/data/site";

/* A text optical size rather than the display cut the size would pick: the
 * hairlines — the hyphens in the phone number above all — stay solid enough
 * to read at a glance. */
const LINE =
  "py-1 font-display text-[clamp(1.4rem,7.4vw,1.75rem)] leading-tight text-ink transition-colors duration-500 [font-variation-settings:'opsz'_28] hover:text-ivory active:text-ivory sm:text-[2.6rem] lg:text-[2.9rem] short:text-[1.75rem]";

/** Contact — the live site's three lines: email, phone, New York. */
export default function ContactSection() {
  return (
    <section id="contact" className="relative scroll-mt-16 bg-linen py-28 sm:py-36 lg:py-40 short:py-20">
      <div className="safe-gutter mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 short:grid-cols-[0.8fr_1.2fr] short:gap-10">
          <div>
            <RevealHeading
              text={CONTACT.title}
              className="font-display text-[2.6rem] font-normal leading-none tracking-tight text-ink sm:text-5xl lg:text-[3.9rem]"
            />
            <Reveal delay={0.05}>
              <span aria-hidden className="mt-8 block h-px w-16 bg-gold-light" />
            </Reveal>
            <Reveal delay={0.12} className="mt-10">
              <SocialIcons />
            </Reveal>
          </div>

          <RevealGroup stagger={0.1} className="border-t border-ink/15">
            <RevealItem className="grid gap-2 border-b border-ink/15 py-7 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-8 sm:py-8 short:py-4 sm:short:grid-cols-[4.5rem_1fr] sm:short:gap-4">
              <span className="text-[12px] uppercase tracking-widest2 text-gold-deep">{CONTACT.emailLabel}</span>
              <a href={`mailto:${CONTACT.email}`} className={LINE}>
                {CONTACT.email}
              </a>
            </RevealItem>
            <RevealItem className="grid gap-2 border-b border-ink/15 py-7 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-8 sm:py-8 short:py-4 sm:short:grid-cols-[4.5rem_1fr] sm:short:gap-4">
              <span className="text-[12px] uppercase tracking-widest2 text-gold-deep">{CONTACT.phoneLabel}</span>
              <a href={`tel:${CONTACT.phoneE164}`} className={LINE}>
                {CONTACT.phone}
              </a>
            </RevealItem>
            <RevealItem className="border-b border-ink/15 py-7 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-8 sm:py-8 short:py-4 sm:short:grid-cols-[4.5rem_1fr] sm:short:gap-4">
              <span aria-hidden className="hidden sm:block" />
              <p className="font-display text-[clamp(1.4rem,7.4vw,1.75rem)] italic leading-tight text-ink sm:text-[2.6rem] lg:text-[2.9rem] short:text-[1.75rem]">
                {CONTACT.city}
              </p>
            </RevealItem>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
