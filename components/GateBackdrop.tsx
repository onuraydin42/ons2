/**
 * The room behind the age gate: burnt timber, two soft pools of light drifting
 * across it — one gold, one ivory — a vignette and film grain. The front door of
 * a luxury house: lit and quiet.
 *
 * Every moving part animates transform only (keyframes live in globals.css),
 * so the scene runs on the compositor even on a phone.
 */
export default function GateBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden bg-char">
      <div
        className="absolute inset-0 opacity-70"
        style={{ background: 'url("/images/wood/char.webp") 50% 0 / 1536px 1536px repeat' }}
      />
      <div
        className="absolute -inset-[20%]"
        style={{
          background:
            "radial-gradient(38% 34% at 30% 28%, rgba(232,211,148,0.16) 0%, rgba(232,211,148,0) 70%)",
          animation: "fo-drift 26s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -inset-[20%]"
        style={{
          background:
            "radial-gradient(42% 38% at 70% 70%, rgba(241,236,227,0.1) 0%, rgba(241,236,227,0) 70%)",
          animation: "fo-drift 34s ease-in-out -12s infinite alternate-reverse",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, rgba(10,10,9,0) 45%, rgba(10,10,9,0.62) 100%)",
        }}
      />
      <div className="bg-grain absolute inset-0 opacity-[0.05]" />
    </div>
  );
}
