"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import SignaturePad, { type SignaturePadHandle } from "@/components/SignaturePad";
import { useSmoothScroll } from "@/components/SmoothScroll";
import {
  ChoiceField,
  FieldError,
  FormSection,
  GhostButton,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/order/Fields";
import { ErrorNotice, ORDER_SUBMITTED, SuccessPanel } from "@/components/order/FormResult";
import ImageUpload, { type UploadedImage } from "@/components/order/ImageUpload";
import { PresentationForType } from "@/components/order/Presentation";
import { BUSINESS_TYPES, CASE_OPTIONS, STATES, type BusinessType } from "@/data/order";
import { EASE_LUX } from "@/lib/brand";
import { mailtoFallback, submitForm, type FormPayload, type SubmitState } from "@/lib/submitForm";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_PATTERN = /^\d{5}(?:-\d{4})?$/;

const YES_NO = ["Yes", "No"] as const;
type YesNo = (typeof YES_NO)[number];

const LICENSE_NOTE = "Enter license number or upload image.";

const CERTIFICATION =
  "I hereby certify that I am 21 years of age or older and I have the authority to order alcoholic beverages on behalf of the above-mentioned establishment.";

type FieldKey =
  | "state"
  | "type"
  | "business"
  | "cases"
  | "address"
  | "city"
  | "zip"
  | "contact"
  | "email"
  | "phone"
  | "deliveryNote"
  | "taxId"
  | "license"
  | "signature";
type Errors = Partial<Record<FieldKey, string>>;

/** A number field that can be satisfied by an uploaded image instead. */
function VerificationField({
  label,
  name,
  placeholder,
  value,
  onChange,
  image,
  onImage,
  error,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  image: UploadedImage | null;
  onImage: (image: UploadedImage | null) => void;
  error?: string;
}) {
  return (
    <div>
      <TextField
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        note={LICENSE_NOTE}
        invalid={Boolean(error)}
      />
      <ImageUpload name={`${name}-image`} value={image} onChange={onImage} invalid={Boolean(error)} />
      <FieldError message={error} />
    </div>
  );
}

/**
 * The first order from a new account.
 *
 * Four sections, top to bottom: the order itself (state, business type,
 * business name, cases), Delivery Details, Business Verification, then the
 * signature row — hint, certification, submit.
 */
export default function OrderForm() {
  const smooth = useSmoothScroll();

  const [stateName, setStateName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [business, setBusiness] = useState("");
  const [cases, setCases] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instructions, setInstructions] = useState<YesNo | "">("");
  const [deliveryNote, setDeliveryNote] = useState("");

  const [taxId, setTaxId] = useState("");
  const [taxIdImage, setTaxIdImage] = useState<UploadedImage | null>(null);
  const [license, setLicense] = useState("");
  const [licenseImage, setLicenseImage] = useState<UploadedImage | null>(null);
  const [signed, setSigned] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<SubmitState>("idle");

  const topRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const signatureRef = useRef<SignaturePadHandle>(null);

  /** Wraps a setter so fixing a field also clears its error. */
  const field =
    <T,>(setter: (value: T) => void, key: FieldKey) =>
    (value: T) => {
      setter(value);
      setErrors((current) => {
        if (!current[key]) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    };

  /* Must keep one identity for the life of the form: SignaturePad repaints —
   * and so wipes — its canvas whenever its onChange prop changes, so an inline
   * wrapper here would erase the signature on every keystroke elsewhere. */
  const onSigned = useCallback((hasStroke: boolean) => {
    setSigned(hasStroke);
    if (!hasStroke) return;
    setErrors((current) => {
      if (!current.signature) return current;
      const next = { ...current };
      delete next.signature;
      return next;
    });
  }, []);

  const attachments = (): Record<string, string> => {
    const files: Record<string, string> = {};
    if (taxIdImage) files["Business tax ID image"] = taxIdImage.dataUrl;
    if (licenseImage) files["Liquor license image"] = licenseImage.dataUrl;
    return files;
  };

  const buildPayload = (): FormPayload => ({
    subject: `FLUID OUNCE — order · ${business.trim()}`,
    fields: {
      State: stateName,
      "Business type": businessType,
      "Name of business": business.trim(),
      "Number of cases": cases,
      Presentation:
        businessType === "Restaurant" ? "Signature bottle presentation" : "Boxed presentation",
      "Delivery address": address.trim(),
      City: city.trim(),
      "ZIP code": zip.trim(),
      "Contact person": contact.trim(),
      "Contact email": email.trim(),
      "Phone number": phone.trim(),
      "Additional delivery instructions": instructions === "Yes" ? "Yes" : "No",
      "Delivery note": instructions === "Yes" ? deliveryNote.trim() : "—",
      "Business tax ID number": taxId.trim() || (taxIdImage ? "See attached image" : "—"),
      "Liquor license number": license.trim() || (licenseImage ? "See attached image" : "—"),
      Certification: CERTIFICATION,
    },
    attachments: attachments(),
  });

  const validate = (): Errors => {
    const next: Errors = {};
    if (!stateName) next.state = "Required.";
    if (!businessType) next.type = "Please choose one.";
    if (!business.trim()) next.business = "Required.";
    if (!cases) next.cases = "Required.";

    if (!address.trim()) next.address = "Required.";
    if (!city.trim()) next.city = "Required.";
    if (!zip.trim()) next.zip = "Required.";
    else if (!ZIP_PATTERN.test(zip.trim())) next.zip = "Enter a 5-digit ZIP code.";
    if (!contact.trim()) next.contact = "Required.";
    if (!email.trim()) next.email = "Required.";
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email address.";
    if (!phone.trim()) next.phone = "Required.";
    else if (phone.replace(/\D/g, "").length < 10) next.phone = "Enter a valid phone number.";
    if (instructions === "Yes" && !deliveryNote.trim()) {
      next.deliveryNote = "Please add your delivery note.";
    }

    if (!taxId.trim() && !taxIdImage) {
      next.taxId = "Enter the tax ID number or upload an image.";
    }
    if (!license.trim() && !licenseImage) {
      next.license = "Enter the license number or upload an image.";
    }
    if (signatureRef.current?.isEmpty() ?? true) next.signature = "Please sign above.";

    return next;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "submitting") return;

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setAttempt((count) => count + 1);
      return;
    }

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

  // A long form fails far below the first problem; glide up to it.
  useEffect(() => {
    if (!attempt) return;
    const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (first) smooth.scrollTo(first, { offset: -140 });
  }, [attempt, smooth]);

  // The confirmation replaces a form several screens tall — bring it into view.
  useEffect(() => {
    if (status === "success" && topRef.current) smooth.scrollTo(topRef.current, { offset: -140 });
  }, [status, smooth]);

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div ref={topRef}>
      {status === "success" ? (
        <SuccessPanel message={ORDER_SUBMITTED} />
      ) : (
        <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-9">
          <SelectField
            label="State"
            name="state"
            value={stateName}
            onChange={field(setStateName, "state")}
            options={STATES}
            error={errors.state}
            required
          />

          <ChoiceField
            label="Business Type"
            name="business-type"
            value={businessType}
            onChange={field(setBusinessType, "type")}
            options={BUSINESS_TYPES}
            error={errors.type}
          />

          {/* The presentation for the chosen type opens above the name. */}
          <div>
            <PresentationForType type={businessType} />
            <TextField
              label="Name of Business"
              name="business-name"
              value={business}
              onChange={field(setBusiness, "business")}
              placeholder="Enter business name"
              autoComplete="organization"
              error={errors.business}
              required
            />
          </div>

          <SelectField
            label="Number of Cases"
            name="case-count"
            value={cases}
            onChange={field(setCases, "cases")}
            options={CASE_OPTIONS}
            note="Each case contains 6 bottles."
            error={errors.cases}
            required
          />

          <FormSection title="Delivery Details">
            <TextField
              label="Delivery Address"
              name="delivery-address"
              value={address}
              onChange={field(setAddress, "address")}
              placeholder="Enter street address"
              autoComplete="street-address"
              error={errors.address}
              required
            />

            <div className="grid gap-9 sm:grid-cols-2 sm:gap-6">
              <TextField
                label="City"
                name="city"
                value={city}
                onChange={field(setCity, "city")}
                placeholder="Enter city"
                autoComplete="address-level2"
                error={errors.city}
                required
              />
              <TextField
                label="ZIP Code"
                name="zip"
                value={zip}
                onChange={field(setZip, "zip")}
                placeholder="Enter ZIP code"
                autoComplete="postal-code"
                inputMode="numeric"
                error={errors.zip}
                required
              />
            </div>

            <TextField
              label="Contact Person Name"
              name="contact-name"
              value={contact}
              onChange={field(setContact, "contact")}
              placeholder="Enter full name"
              autoComplete="name"
              error={errors.contact}
              required
            />

            <div className="grid gap-9 sm:grid-cols-2 sm:gap-6">
              <TextField
                label="Contact Email"
                name="contact-email"
                type="email"
                value={email}
                onChange={field(setEmail, "email")}
                placeholder="Enter email address"
                autoComplete="email"
                inputMode="email"
                error={errors.email}
                required
              />
              <TextField
                label="Phone Number"
                name="phone"
                type="tel"
                value={phone}
                onChange={field(setPhone, "phone")}
                placeholder="Enter phone number"
                autoComplete="tel"
                inputMode="tel"
                error={errors.phone}
                required
              />
            </div>

            <div>
              <ChoiceField
                label="Additional Delivery Instructions"
                name="delivery-instructions"
                value={instructions}
                onChange={(value) => {
                  setInstructions(value);
                  if (value === "No") field(setDeliveryNote, "deliveryNote")("");
                }}
                options={YES_NO}
              />

              {/* Yes opens the note; No leaves nothing behind. */}
              <AnimatePresence initial={false}>
                {instructions === "Yes" ? (
                  <motion.div
                    key="delivery-note"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.55, ease: EASE_LUX }}
                    className="overflow-hidden"
                  >
                    <div className="pt-9">
                      <TextAreaField
                        label="Delivery Note"
                        name="delivery-note"
                        value={deliveryNote}
                        onChange={field(setDeliveryNote, "deliveryNote")}
                        placeholder="Loading dock, opening hours, who to ask for…"
                        error={errors.deliveryNote}
                      />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </FormSection>

          <FormSection title="Business Verification">
            <div className="grid gap-12 md:grid-cols-2 md:gap-8">
              <VerificationField
                label="Business Tax ID Number"
                name="tax-id"
                placeholder="Enter Business Tax ID Number"
                value={taxId}
                onChange={field(setTaxId, "taxId")}
                image={taxIdImage}
                onImage={field(setTaxIdImage, "taxId")}
                error={errors.taxId}
              />
              <VerificationField
                label="Liquor License Number"
                name="liquor-license"
                placeholder="Enter Liquor License Number"
                value={license}
                onChange={field(setLicense, "license")}
                image={licenseImage}
                onImage={field(setLicenseImage, "license")}
                error={errors.license}
              />
            </div>

            <div>
              <SignaturePad
                ref={signatureRef}
                onChange={onSigned}
                invalid={Boolean(errors.signature) && !signed}
              />
              {errors.signature && !signed ? <FieldError message={errors.signature} /> : null}

              {/* Hint left, certification centre, submit right. */}
              <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.7fr)_auto] md:items-start md:gap-8">
                <p className="text-[13px] font-light leading-relaxed text-white/50">
                  Sign with mouse or touch.
                </p>
                <p className="text-balance text-center text-[13px] font-light leading-relaxed text-white/60">
                  {CERTIFICATION}
                </p>
                <GhostButton
                  type="submit"
                  disabled={status === "submitting"}
                  pulsing={status === "submitting"}
                  className="w-full md:w-auto md:justify-self-end"
                >
                  {status === "submitting" ? "Submitting" : "Submit Order"}
                </GhostButton>
              </div>

              {hasErrors ? (
                <p className="mt-6 text-center text-[13px] font-light text-red-300/85 md:text-right">
                  Please complete the highlighted fields.
                </p>
              ) : null}

              {status === "error" ? (
                <div className="mt-6">
                  <ErrorNotice mailto={mailtoFallback(buildPayload())} />
                </div>
              ) : null}
            </div>
          </FormSection>
        </form>
      )}
    </div>
  );
}
