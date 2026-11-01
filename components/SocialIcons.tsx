import { SOCIAL_LINKS, type SocialLink } from "@/data/site";

/* Drawn inline: the CSP allows no third-party icon font, and two glyphs do
 * not justify one anyway. */
function Glyph({ label }: { label: string }) {
  if (label === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden className="h-[18px] w-[18px]">
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
      <path d="M17.75 3h3.07l-6.71 7.67L22 21h-6.18l-4.84-6.33L5.44 21H2.37l7.18-8.2L2 3h6.34l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.41 4.74H5.59l11.08 14.43Z" />
    </svg>
  );
}

const TONES = {
  stone: "border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-ivory",
  dark: "border-ivory/25 text-ivory hover:border-gold-light hover:bg-gold-light hover:text-ink",
};

/** The brand's profiles, as round hairline buttons. */
export default function SocialIcons({
  links = SOCIAL_LINKS,
  tone = "stone",
  className = "",
}: {
  links?: SocialLink[];
  /** The ground they stand on. */
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 ease-lux ${TONES[tone]}`}
          >
            <Glyph label={link.label} />
          </a>
        </li>
      ))}
    </ul>
  );
}
