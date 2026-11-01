"use client";

import { motion } from "framer-motion";

import { GhostButton } from "@/components/order/Fields";
import { EASE_LUX } from "@/lib/brand";
import { CONTACT_EMAIL } from "@/lib/submitForm";

/**
 * The confirmation that replaces a form once it has been delivered — the live
 * site's message and its "Close", which returns to the two doors.
 */
export function SuccessPanel({
  message,
  closeLabel,
  onClose,
}: {
  message: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_LUX }}
      role="status"
      className="py-16 text-center"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
        aria-hidden
        className="mx-auto h-14 w-14 text-gold-deep"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M7.5 12.5 L10.5 15.5 L16.5 9" />
      </svg>

      <p className="mx-auto mt-8 max-w-md text-balance font-display text-[1.7rem] font-normal leading-snug text-ink sm:text-[2.1rem]">
        {message}
      </p>

      <GhostButton onClick={onClose} className="mt-12 min-w-[11rem]">
        {closeLabel}
      </GhostButton>
    </motion.div>
  );
}

/**
 * A failed POST, in the live site's words, with the address it can be sent to
 * instead — so an order request is never simply lost.
 */
export function ErrorNotice({ message, mailto }: { message: string; mailto: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_LUX }}
      role="alert"
      className="rounded-md border border-red-700/30 bg-red-50/80 px-5 py-4"
    >
      <p className="text-[14px] leading-relaxed text-red-900">{message}</p>
      <a
        href={mailto}
        className="mt-2 inline-block text-[14px] text-ink underline decoration-ink/40 underline-offset-4 transition-colors duration-500 hover:decoration-ink"
      >
        {CONTACT_EMAIL}
      </a>
    </motion.div>
  );
}
