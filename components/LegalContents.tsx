"use client";

import { useSmoothScroll } from "@/components/SmoothScroll";

/**
 * The document's table of contents. Each entry glides to its section through
 * Lenis instead of jumping, and leaves the section's anchor in the address
 * bar so the clause can be linked to directly.
 */
export default function LegalContents({
  label,
  entries,
}: {
  label: string;
  entries: { id: string; label: string }[];
}) {
  const smooth = useSmoothScroll();

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    smooth.scrollTo(target);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav aria-label={label} className="border border-gold/40 bg-ivory/60 p-6 sm:p-8">
      <h2 className="text-[12px] uppercase tracking-widest3 text-gold-deep">{label}</h2>
      <ol className="mt-3 grid gap-x-8 sm:grid-cols-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              onClick={(event) => onClick(event, entry.id)}
              className="block py-1.5 text-[14px] leading-snug text-ink-soft underline-offset-4 transition-colors duration-500 hover:text-ink hover:underline"
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
