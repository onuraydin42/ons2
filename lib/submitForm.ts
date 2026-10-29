/**
 * Form delivery for a site with no server.
 *
 * The site is a static export, so there is no API route to post to and no
 * place to keep a secret. Submissions go straight from the browser to a
 * third-party form relay, which emails them to the brand owner.
 *
 * RECOMMENDED RELAY: Web3Forms (https://web3forms.com)
 *   - accepts a base64 data-URL field and delivers it as a real email
 *     attachment on the free tier, which is what the signature needs;
 *   - the access key is public by design — it only permits posting to the
 *     inbox it was issued for.
 *   Set NEXT_PUBLIC_FORM_ENDPOINT=https://api.web3forms.com/submit
 *   and NEXT_PUBLIC_FORM_ACCESS_KEY=<your key>.
 *
 * FALLBACK: Formspree works with the same JSON shape but truncates large
 * fields, so a full-resolution signature can arrive clipped. If you use it,
 * keep SIGNATURE_MAX_WIDTH low.
 */

export const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";
export const FORM_ACCESS_KEY = process.env.NEXT_PUBLIC_FORM_ACCESS_KEY ?? "";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "orders@fluidounce.co";

export type SubmitState = "idle" | "submitting" | "success" | "error";

export interface FormPayload {
  subject: string;
  /** Human-readable label -> value, rendered into the email body. */
  fields: Record<string, string>;
  /** base64 PNG data URL; relays that support attachments send it as a file. */
  signature?: string;
  /** Further images as label -> base64 data URL (license photos and the like). */
  attachments?: Record<string, string>;
}

/**
 * Posts the payload to the configured relay.
 * Throws on any non-2xx response or missing configuration; callers surface the
 * failure inline and offer the mailto fallback so nothing is silently lost.
 */
export async function submitForm(payload: FormPayload): Promise<void> {
  if (!FORM_ENDPOINT) {
    throw new Error("NEXT_PUBLIC_FORM_ENDPOINT is not configured.");
  }

  const body: Record<string, unknown> = {
    subject: payload.subject,
    from_name: "FLUID OUNCE — fluidounce.co",
    ...payload.fields,
  };

  if (FORM_ACCESS_KEY) body.access_key = FORM_ACCESS_KEY;
  if (payload.signature) body.signature = payload.signature;
  for (const [label, dataUrl] of Object.entries(payload.attachments ?? {})) {
    body[label] = dataUrl;
  }

  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Form relay responded ${response.status}.`);
  }

  // Web3Forms returns 200 with { success: false } on a bad key, so the status
  // code alone is not enough to call it delivered.
  const result = (await response.json().catch(() => null)) as { success?: boolean } | null;
  if (result && result.success === false) {
    throw new Error("Form relay rejected the submission.");
  }
}

/** A plain-text escape hatch, so a failed POST never loses the enquiry. */
export function mailtoFallback(payload: FormPayload): string {
  const lines = Object.entries(payload.fields).map(([label, value]) => `${label}: ${value}`);
  // The signature is a canvas drawing and cannot travel in a mailto body —
  // nor can any uploaded image.
  const missing = ["Signature", ...Object.keys(payload.attachments ?? {})];
  lines.push("", `(${missing.join(", ")} could not be attached — sent from the fallback link.)`);

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    payload.subject,
  )}&body=${encodeURIComponent(lines.join("\n"))}`;
}
