"use client";

import { motion } from "framer-motion";

import { EASE_LUX } from "@/lib/brand";
import { CONTACT_EMAIL } from "@/lib/submitForm";

/** What both portal forms say once a request has been delivered. */
export const ORDER_SUBMITTED = "Your order request has been submitted.";

/** The quiet confirmation that replaces a form once it has been delivered. */
export function SuccessPanel({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_LUX }}
      className="py-16 text-center"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={0.75}
        aria-hidden
        className="mx-auto h-12 w-12 text-ice/70"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M7.5 12.5 L10.5 15.5 L16.5 9" />
      </svg>

      <p className="mx-auto mt-8 max-w-md text-balance font-display text-2xl font-normal leading-snug text-platinum sm:text-3xl">
        {message}
      </p>
    </motion.div>
  );
}

/** Nothing is ever simply lost — a failed POST still leaves a way through. */
export function ErrorNotice({ mailto }: { mailto: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_LUX }}
      role="alert"
      className="rounded-md border border-red-400/30 bg-red-400/[0.04] px-5 py-4"
    >
      <p className="text-sm font-light leading-relaxed text-red-200/90">
        Something went wrong — your order request could not be submitted. Please try again,
        or{" "}
        <a href={mailto} className="text-ice/80 underline underline-offset-4">
          send it to {CONTACT_EMAIL}
        </a>{" "}
        instead.
      </p>
    </motion.div>
  );
}
