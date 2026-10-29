"use client";

import { useEffect, useRef, useState } from "react";

import SignaturePad, { type SignaturePadHandle } from "@/components/SignaturePad";
import { useSmoothScroll } from "@/components/SmoothScroll";
import { FieldError, GhostButton, SelectField, TextField } from "@/components/order/Fields";
import { ErrorNotice, ORDER_SUBMITTED, SuccessPanel } from "@/components/order/FormResult";
import { PresentationPair } from "@/components/order/Presentation";
import { CASE_OPTIONS, STATES } from "@/data/order";
import { mailtoFallback, submitForm, type FormPayload, type SubmitState } from "@/lib/submitForm";

type Errors = Partial<Record<"business" | "cases" | "state" | "signature", string>>;

/** A repeat order from an account that is already stocking the bottle. */
export default function ReorderForm() {
  const smooth = useSmoothScroll();

  const [business, setBusiness] = useState("");
  const [cases, setCases] = useState("");
  const [stateName, setStateName] = useState("");
  const [signed, setSigned] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<SubmitState>("idle");

  const topRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<SignaturePadHandle>(null);

  const buildPayload = (): FormPayload => ({
    subject: `FLUID OUNCE — reorder · ${business.trim()}`,
    fields: {
      "Name of business": business.trim(),
      "Number of cases": cases,
      State: stateName,
    },
  });

  const validate = (): boolean => {
    const next: Errors = {};
    if (!business.trim()) next.business = "Required.";
    if (!cases) next.cases = "Required.";
    if (!stateName) next.state = "Required.";
    if (signatureRef.current?.isEmpty() ?? true) next.signature = "Please sign above.";

    setErrors(next);
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
        <SuccessPanel message={ORDER_SUBMITTED} />
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-9">
          {/* Both presentations, side by side, above the business name. */}
          <PresentationPair />

          <TextField
            label="Name of Business"
            name="business-name"
            value={business}
            onChange={setBusiness}
            placeholder="Enter business name"
            autoComplete="organization"
            error={errors.business}
            required
          />

          <SelectField
            label="Number of Cases"
            name="case-count"
            value={cases}
            onChange={setCases}
            options={CASE_OPTIONS}
            note="Boxed presentation is reserved for Liquor Store partners. Restaurant partners receive the bottle presentation."
            error={errors.cases}
            required
          />

          <SelectField
            label="State"
            name="state"
            value={stateName}
            onChange={setStateName}
            options={STATES}
            error={errors.state}
            required
          />

          <div>
            <SignaturePad
              ref={signatureRef}
              onChange={setSigned}
              invalid={Boolean(errors.signature) && !signed}
            />
            {errors.signature && !signed ? <FieldError message={errors.signature} /> : null}
          </div>

          {status === "error" ? <ErrorNotice mailto={mailtoFallback(buildPayload())} /> : null}

          <div className="pt-2">
            <GhostButton
              type="submit"
              disabled={status === "submitting"}
              pulsing={status === "submitting"}
              className="w-full sm:w-auto"
            >
              {status === "submitting" ? "Submitting" : "Submit Order"}
            </GhostButton>
          </div>
        </form>
      )}
    </div>
  );
}
