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
 * "Upload Image" — a button over a hidden file input, then a thumbnail with
 * the file name and a way to take it back.
 */
export default function ImageUpload({
  name,
  value,
  onChange,
  invalid = false,
}: {
  name: string;
  value: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
  invalid?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again still fires a change.
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProblem("Please choose an image file (JPG or PNG).");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setProblem("That image is over 20 MB. Please choose a smaller one.");
      return;
    }

    setBusy(true);
    setProblem(null);
    try {
      onChange({ name: file.name, dataUrl: await toDataUrl(file) });
    } catch {
      setProblem("This image format isn’t supported. Please upload a JPG or PNG.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
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

      {value ? (
        <div className="mt-4 flex items-center gap-4 rounded-md border border-white/15 bg-white/[0.02] p-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-white/10">
            <Image src={value.dataUrl} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-light text-platinum">{value.name}</p>
            <p className="mt-1 text-xs font-light text-ice/60">Image attached</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 px-2 py-2 text-[11px] font-light uppercase tracking-widest2 text-white/45 transition-colors duration-500 hover:text-platinum"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`mt-4 inline-flex items-center gap-3 rounded-md border px-6 py-3.5 text-xs font-light uppercase tracking-widest2 text-platinum/85 transition-all duration-500 ease-lux hover:border-ice/60 hover:text-platinum hover:shadow-[0_0_30px_-10px_rgba(191,211,224,0.4)] disabled:cursor-wait disabled:opacity-60 sm:text-[13px] ${
            invalid ? "border-red-400/50" : "border-white/20"
          } ${busy ? "animate-fo-pulse" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.1}
            strokeLinecap="round"
            aria-hidden
            className="h-4 w-4"
          >
            <path d="M12 16 V4 M7 9 L12 4 L17 9 M4 15 V19 H20 V15" />
          </svg>
          {busy ? "Processing" : "Upload Image"}
        </button>
      )}

      {problem ? <p className="mt-2.5 text-[13px] font-light text-red-300/85">{problem}</p> : null}
    </div>
  );
}
