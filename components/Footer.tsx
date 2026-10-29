"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { cocktails } from "@/data/cocktails";
import { LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH } from "@/lib/brand";
import { CONTACT_EMAIL, submitForm, type SubmitState } from "@/lib/submitForm";

const COLUMN_HEADING =
  "text-[9px] font-light uppercase tracking-widest2 text-white/30 sm:text-[10px]";
const COLUMN_LINK =
  "text-xs font-light text-white/55 transition-colors duration-500 hover:text-platinum sm:text-sm";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || state === "submitting") return;

    setState("submitting");
    try {
      await submitForm({
        subject: "FLUID OUNCE — newsletter signup",
        fields: { Email: email.trim(), Source: "Footer signup" },
      });
      setState("success");
      setEmail("");
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <p className="text-xs font-light leading-relaxed text-ice/70 sm:text-sm">
        You’re on the list. Nothing crowded, a few times a year.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex items-center border-b border-white/15 transition-colors duration-500 focus-within:border-ice/50">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter email address"
          aria-label="Email address"
          className="w-full bg-transparent py-2.5 text-xs font-light text-platinum outline-none placeholder:text-white/35 sm:text-sm"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          aria-label="Sign up"
          className={`shrink-0 pl-4 text-[10px] font-light uppercase tracking-widest2 text-white/45 transition-colors duration-500 hover:text-platinum disabled:cursor-not-allowed ${
            state === "submitting" ? "animate-fo-pulse" : ""
          }`}
        >
          {state === "submitting" ? "Sending" : "Join"}
        </button>
      </div>

      {state === "error" ? (
        <p className="mt-3 text-[11px] font-light leading-relaxed text-white/45">
          That didn’t send. Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-ice/70 underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>{" "}
          instead.
        </p>
      ) : null}
    </form>
  );
}

const LEGAL_LINKS = [
  { label: "Terms", href: "/terms/" },
  { label: "Privacy", href: "/privacy/" },
  { label: "Media", href: "/media/" },
];

export default function Footer() {
  /* On the home page the cocktail links stay plain hash anchors: the
   * Collection listens for the hashchange, selects the drink and glides to
   * it. Anywhere else they route home first and the Collection picks the hash
   * up when it mounts. */
  const onHome = usePathname() === "/";

  return (
    <footer className="relative overflow-hidden bg-neutral-950">
      {/* Atmosphere only — sits far enough back to read as texture. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.16]">
        <Image
          src="/images/editorial/lux2.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* The source plate is a bright daylight photo, so it still needs settling
          into the dark — but only enough that the columns stay first to read.
          The scrim is what controls that, which is why the plate itself can sit
          at 16% rather than being hidden at 8%. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.62) 55%, rgba(10,10,10,0.85) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-24 sm:px-10 sm:pt-28 lg:px-16">
        <Reveal>
          <Image
            src={LOGO_SRC}
            alt="FLUID OUNCE"
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            className="h-28 w-auto sm:h-32"
          />
        </Reveal>

        <RevealGroup
          stagger={0.1}
          delayChildren={0.08}
          className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 sm:mt-20 lg:grid-cols-4 lg:gap-x-12"
        >
          <RevealItem>
            <h3 className={COLUMN_HEADING}>Brand</h3>
            <p className="mt-5 max-w-xs text-pretty text-xs font-light leading-relaxed text-white/50 sm:text-sm">
              The measure of perfection. 12X distilled, glacial water, zero additives — made in
              one valley, from one grain.
            </p>
          </RevealItem>

          <RevealItem>
            <h3 className={COLUMN_HEADING}>Collection</h3>
            <ul className="mt-5 space-y-3">
              {cocktails.map((cocktail) => (
                <li key={cocktail.id}>
                  {onHome ? (
                    <a
                      href={`#${cocktail.id}`}
                      onClick={() => {
                        // A click on the hash the URL already holds — after a
                        // refresh on /#vesper, say — fires no hashchange, so
                        // raise one by hand and the Collection still answers.
                        if (window.location.hash === `#${cocktail.id}`) {
                          window.dispatchEvent(new HashChangeEvent("hashchange"));
                        }
                      }}
                      className={COLUMN_LINK}
                    >
                      {cocktail.name}
                    </a>
                  ) : (
                    <Link href={`/#${cocktail.id}`} className={COLUMN_LINK}>
                      {cocktail.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </RevealItem>

          <RevealItem id="contact" className="scroll-mt-24">
            <h3 className={COLUMN_HEADING}>Contact</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={COLUMN_LINK}>
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="text-xs font-light leading-relaxed text-white/50 sm:text-sm">
                New York · New Jersey · Florida
              </li>
            </ul>
          </RevealItem>

          <RevealItem>
            <h3 className={COLUMN_HEADING}>Newsletter</h3>
            <div className="mt-5">
              <Newsletter />
            </div>
          </RevealItem>
        </RevealGroup>

        <Reveal
          delay={0.1}
          className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-[10px] font-light leading-relaxed tracking-wide text-white/35 sm:text-[11px]">
            Please drink responsibly. You must be of legal drinking age to enter.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ul className="flex items-center gap-5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[10px] font-light uppercase tracking-widest2 text-white/40 transition-colors duration-500 hover:text-platinum sm:text-[11px]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p
              suppressHydrationWarning
              className="text-[10px] font-light tracking-widest2 text-white/25 sm:text-[11px]"
            >
              © {new Date().getFullYear()} Fluid Ounce
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
