"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";

import { useSmoothScroll } from "@/components/SmoothScroll";

/** trailingSlash means a route can show up as "/terms" or "/terms/". */
export const samePath = (a: string, b: string) => a.replace(/\/$/, "") === b.replace(/\/$/, "");

/**
 * In-page links glide; they never teleport.
 *
 * Returns a click handler for links. A link that points at the page already
 * on screen is taken over and handed to Lenis; a link to another page is left
 * to the router, and a cross-page section link (/#contact) lands on its
 * section when that page mounts. The scroll waits two frames so that, when a
 * menu is closing, Lenis has been started again first — a stopped Lenis
 * ignores scrollTo.
 */
export function useGlideLink() {
  const pathname = usePathname();
  const smooth = useSmoothScroll();

  return useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Let new-tab and new-window clicks through untouched.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }

      const [path, hash] = href.split("#");
      if (!samePath(path || "/", pathname)) return;

      event.preventDefault();
      const target = hash ? document.getElementById(hash) : null;
      if (hash && !target) return;

      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(() => smooth.scrollTo(target ?? 0)),
      );
    },
    [pathname, smooth],
  );
}
