"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useSmoothScroll } from "@/components/SmoothScroll";
import { MARK_HEIGHT, MARK_SRC, MARK_WIDTH } from "@/lib/brand";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { CONTACT_EMAIL } from "@/lib/submitForm";

interface NavLink {
  label: string;
  href: string;
}

/* Left of the mark: the page itself, in the order you scroll through it. */
const SECTION_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Discover", href: "/#discover" },
  { label: "Collection", href: "/#collection" },
  { label: "Craft", href: "/#craft" },
];

/* Right of the mark: getting in touch, the small print, and press.
 * Nothing here is for sale, so there is still no call to action — and the
 * trade portal is never linked. */
const INFO_LINKS: NavLink[] = [
  { label: "Contact", href: "/#contact" },
  { label: "Terms", href: "/terms/" },
  { label: "Privacy", href: "/privacy/" },
  { label: "Media", href: "/media/" },
];

const ALL_LINKS = [...SECTION_LINKS, ...INFO_LINKS];

/** trailingSlash means a route can show up as "/terms" or "/terms/". */
const samePath = (a: string, b: string) => a.replace(/\/$/, "") === b.replace(/\/$/, "");

export default function Navbar() {
  const pathname = usePathname();
  const smooth = useSmoothScroll();
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

    const previous = document.body.style.overflow;
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
      document.body.style.overflow = previous;
      smooth.start();
      window.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
    };
  }, [menuOpen, smooth]);

  // A new page always arrives with the menu shut.
  useEffect(() => setMenuOpen(false), [pathname]);

  /**
   * In-page links glide; they never teleport.
   *
   * A link that points at the page already on screen is taken over and handed
   * to Lenis; a link to another page is left to the router. The scroll waits
   * two frames so that, when the phone menu is closing, Lenis has been started
   * again first — a stopped Lenis ignores scrollTo.
   */
  const onLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Let new-tab and new-window clicks through untouched.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    setMenuOpen(false);

    const [path, hash] = href.split("#");
    if (!samePath(path || "/", pathname)) return;

    event.preventDefault();
    const target = hash ? document.getElementById(hash) : null;
    if (hash && !target) return;

    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => smooth.scrollTo(target ?? 0)),
    );
  };

  /** Only real pages are ever "current" — sections are places on one page. */
  const isCurrent = (href: string) =>
    href !== "/" && !href.includes("#") && samePath(href, pathname);

  const brand = (
    <Link
      href="/"
      onClick={(event) => onLinkClick(event, "/")}
      className="flex shrink-0 items-center gap-2.5 sm:gap-3"
      aria-label="FLUID OUNCE — home"
    >
      <Image
        src={MARK_SRC}
        alt=""
        width={MARK_WIDTH}
        height={MARK_HEIGHT}
        priority
        className="h-[30px] w-auto"
      />
      {/* Never let the wordmark break — it would wrap under the mark. */}
      <span className="text-metal whitespace-nowrap text-[11px] font-medium uppercase tracking-widest2 sm:text-sm">
        Fluid Ounce
      </span>
    </Link>
  );

  const desktopList = (links: NavLink[], align: "start" | "end") => (
    <ul
      className={`flex items-center gap-7 xl:gap-10 ${align === "end" ? "justify-end" : "justify-start"}`}
    >
      {links.map((link) => {
        const current = isCurrent(link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={(event) => onLinkClick(event, link.href)}
              aria-current={current ? "page" : undefined}
              className={`group relative whitespace-nowrap text-[11px] font-light uppercase tracking-widest2 transition-colors duration-500 hover:text-platinum ${
                current ? "text-platinum" : "text-white/60"
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-1.5 left-0 h-px bg-ice/60 transition-all duration-500 ease-lux ${
                  current ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-700 ease-lux ${
          lifted ? "border-white/10 bg-ink-900/70 backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
      >
        <div className="pt-safe">
          {/* Wide screens: the mark centred, the page to its left, everything
              else to its right — the classic couture split, balanced four
              and four. */}
          <nav
            aria-label="Main"
            className="mx-auto hidden h-20 max-w-[92rem] grid-cols-[1fr_auto_1fr] items-center gap-8 px-10 lg:grid xl:px-14"
          >
            {desktopList(SECTION_LINKS, "start")}
            {brand}
            {desktopList(INFO_LINKS, "end")}
          </nav>

          {/* Phones and tablets: eight links do not fit in a row, so they live
              behind a menu. */}
          <div className="flex h-16 items-center justify-between px-5 sm:h-20 sm:px-10 lg:hidden">
            {brand}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="group flex items-center gap-3 py-2 pl-3 text-[10px] font-light uppercase tracking-widest2 text-white/70 transition-colors duration-500 hover:text-platinum sm:text-[11px]"
            >
              Menu
              <span aria-hidden className="flex w-6 flex-col items-end gap-[5px]">
                <span className="block h-px w-6 bg-current" />
                <span className="block h-px w-4 bg-current transition-all duration-500 ease-lux group-hover:w-6" />
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
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink-900/[0.97] backdrop-blur-xl lg:hidden"
          >
            <div className="pt-safe">
              <div className="flex h-16 items-center justify-between px-5 sm:h-20 sm:px-10">
                {brand}
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-2 pl-3 text-[10px] font-light uppercase tracking-widest2 text-white/70 transition-colors duration-500 hover:text-platinum sm:text-[11px]"
                >
                  Close
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1}
                    aria-hidden
                    className="h-5 w-5"
                  >
                    <path d="M6 6 L18 18 M18 6 L6 18" />
                  </svg>
                </button>
              </div>
            </div>

            <nav aria-label="Site" className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10">
              <ul>
                {ALL_LINKS.map((link, index) => {
                  const current = isCurrent(link.href);
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, y: 26 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.9, delay: 0.08 + index * 0.05, ease: EASE_OUT_EXPO }}
                    >
                      <Link
                        href={link.href}
                        onClick={(event) => onLinkClick(event, link.href)}
                        aria-current={current ? "page" : undefined}
                        className="group flex items-baseline gap-5 border-b border-white/[0.06] py-3"
                      >
                        <span className="w-6 shrink-0 text-[10px] font-light tracking-widest2 text-ice/40">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-display text-[2rem] leading-none transition-colors duration-500 sm:text-5xl ${
                            current ? "italic text-white" : "text-platinum/85 group-hover:text-white"
                          }`}
                        >
                          {link.label}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pb-safe border-t border-white/10 px-6 sm:px-10"
            >
              <div className="flex flex-col gap-2 py-6">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-xs font-light text-white/60 transition-colors duration-500 hover:text-platinum sm:text-sm"
                >
                  {CONTACT_EMAIL}
                </a>
                <p className="text-[10px] font-light uppercase tracking-widest2 text-white/30">
                  New York · New Jersey · Florida
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
