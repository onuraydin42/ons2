"use client";

/**
 * Form primitives for the trade portal.
 *
 * Same restraint as the rest of the site: hairline borders, uppercase labels,
 * and no colour until something is wrong. As on the live forms, a problem is
 * shown by highlighting the field — the one message is the banner above the
 * form. Inputs sit at 16px, which is also what stops iOS from zooming the page
 * on focus.
 */

const LABEL = "block text-[12px] uppercase tracking-widest2 text-ink-soft";

/* Placeholders are faint and disappear the moment a field is focused, so they
 * read as a hint and are never mistaken for a value already filled in. The
 * value itself stays at 16px: any smaller and iOS zooms the page on focus. */
const CONTROL =
  "w-full rounded-md border bg-ivory/85 px-4 py-4 text-base text-ink outline-none transition-colors duration-500 placeholder:text-ink-faint focus:bg-ivory focus:placeholder:text-transparent";

const borderFor = (invalid: boolean) =>
  invalid
    ? "border-red-700/60 bg-red-50/80"
    : "border-ink/20 hover:border-ink/35 focus:border-gold-deep";

/** A quiet line of guidance under a field. */
export function FieldNote({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2.5 text-[13.5px] leading-relaxed text-ink-muted">
      {children}
    </p>
  );
}

interface BaseProps {
  label: string;
  name: string;
  invalid?: boolean;
  required?: boolean;
  note?: React.ReactNode;
}

export function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  invalid = false,
  required,
  autoComplete,
  inputMode,
  note,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "email" | "tel";
}) {
  const noteId = note ? `${name}-note` : undefined;

  return (
    <div>
      <label htmlFor={name} className={LABEL}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={invalid}
        aria-describedby={noteId}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-3 ${CONTROL} ${borderFor(invalid)}`}
      />
      {note ? <FieldNote id={noteId}>{note}</FieldNote> : null}
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  invalid = false,
  required,
  note,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  const noteId = note ? `${name}-note` : undefined;

  return (
    <div>
      <label htmlFor={name} className={LABEL}>
        {label}
      </label>
      <div className="relative mt-3">
        <select
          id={name}
          name={name}
          value={value}
          required={required}
          aria-invalid={invalid}
          aria-describedby={noteId}
          onChange={(event) => onChange(event.target.value)}
          className={`${CONTROL} ${borderFor(invalid)} appearance-none pr-12 ${value ? "text-ink" : "text-ink-faint"}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-ink">
              {option}
            </option>
          ))}
        </select>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
        >
          <path d="M6 9 L12 15 L18 9" />
        </svg>
      </div>
      {note ? <FieldNote id={noteId}>{note}</FieldNote> : null}
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  invalid = false,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={LABEL}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={4}
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-3 resize-none ${CONTROL} ${borderFor(invalid)}`}
      />
    </div>
  );
}

/**
 * Two mutually exclusive answers shown side by side — one tap, both options
 * visible, which a dropdown cannot offer. Real radio inputs underneath, so
 * arrow keys and screen readers behave as they should.
 */
export function ChoiceField<T extends string>({
  label,
  name,
  value,
  onChange,
  options,
  invalid = false,
}: Omit<BaseProps, "note"> & {
  value: T | "";
  onChange: (value: T) => void;
  options: readonly T[];
}) {
  return (
    <div role="radiogroup" aria-labelledby={`${name}-label`} aria-invalid={invalid}>
      <span id={`${name}-label`} className={LABEL}>
        {label}
      </span>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {options.map((option) => {
          const checked = value === option;
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center justify-center rounded-md border px-4 py-4 text-center text-[12px] uppercase tracking-widest2 transition-all duration-500 ease-lux has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-gold-deep ${
                checked
                  ? "border-ink bg-ink text-ivory"
                  : invalid
                    ? "border-red-700/60 bg-red-50/80 text-ink-soft hover:text-ink"
                    : "border-ink/20 bg-ivory/85 text-ink-soft hover:border-ink/45 hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
}

/** A titled block inside a long form — "Delivery Details", and so on. */
export function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-9 border-t border-ink/15 pt-14">
      <h2 className="font-display text-[1.7rem] font-normal tracking-tight text-ink sm:text-[2.1rem]">{title}</h2>
      {children}
    </section>
  );
}

/** The live forms' one message: shown above the form when a field needs attention. */
export function ReviewBanner({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-md border border-red-700/30 bg-red-50/80 px-5 py-4 text-[14px] text-red-900">
      {message}
    </p>
  );
}

/** The house button: hairline border, wide tracking, ink on hover. */
export function GhostButton({
  children,
  onClick,
  type = "button",
  disabled,
  pulsing,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  pulsing?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative border border-ink px-9 py-4 text-[12px] uppercase tracking-widest2 text-ink transition-all duration-500 ease-lux hover:bg-ink hover:text-ivory active:bg-ink active:text-ivory disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-ink sm:px-11 sm:py-[1.125rem] ${
        pulsing ? "animate-fo-pulse" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
