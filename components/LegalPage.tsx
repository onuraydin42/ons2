import Footer from "@/components/Footer";
import LegalContents from "@/components/LegalContents";
import Navbar from "@/components/Navbar";
import { Reveal } from "@/components/motion/Reveal";
import RevealHeading from "@/components/motion/RevealHeading";
import { CONTENTS_LABEL, type LegalDocument } from "@/data/legal";

/**
 * Terms & Conditions and Privacy Policy share this layout, laid out as the
 * live pages are: eyebrow, title, date, introduction, contents, then the
 * sections in a narrow reading measure, ending on the document's own line.
 */
export default function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <main id="top" className="bg-porcelain">
      <Navbar />

      <article className="safe-gutter relative mx-auto max-w-3xl px-6 pb-28 pt-36 sm:px-10 sm:pb-36 sm:pt-44 short:pt-24">
        <Reveal as="p" className="text-[12px] uppercase tracking-widest3 text-gold-deep">
          {document.eyebrow}
        </Reveal>

        <RevealHeading
          as="h1"
          text={document.title}
          className="mt-6 text-balance font-display text-[2.6rem] font-normal leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[3.9rem]"
        />

        <Reveal as="p" delay={0.1} className="mt-6 text-[13.5px] tracking-wide text-ink-muted">
          {document.updated}
        </Reveal>

        <Reveal
          as="p"
          delay={0.15}
          className="mt-10 border-y border-ink/20 py-7 text-pretty text-[15.5px] leading-[1.85] text-ink-soft sm:text-[16.5px]"
        >
          {document.intro}
        </Reveal>

        <Reveal delay={0.2} className="mt-12">
          <LegalContents
            label={CONTENTS_LABEL}
            entries={document.sections.map((section) => ({ id: section.id, label: section.heading }))}
          />
        </Reveal>

        <div className="mt-16 border-t border-ink/20">
          {document.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 border-b border-ink/20 py-10 sm:py-12">
              <h2 className="font-display text-[1.45rem] font-normal leading-snug text-ink sm:text-[1.75rem]">
                {section.heading}
              </h2>
              {section.blocks.map((block, index) =>
                block.type === "p" ? (
                  <p key={index} className="mt-5 text-pretty text-[15px] leading-[1.85] text-ink-soft sm:text-[16px]">
                    {block.text}
                  </p>
                ) : (
                  <ul key={index} className="mt-5 space-y-3">
                    {block.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-4 text-pretty text-[15px] leading-[1.8] text-ink-soft sm:text-[16px]"
                      >
                        <span aria-hidden className="mt-[0.75em] h-1 w-1 shrink-0 rotate-45 bg-gold-deep" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}
        </div>

        <p className="mt-12 text-center text-[13.5px] tracking-wide text-ink-muted">{document.footer}</p>
      </article>

      <Footer />
    </main>
  );
}
