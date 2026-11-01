"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export interface UploadedImage {
  name: string;
  /** JPEG data URL, already downscaled for the form relay. */
  dataUrl: string;
}

/* Phone cameras produce 4000px, 5 MB photos. Long edge 1600 at q0.82 keeps a
 * license perfectly legible at a few hundred KB, which the relay accepts in
 * the same JSON body as the rest of the order. */
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_EDGE = 1600;
const QUALITY = 0.82;

function decode(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image could not be read."));
    };
    image.src = url;
  });
}

async function toDataUrl(file: File): Promise<string> {
  const image = await decode(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("This image could not be read.");

  // JPEG has no transparency; a PNG screenshot would otherwise turn black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", QUALITY);
}

/**
 * The live form's upload row: an "Upload Image" button over a hidden file
 * input, and beside it the chosen file's name — or "No file selected". A
 * thumbnail confirms the right photo went in; choosing again replaces it.
 */
export default function ImageUpload({
  name,
  value,
  onChange,
  buttonLabel,
  emptyLabel,
  invalid = false,
}: {
  name: string;
  value: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
  buttonLabel: string;
  emptyLabel: string;
  invalid?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again still fires a change.
    event.target.value = "";
    if (!file) return;

    // Anything that is not a readable image is simply not taken, exactly as
    // if nothing had been chosen.
    if (!file.type.startsWith("image/") || file.size > MAX_SOURCE_BYTES) return;

    setBusy(true);
    try {
      onChange({ name: file.name, dataUrl: await toDataUrl(file) });
    } catch {
      // Unsupported format: leave the field as it was.
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`inline-flex items-center gap-3 rounded-md border bg-ivory/85 px-4 py-3.5 text-[12px] uppercase tracking-widest2 text-ink transition-all duration-500 ease-lux hover:border-ink hover:bg-ivory disabled:cursor-wait sm:px-6 ${
          invalid ? "border-red-700/60" : "border-ink/25"
        } ${busy ? "animate-fo-pulse" : ""}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          aria-hidden
          className="h-4 w-4"
        >
          <path d="M12 16 V4 M7 9 L12 4 L17 9 M4 15 V19 H20 V15" />
        </svg>
        {buttonLabel}
      </button>

      {/* Beside the button where it fits whole, under it where it would truncate. */}
      <div className="flex min-w-[7rem] flex-1 items-center gap-3">
        {value ? (
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded border border-ink/15">
            <Image src={value.dataUrl} alt="" fill sizes="44px" className="object-cover" />
          </span>
        ) : null}
        <span className={`truncate text-[13.5px] ${value ? "text-ink" : invalid ? "text-red-800" : "text-ink-muted"}`}>
          {value ? value.name : emptyLabel}
        </span>
      </div>
    </div>
  );
}
