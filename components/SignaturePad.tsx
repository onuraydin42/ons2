"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

/** Keeps the base64 payload small enough for the form relay to accept intact. */
const SIGNATURE_MAX_WIDTH = 800;

const STROKE = "#F2F6FA";
const FIELD = "#080B0F";

export interface SignaturePadHandle {
  /** PNG data URL, downscaled to SIGNATURE_MAX_WIDTH. Null when unsigned. */
  toDataURL: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  label?: string;
  /** Fires whenever the signed/unsigned state flips. */
  onChange?: (hasStroke: boolean) => void;
  invalid?: boolean;
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
  { label = "Signature", onChange, invalid = false },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  /* Whether anything was drawn is tracked as a flag, not sniffed out of the
   * pixel buffer — reading pixels back is slow and gets fooled by antialiasing. */
  const hasStrokeRef = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  const paintField = useCallback((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");
    if (!context) return null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    // Draw in CSS pixels; the transform absorbs the device ratio so the line
    // stays crisp on retina instead of doubling in size.
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.fillStyle = FIELD;
    context.fillRect(0, 0, width, height);

    context.lineWidth = 1.4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = STROKE;

    return context;
  }, []);

  /* Size the field to its box, and re-fit on resize. A resize clears the
   * drawing, so the signed flag is reset with it rather than left lying. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    paintField(canvas);

    let frame = 0;
    const onResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        paintField(canvas);
        if (hasStrokeRef.current) {
          hasStrokeRef.current = false;
          setHasStroke(false);
          onChange?.(false);
        }
      });
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [paintField, onChange]);

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture means a stroke that wanders off the canvas keeps drawing, and
    // the pointer-up still lands here rather than on whatever is underneath.
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastRef.current = pointFrom(event);

    // A tap with no drag is still a mark, so put a dot down immediately.
    const context = canvas.getContext("2d");
    if (context && lastRef.current) {
      context.beginPath();
      context.arc(lastRef.current.x, lastRef.current.y, 0.7, 0, Math.PI * 2);
      context.fillStyle = STROKE;
      context.fill();
    }

    if (!hasStrokeRef.current) {
      hasStrokeRef.current = true;
      setHasStroke(true);
      onChange?.(true);
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const last = lastRef.current;
    if (!context || !last) return;

    const next = pointFrom(event);
    context.beginPath();
    context.moveTo(last.x, last.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    lastRef.current = next;
  };

  const endStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastRef.current = null;

    const canvas = canvasRef.current;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    paintField(canvas);
    hasStrokeRef.current = false;
    setHasStroke(false);
    onChange?.(false);
  }, [paintField, onChange]);

  useImperativeHandle(
    ref,
    () => ({
      isEmpty: () => !hasStrokeRef.current,
      clear,
      toDataURL: () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasStrokeRef.current) return null;
        if (canvas.width <= SIGNATURE_MAX_WIDTH) return canvas.toDataURL("image/png");

        const scale = SIGNATURE_MAX_WIDTH / canvas.width;
        const scaled = document.createElement("canvas");
        scaled.width = SIGNATURE_MAX_WIDTH;
        scaled.height = Math.round(canvas.height * scale);

        const context = scaled.getContext("2d");
        if (!context) return canvas.toDataURL("image/png");

        context.drawImage(canvas, 0, 0, scaled.width, scaled.height);
        return scaled.toDataURL("image/png");
      },
    }),
    [clear],
  );

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-light uppercase tracking-widest2 text-white/60 sm:text-[13px]">
          {label}
        </span>
        <button
          type="button"
          onClick={clear}
          disabled={!hasStroke}
          className="text-xs font-light uppercase tracking-widest2 text-white/45 underline-offset-4 transition-colors duration-500 hover:text-platinum disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-white/45 sm:text-[13px]"
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerLeave={endStroke}
        aria-label={`${label} — draw with your mouse or finger`}
        aria-invalid={invalid}
        // touch-action must be none or a touch drag scrolls the page instead
        // of drawing on the canvas.
        style={{ touchAction: "none" }}
        className={`mt-3 h-44 w-full cursor-crosshair rounded-md border bg-[#080B0F] transition-colors duration-500 ${
          invalid ? "border-red-400/50" : "border-white/15 hover:border-white/25"
        }`}
      />
    </div>
  );
});

export default SignaturePad;
