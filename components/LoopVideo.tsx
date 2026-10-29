"use client";

import { useEffect, useRef } from "react";

/**
 * A muted, looping, inline video that keeps itself playing.
 *
 * Muted inline autoplay is allowed everywhere, but two things still stop it in
 * practice. React does not write `muted` into prerendered markup, so the
 * static HTML ships an unmuted <video> and the browser refuses to start it
 * before hydration; and iOS Low Power Mode refuses autoplay outright. So the
 * effect re-asserts `muted` and calls play() itself, and if the browser still
 * says no, the first touch anywhere on the page starts it.
 *
 * There are no controls and nothing to pause it with — it is a moving
 * photograph, not a player.
 *
 * `hold` keeps it on its first frame (which is also its poster) until
 * released, then it plays from the start — so a film behind the age gate
 * begins when the visitor actually arrives, not while they are reading.
 */
export default function LoopVideo({
  src,
  poster,
  label,
  className = "",
  preload = "auto",
  hold = false,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
  preload?: "auto" | "metadata";
  hold?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    if (hold) {
      video.pause();
      if (video.currentTime > 0) video.currentTime = 0;
      return;
    }

    const play = () => {
      if (!video.paused) return;
      void video.play().catch(() => {
        // Refused (Low Power Mode, data saver). The poster stays up and the
        // listeners below try again on the next interaction.
      });
    };

    play();

    const onVisibility = () => {
      if (document.visibilityState === "visible") play();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointerdown", play, { passive: true });
    window.addEventListener("touchstart", play, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", play);
      window.removeEventListener("touchstart", play);
    };
  }, [hold]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={label}
      autoPlay={!hold}
      muted
      loop
      playsInline
      preload={preload}
      disablePictureInPicture
      disableRemotePlayback
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
