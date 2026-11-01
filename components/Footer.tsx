"use client";

import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import SocialIcons from "@/components/SocialIcons";
import { ALT, FOOTER_LEGAL, FOOTER_LINKS, copyright } from "@/data/site";
import { LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH } from "@/lib/brand";
import { useGlideLink } from "@/lib/useGlideLink";

const LINK =
  "inline-block py-2.5 text-[12px] uppercase tracking-widest2 text-ivory transition-colors duration-500 hover:text-gold-light active:text-gold-light";

const LEGAL_LINK =
  "py-2.5 text-ivory underline decoration-gold-light/60 underline-offset-4 transition-colors duration-500 hover:text-gold-light active:text-gold-light";

/**
 * The live footer: its four links, the two profiles, the small print. The page
 * closes on char, the one ground dark enough to carry the lockup in its foil.
 */
export default function Footer() {
  const glide = useGlideLink();

  return (
    <footer className="relative overflow-hidden bg-char [&_:focus-visible]:outline-gold-light">
      <div className="safe-gutter relative mx-auto max-w-7xl px-6 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] pt-20 sm:px-10 sm:pt-24 lg:px-16">
        <Reveal className="flex flex-col items-center text-center">
          <Image src={LOGO_SRC} alt={ALT.logo} width={LOGO_WIDTH} height={LOGO_HEIGHT} className="h-28 w-auto sm:h-32" />

          <nav aria-label="Footer" className="mt-14">
            <ul className="flex flex-wrap items-center justify-center gap-x-9 gap-y-1">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} onClick={(event) => glide(event, link.href)} className={LINK}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <SocialIcons tone="dark" className="mt-10 justify-center" />

          <p className="mx-auto mt-12 max-w-3xl text-pretty text-[13.5px] leading-[1.85] text-ivory/75">
            {FOOTER_LEGAL.text}{" "}
            <a
              href={FOOTER_LEGAL.links[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className={LEGAL_LINK}
            >
              {FOOTER_LEGAL.links[0].label}
            </a>{" "}
            and{" "}
            <a
              href={FOOTER_LEGAL.links[1].href}
              target="_blank"
              rel="noopener noreferrer"
              className={LEGAL_LINK}
            >
              {FOOTER_LEGAL.links[1].label}
            </a>
            .
          </p>
        </Reveal>

        <div className="mt-14 border-t border-ivory/10 pt-8 text-center">
          <p suppressHydrationWarning className="text-[12.5px] tracking-wide text-ivory/60">
            {copyright(new Date().getFullYear())}
          </p>
        </div>
      </div>
    </footer>
  );
}
