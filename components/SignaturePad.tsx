"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

/** Keeps the base64 payload small enough for the form relay to accept intact. */
const SIGNATURE_MAX_WIDTH = 800;

/* Ink on paper: the signature arrives in the inbox the way it would on a
 * printed order form. */
const STROKE = "#161412";
const FIELD = "#FFFFFF";

export interface SignaturePadHandle {
  /** PNG data URL, downscaled to SIGNATURE_MAX_WIDTH. Null when unsigned. */
  toDataURL: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  label: string;
  /** The line beside the Clear button — "Sign with mouse or touch." */
  note: string;
  clearLabel: string;
  /** Fires whenever the signed/unsigned state flips. */
  onChange?: (hasStroke: boolean) => void;
  invalid?: boolean;
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
  { label, note, clearLabel, onChange, invalid = false },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  /* Whether anything was drawn is tracked as a flag, not sniffed out of the
   * pixel buffer — reading pixels back is slow and gets fooled by antialiasing. */
  const hasStrokeRef = useRef(false);

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

    context.lineWidth = 1.6;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = STROKE;

    return context;
  }, []);

  /* Size the field to its box, and re-fit when its width really changes. A phone
   * resizes the window every time its address bar slides or its keyboard opens,
   * neither of which touches the field; only turning the phone does, and then
   * the signature comes along, scaled down if it has to be, rather than being
   * wiped between signing and pressing Submit. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    paintField(canvas);

    let width = canvas.clientWidth;
    const sizer = new ResizeObserver(() => {
      if (!canvas.clientWidth || canvas.clientWidth === width) return;
      width = canvas.clientWidth;

      const signed = document.createElement("canvas");
      signed.width = canvas.width;
      signed.height = canvas.height;
      signed.getContext("2d")?.drawImage(canvas, 0, 0);

      const context = paintField(canvas);
      if (!context || !hasStrokeRef.current) return;
      const fit = Math.min(canvas.width / signed.width, canvas.height / signed.height, 1);
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.drawImage(signed, 0, 0, signed.width * fit, signed.height * fit);
      context.restore();
    });

    sizer.observe(canvas);
    return () => sizer.disconnect();
  }, [paintField]);

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
      context.arc(lastRef.current.x, lastRef.current.y, 0.8, 0, Math.PI * 2);
      context.fillStyle = STROKE;
      context.fill();
    }

    if (!hasStrokeRef.current) {
      hasStrokeRef.current = true;
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
      <span className="block text-[12px] uppercase tracking-widest2 text-ink-soft">{label}</span>

      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerLeave={endStroke}
        aria-label={`${label} — ${note}`}
        aria-invalid={invalid}
        // touch-action must be none or a touch drag scrolls the page instead
        // of drawing on the canvas.
        style={{ touchAction: "none" }}
        className={`mt-3 h-44 w-full cursor-crosshair select-none rounded-md border bg-white transition-colors duration-500 [-webkit-touch-callout:none] ${
          invalid ? "border-red-700/60" : "border-ink/20 hover:border-ink/35"
        }`}
      />

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-[13.5px] text-ink-muted">{note}</p>
        <button
          type="button"
          onClick={clear}
          className="shrink-0 border border-ink/30 px-5 py-3 text-[11.5px] uppercase tracking-widest2 text-ink-soft transition-colors duration-500 hover:border-ink hover:text-ink active:border-ink active:text-ink"
        >
          {clearLabel}
        </button>
      </div>
    </div>
  );
});

export default SignaturePad;
