"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import SignaturePad, { type SignaturePadHandle } from "@/components/SignaturePad";
import { useSmoothScroll } from "@/components/SmoothScroll";
import {
  ChoiceField,
  FormSection,
  GhostButton,
  ReviewBanner,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/order/Fields";
import { ErrorNotice, SuccessPanel } from "@/components/order/FormResult";
import ImageUpload, { type UploadedImage } from "@/components/order/ImageUpload";
import { PresentationForType } from "@/components/order/Presentation";
import {
  BUSINESS_TYPES,
  NEW_ACCOUNT_CASE_OPTIONS,
  ORDER_COPY as COPY,
  STATES,
  type BusinessType,
} from "@/data/order";
import { EASE_LUX } from "@/lib/brand";
import { mailtoFallback, submitForm, type FormPayload, type SubmitState } from "@/lib/submitForm";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const YES_NO = ["Yes", "No"] as const;
type YesNo = (typeof YES_NO)[number];

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
  | "instructions"
  | "deliveryNote"
  | "taxId"
  | "license"
  | "signature";
type Invalid = Partial<Record<FieldKey, true>>;

/** A number field that can be satisfied by an uploaded image instead. */
function VerificationField({
  label,
  name,
  placeholder,
  value,
  onChange,
  image,
  onImage,
  invalid,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  image: UploadedImage | null;
  onImage: (image: UploadedImage | null) => void;
  invalid: boolean;
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
        note={COPY.licenseNote}
        invalid={invalid}
      />
      <ImageUpload
        name={`${name}-image`}
        value={image}
        onChange={onImage}
        buttonLabel={COPY.upload}
        emptyLabel={COPY.noFile}
        invalid={invalid}
      />
    </div>
  );
}

/**
 * The first order from a new account — the live form, field for field.
 *
 * Four sections, top to bottom: the order itself (state, business type,
 * business name, cases), Delivery Details, Business Verification, then the
 * signature, the certification and the submit button.
 */
export default function OrderForm({ onClose }: { onClose: () => void }) {
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

  const [invalid, setInvalid] = useState<Invalid>({});
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<SubmitState>("idle");

  const topRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const signatureRef = useRef<SignaturePadHandle>(null);

  const clearInvalid = useCallback((key: FieldKey) => {
    setInvalid((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  /** Wraps a setter so fixing a field also clears its highlight. */
  const field =
    <T,>(setter: (value: T) => void, key: FieldKey) =>
    (value: T) => {
      setter(value);
      clearInvalid(key);
    };

  /* Must keep one identity for the life of the form: SignaturePad repaints —
   * and so wipes — its canvas whenever its onChange prop changes, so an inline
   * wrapper here would erase the signature on every keystroke elsewhere. */
  const onSigned = useCallback(
    (hasStroke: boolean) => {
      if (hasStroke) clearInvalid("signature");
    },
    [clearInvalid],
  );

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
      "Additional delivery instructions": instructions,
      "Delivery note": instructions === "Yes" ? deliveryNote.trim() : "—",
      "Business tax ID number": taxId.trim() || (taxIdImage ? "See attached image" : "—"),
      "Liquor license number": license.trim() || (licenseImage ? "See attached image" : "—"),
      Certification: COPY.certification,
    },
    attachments: attachments(),
  });

  /* The live form's rules: everything is required, the phone number is ten
   * digits, and each verification is a number or an image. */
  const validate = (): Invalid => {
    const next: Invalid = {};
    if (!stateName) next.state = true;
    if (!businessType) next.type = true;
    if (!business.trim()) next.business = true;
    if (!cases) next.cases = true;
    if (!address.trim()) next.address = true;
    if (!city.trim()) next.city = true;
    if (!zip.trim()) next.zip = true;
    if (!contact.trim()) next.contact = true;
    if (!EMAIL_PATTERN.test(email.trim())) next.email = true;
    if (phone.replace(/\D/g, "").length !== 10) next.phone = true;
    if (!instructions) next.instructions = true;
    if (instructions === "Yes" && !deliveryNote.trim()) next.deliveryNote = true;
    if (!taxId.trim() && !taxIdImage) next.taxId = true;
    if (!license.trim() && !licenseImage) next.license = true;
    if (signatureRef.current?.isEmpty() ?? true) next.signature = true;
    return next;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "submitting") return;

    const next = validate();
    setInvalid(next);
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
    if (first) smooth.scrollTo(first, { offset: -160 });
  }, [attempt, smooth]);

  // The confirmation replaces a form several screens tall — bring it into view.
  useEffect(() => {
    if (status === "success" && topRef.current) smooth.scrollTo(topRef.current, { offset: -140 });
  }, [status, smooth]);

  const hasInvalid = Object.keys(invalid).length > 0;

  return (
    <div ref={topRef}>
      {status === "success" ? (
        <SuccessPanel message={COPY.submitted} closeLabel={COPY.close} onClose={onClose} />
      ) : (
        <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-9">
          {hasInvalid ? <ReviewBanner message={COPY.reviewFields} /> : null}

          <SelectField
            label={COPY.state}
            name="state"
            value={stateName}
            onChange={field(setStateName, "state")}
            options={STATES}
            placeholder={COPY.statePlaceholder}
            invalid={invalid.state}
            required
          />

          <ChoiceField
            label={COPY.businessType}
            name="business-type"
            value={businessType}
            onChange={field(setBusinessType, "type")}
            options={BUSINESS_TYPES}
            invalid={invalid.type}
          />

          {/* The presentation for the chosen type opens above the name. */}
          <div>
            <PresentationForType type={businessType} />
            <TextField
              label={COPY.businessName}
              name="business-name"
              value={business}
              onChange={field(setBusiness, "business")}
              placeholder={COPY.businessNamePlaceholder}
              autoComplete="organization"
              invalid={invalid.business}
              required
            />
          </div>

          <SelectField
            label={COPY.cases}
            name="case-count"
            value={cases}
            onChange={field(setCases, "cases")}
            options={NEW_ACCOUNT_CASE_OPTIONS}
            placeholder={COPY.casesPlaceholder}
            note={COPY.casesNote}
            invalid={invalid.cases}
            required
          />

          <FormSection title={COPY.deliveryDetails}>
            <TextField
              label={COPY.address}
              name="delivery-address"
              value={address}
              onChange={field(setAddress, "address")}
              autoComplete="street-address"
              invalid={invalid.address}
              required
            />

            <div className="grid gap-9 sm:grid-cols-2 sm:gap-6">
              <TextField
                label={COPY.city}
                name="city"
                value={city}
                onChange={field(setCity, "city")}
                autoComplete="address-level2"
                invalid={invalid.city}
                required
              />
              <TextField
                label={COPY.zip}
                name="zip"
                value={zip}
                onChange={field(setZip, "zip")}
                autoComplete="postal-code"
                inputMode="numeric"
                invalid={invalid.zip}
                required
              />
            </div>

            <TextField
              label={COPY.contact}
              name="contact-name"
              value={contact}
              onChange={field(setContact, "contact")}
              autoComplete="name"
              invalid={invalid.contact}
              required
            />

            <div className="grid gap-9 sm:grid-cols-2 sm:gap-6">
              <TextField
                label={COPY.email}
                name="contact-email"
                type="email"
                value={email}
                onChange={field(setEmail, "email")}
                placeholder={COPY.emailPlaceholder}
                autoComplete="email"
                inputMode="email"
                invalid={invalid.email}
                required
              />
              <TextField
                label={COPY.phone}
                name="phone"
                type="tel"
                value={phone}
                onChange={field(setPhone, "phone")}
                placeholder={COPY.phonePlaceholder}
                autoComplete="tel"
                inputMode="tel"
                invalid={invalid.phone}
                required
              />
            </div>

            <div>
              <ChoiceField
                label={COPY.instructions}
                name="delivery-instructions"
                value={instructions}
                onChange={(value) => {
                  setInstructions(value);
                  clearInvalid("instructions");
                  if (value === "No") field(setDeliveryNote, "deliveryNote")("");
                }}
                options={YES_NO}
                invalid={invalid.instructions}
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
                        label={COPY.deliveryNote}
                        name="delivery-note"
                        value={deliveryNote}
                        onChange={field(setDeliveryNote, "deliveryNote")}
                        placeholder={COPY.deliveryNotePlaceholder}
                        invalid={invalid.deliveryNote}
                      />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </FormSection>

          <FormSection title={COPY.verification}>
            <div className="grid gap-12 md:grid-cols-2 md:gap-8">
              <VerificationField
                label={COPY.taxId}
                name="tax-id"
                placeholder={COPY.taxIdPlaceholder}
                value={taxId}
                onChange={field(setTaxId, "taxId")}
                image={taxIdImage}
                onImage={field(setTaxIdImage, "taxId")}
                invalid={Boolean(invalid.taxId)}
              />
              <VerificationField
                label={COPY.license}
                name="liquor-license"
                placeholder={COPY.licensePlaceholder}
                value={license}
                onChange={field(setLicense, "license")}
                image={licenseImage}
                onImage={field(setLicenseImage, "license")}
                invalid={Boolean(invalid.license)}
              />
            </div>

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

              {status === "error" ? (
                <div className="mt-6">
                  <ErrorNotice message={COPY.orderFailed} mailto={mailtoFallback(buildPayload())} />
                </div>
              ) : null}

              <div className="mt-8">
                <GhostButton
                  type="submit"
                  disabled={status === "submitting"}
                  pulsing={status === "submitting"}
                  className="w-full sm:w-auto sm:min-w-[14rem]"
                >
                  {status === "submitting" ? COPY.submitting : COPY.submit}
                </GhostButton>
              </div>
            </div>
          </FormSection>
        </form>
      )}
    </div>
  );
}
