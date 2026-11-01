"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import SocialIcons from "@/components/SocialIcons";
import { useSmoothScroll } from "@/components/SmoothScroll";
import { BRAND, CONTACT, NAV_LEFT, NAV_RIGHT, type NavLink } from "@/data/site";
import { MARK_HEIGHT, MARK_INK_SRC, MARK_WIDTH } from "@/lib/brand";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { samePath, useGlideLink } from "@/lib/useGlideLink";

const ALL_LINKS = [...NAV_LEFT, ...NAV_RIGHT];

/**
 * The live site's navigation — Home, Discover, Contact to the left of the
 * mark; Terms, Privacy and Media (the brand's Instagram) to the right. The
 * trade portal is never linked.
 */
export default function Navbar() {
  const pathname = usePathname();
  const smooth = useSmoothScroll();
  const glide = useGlideLink();
  const [lifted, setLifted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* While the phone menu is open the page underneath is frozen — Lenis has to
   * be stopped directly, overflow alone does not stop it. Escape closes it,
   * and so does the viewport growing past the point where the menu exists. */
  useEffect(() => {
    if (!menuOpen) return;

    // On <html> as well as <body>: mobile Safari only honours it there.
    const root = document.documentElement;
    const previous = { html: root.style.overflow, body: document.body.style.overflow };
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    smooth.stop();
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => {
      if (wide.matches) setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = previous.html;
      document.body.style.overflow = previous.body;
      smooth.start();
      window.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
    };
  }, [menuOpen, smooth]);

  // A new page always arrives with the menu shut.
  useEffect(() => setMenuOpen(false), [pathname]);

  /* Every link shuts the phone menu; in-page links then glide (useGlideLink),
   * and the Instagram link opens in a new tab. */
  const onLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, link: NavLink) => {
    setMenuOpen(false);
    if (!link.external) glide(event, link.href);
  };

  /** Only real pages are ever "current" — sections are places on one page. */
  const isCurrent = (link: NavLink) =>
    !link.external && link.href !== "/" && !link.href.includes("#") && samePath(link.href, pathname);

  const anchor = (link: NavLink, className: string, children: React.ReactNode) =>
    link.external ? (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => onLinkClick(event, link)}
        className={className}
      >
        {children}
      </a>
    ) : (
      <Link
        href={link.href}
        onClick={(event) => onLinkClick(event, link)}
        aria-current={isCurrent(link) ? "page" : undefined}
        className={className}
      >
        {children}
      </Link>
    );

  const brand = (
    <Link
      href="/"
      onClick={(event) => onLinkClick(event, { label: "Home", href: "/" })}
      className="flex shrink-0 items-center gap-3"
      aria-label={`${BRAND} — home`}
    >
      <Image
        src={MARK_INK_SRC}
        alt=""
        width={MARK_WIDTH}
        height={MARK_HEIGHT}
        priority
        className="h-[50px] w-auto sm:h-[64px] short:h-[44px]"
      />
      {/* Never let the wordmark break — it would wrap under the mark. */}
      <span className="whitespace-nowrap font-wordmark text-[12.5px] font-[450] uppercase tracking-[0.34em] text-ink sm:text-[14px]">
        {BRAND}
      </span>
    </Link>
  );

  const desktopList = (links: NavLink[], align: "start" | "end") => (
    <ul className={`flex items-center gap-8 xl:gap-11 ${align === "end" ? "justify-end" : "justify-start"}`}>
      {links.map((link) => {
        const current = isCurrent(link);
        return (
          <li key={link.label}>
            {anchor(
              link,
              // The stroke is the "very slightly bolder": the text face comes only
              // in 400 and 700, and a hair of outline sits between the two.
              "group relative whitespace-nowrap text-[11.5px] uppercase tracking-widest2 text-ink [-webkit-text-stroke:0.22px_currentColor]",
              <>
                {link.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-ink transition-all duration-500 ease-lux ${
                    current ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </>,
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-700 ease-lux ${
          lifted
            ? "border-ink/10 bg-porcelain/95 fine:bg-porcelain/85 fine:backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="pt-safe">
          {/* Wide screens: the mark centred, three links either side. */}
          <nav
            aria-label="Main"
            className="mx-auto hidden h-20 max-w-[92rem] grid-cols-[1fr_auto_1fr] items-center gap-10 px-10 lg:grid xl:px-14"
          >
            {desktopList(NAV_LEFT, "start")}
            {brand}
            {desktopList(NAV_RIGHT, "end")}
          </nav>

          {/* Phones and tablets: the links live behind a menu. */}
          <div className="safe-gutter flex h-16 items-center justify-between px-5 sm:h-20 sm:px-10 lg:hidden short:h-14">
            {brand}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label="Open menu"
              className="group flex h-11 w-11 items-center justify-end text-ink"
            >
              <span aria-hidden className="flex w-7 flex-col items-end gap-[6px]">
                <span className="block h-px w-7 bg-current" />
                <span className="block h-px w-5 bg-current transition-all duration-500 ease-lux group-hover:w-7" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Rendered beside the header, not inside it: the header's
          backdrop-filter would otherwise become the containing block for this
          fixed layer and trap it inside an 80px strip. */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="site-menu"
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-porcelain lg:hidden"
          >
            <div className="pt-safe">
              <div className="safe-gutter flex h-16 items-center justify-between px-5 sm:h-20 sm:px-10 short:h-14">
                {brand}
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-end text-ink transition-opacity duration-500 hover:opacity-60"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden className="h-6 w-6">
                    <path d="M5 5 L19 19 M19 5 L5 19" />
                  </svg>
                </button>
              </div>
            </div>

            <nav aria-label="Site" className="safe-gutter flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 short:py-2">
              {/* Two columns on a phone on its side: six rows would not fit. */}
              <ul className="short:grid short:grid-cols-2 short:gap-x-10">
                {ALL_LINKS.map((link, index) => {
                  const current = isCurrent(link);
                  return (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, y: 26 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.9, delay: 0.08 + index * 0.05, ease: EASE_OUT_EXPO }}
                    >
                      {anchor(
                        link,
                        "group flex items-baseline gap-5 border-b border-ink/10 py-4 short:py-2.5",
                        <>
                          <span className="w-7 shrink-0 text-[12px] tracking-widest2 text-gold-deep">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`font-display text-[1.9rem] leading-none transition-colors duration-500 sm:text-[2.6rem] short:text-[1.5rem] ${
                              current ? "italic text-ink" : "text-ink-soft group-hover:text-ink"
                            }`}
                          >
                            {link.label}
                          </span>
                        </>,
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pb-safe safe-gutter border-t border-ink/10 px-6 sm:px-10"
            >
              <div className="flex flex-wrap items-end justify-between gap-6 py-6 short:items-center short:py-2">
                <div className="flex flex-col text-[14px] text-ink-soft short:flex-row short:items-center short:gap-5">
                  <a href={`mailto:${CONTACT.email}`} className="py-1.5 transition-colors duration-500 hover:text-ink">
                    {CONTACT.email}
                  </a>
                  <a href={`tel:${CONTACT.phoneE164}`} className="py-1.5 transition-colors duration-500 hover:text-ink">
                    {CONTACT.phone}
                  </a>
                  <span className="mt-1.5 text-[12px] uppercase tracking-widest2 text-ink-muted short:mt-0">{CONTACT.city}</span>
                </div>
                <SocialIcons />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
