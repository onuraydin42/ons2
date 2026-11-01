"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import SignaturePad, { type SignaturePadHandle } from "@/components/SignaturePad";
import { useSmoothScroll } from "@/components/SmoothScroll";
import { GhostButton, ReviewBanner, SelectField, TextField } from "@/components/order/Fields";
import { ErrorNotice, SuccessPanel } from "@/components/order/FormResult";
import { PresentationPair } from "@/components/order/Presentation";
import { CASE_OPTIONS, ORDER_COPY as COPY, STATES } from "@/data/order";
import { mailtoFallback, submitForm, type FormPayload, type SubmitState } from "@/lib/submitForm";

type FieldKey = "business" | "cases" | "state" | "signature";
type Invalid = Partial<Record<FieldKey, true>>;

/** A repeat order from an account that is already stocking the bottle. */
export default function ReorderForm({ onClose }: { onClose: () => void }) {
  const smooth = useSmoothScroll();

  const [business, setBusiness] = useState("");
  const [cases, setCases] = useState("");
  const [stateName, setStateName] = useState("");

  const [invalid, setInvalid] = useState<Invalid>({});
  const [status, setStatus] = useState<SubmitState>("idle");

  const topRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<SignaturePadHandle>(null);

  const clearInvalid = useCallback((key: FieldKey) => {
    setInvalid((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  /* One identity for the life of the form — see OrderForm. */
  const onSigned = useCallback(
    (hasStroke: boolean) => {
      if (hasStroke) clearInvalid("signature");
    },
    [clearInvalid],
  );

  const buildPayload = (): FormPayload => ({
    subject: `FLUID OUNCE — reorder · ${business.trim()}`,
    fields: {
      "Name of business": business.trim(),
      "Number of cases": cases,
      State: stateName,
      Certification: COPY.certification,
    },
  });

  const validate = (): boolean => {
    const next: Invalid = {};
    if (!business.trim()) next.business = true;
    if (!cases) next.cases = true;
    if (!stateName) next.state = true;
    if (signatureRef.current?.isEmpty() ?? true) next.signature = true;

    setInvalid(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "submitting") return;
    if (!validate()) return;

    setStatus("submitting");
    try {
      await submitForm({
        ...buildPayload(),
        signature: signatureRef.current?.toDataURL() ?? undefined,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status === "success" && topRef.current) smooth.scrollTo(topRef.current, { offset: -140 });
  }, [status, smooth]);

  return (
    <div ref={topRef}>
      {status === "success" ? (
        <SuccessPanel message={COPY.submitted} closeLabel={COPY.close} onClose={onClose} />
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-9">
          {Object.keys(invalid).length > 0 ? <ReviewBanner message={COPY.reviewFields} /> : null}

          {/* Both presentations, side by side, above the business name. */}
          <PresentationPair />

          <TextField
            label={COPY.businessName}
            name="business-name"
            value={business}
            onChange={(value) => {
              setBusiness(value);
              clearInvalid("business");
            }}
            placeholder={COPY.businessNamePlaceholder}
            autoComplete="organization"
            invalid={invalid.business}
            required
          />

          <SelectField
            label={COPY.cases}
            name="case-count"
            value={cases}
            onChange={(value) => {
              setCases(value);
              clearInvalid("cases");
            }}
            options={CASE_OPTIONS}
            placeholder={COPY.reorderCasesPlaceholder}
            note={COPY.reorderCasesNote}
            invalid={invalid.cases}
            required
          />

          <SelectField
            label={COPY.state}
            name="state"
            value={stateName}
            onChange={(value) => {
              setStateName(value);
              clearInvalid("state");
            }}
            options={STATES}
            placeholder={COPY.statePlaceholder}
            invalid={invalid.state}
            required
          />

          <div>
            <SignaturePad
              ref={signatureRef}
              label={COPY.signature}
              note={COPY.signatureNote}
              clearLabel={COPY.clear}
              onChange={onSigned}
              invalid={invalid.signature}
            />
            {invalid.signature ? (
              <p className="mt-3 text-[13.5px] text-red-800">{COPY.signatureMissing}</p>
            ) : null}

            <p className="mt-8 text-pretty text-[14px] leading-relaxed text-ink-soft">{COPY.certification}</p>
          </div>

          {status === "error" ? (
            <ErrorNotice message={COPY.reorderFailed} mailto={mailtoFallback(buildPayload())} />
          ) : null}

          <div className="pt-2">
            <GhostButton
              type="submit"
              disabled={status === "submitting"}
              pulsing={status === "submitting"}
              className="w-full sm:w-auto sm:min-w-[14rem]"
            >
              {status === "submitting" ? COPY.submitting : COPY.submit}
            </GhostButton>
          </div>
        </form>
      )}
    </div>
  );
}
