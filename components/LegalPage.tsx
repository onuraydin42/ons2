import { Fragment } from "react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Reveal } from "@/components/motion/Reveal";
import RevealHeading from "@/components/motion/RevealHeading";
import type { LegalSection } from "@/data/legal";
import { CONTACT_EMAIL } from "@/lib/submitForm";

/** Renders `{email}` as a mailto link; everything else is plain text. */
function Paragraph({ text }: { text: string }) {
  const parts = text.split("{email}");
  return (
    <p className="mt-4 text-pretty text-sm font-light leading-relaxed text-white/60 sm:text-base">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? (
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-ice/80 underline decoration-white/20 underline-offset-4 transition-colors duration-500 hover:text-platinum"
            >
              {CONTACT_EMAIL}
            </a>
          ) : null}
        </Fragment>
      ))}
    </p>
  );
}

/**
 * Terms and Privacy share this layout: an editorial header, then numbered
 * sections set in a narrow reading measure.
 */
export default function LegalPage({
  kicker,
  title,
  updated,
  sections,
}: {
  kicker: string;
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main id="top" className="bg-ink-900">
      <Navbar />

      <article className="relative mx-auto max-w-3xl px-6 pb-28 pt-36 sm:px-10 sm:pb-36 sm:pt-44">
        <Reveal as="p" className="text-[10px] font-light uppercase tracking-widest3 text-ice/50">
          {kicker}
        </Reveal>

        <RevealHeading
          as="h1"
          text={title}
          className="text-metal mt-6 font-display text-5xl font-normal tracking-tight sm:text-6xl lg:text-7xl"
        />

        <Reveal
          as="p"
          delay={0.1}
          className="mt-6 text-[10px] font-light uppercase tracking-widest2 text-white/35 sm:text-[11px]"
        >
          Last updated {updated}
        </Reveal>

        <div className="mt-16 border-t border-white/10">
          {sections.map((section, index) => (
            <Reveal
              key={section.heading}
              as="section"
              className="grid gap-3 border-b border-white/10 py-10 sm:grid-cols-[3.5rem_1fr] sm:gap-6"
            >
              <span className="pt-2 text-[10px] font-light tracking-widest2 text-ice/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-display text-2xl font-normal text-platinum sm:text-3xl">
                  {section.heading}
                </h2>
                {section.body.map((paragraph) => (
                  <Paragraph key={paragraph} text={paragraph} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </article>

      <Footer />
    </main>
  );
}
