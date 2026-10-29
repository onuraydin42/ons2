"use client";

/**
 * Form primitives for the trade portal.
 *
 * Same restraint as the rest of the site: hairline borders instead of filled
 * boxes, uppercase labels, and no colour until something is wrong. The type is
 * set a size up from the brand site's micro-labels — a form is read closely and
 * often filled in on a phone — and inputs sit at 16px, which is also what stops
 * iOS from zooming the page on focus.
 */

const LABEL = "block text-xs font-light uppercase tracking-widest2 text-white/60 sm:text-[13px]";

/* Placeholders are faint and disappear the moment a field is focused, so they
 * read as a hint and are never mistaken for a value already filled in. */
const CONTROL =
  "w-full rounded-md border bg-white/[0.02] px-4 py-4 text-base font-light text-platinum outline-none transition-colors duration-500 placeholder:text-white/30 focus:placeholder:text-transparent";

const borderFor = (invalid: boolean) =>
  invalid ? "border-red-400/50" : "border-white/15 hover:border-white/25 focus:border-ice/50";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2.5 text-[13px] font-light text-red-300/85">{message}</p>;
}

/** A quiet line of guidance under a field. */
export function FieldNote({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2.5 text-[13px] font-light leading-relaxed text-white/45">
      {children}
    </p>
  );
}

interface BaseProps {
  label: string;
  name: string;
  error?: string;
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
  error,
  invalid,
  required,
  autoComplete,
  inputMode,
  note,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "email" | "tel";
  /** Marks the field without printing a message — for groups that report one
   * error beneath several controls. */
  invalid?: boolean;
}) {
  const noteId = note ? `${name}-note` : undefined;
  const isInvalid = invalid ?? Boolean(error);

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
        aria-invalid={isInvalid}
        aria-describedby={noteId}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-3 ${CONTROL} ${borderFor(isInvalid)}`}
      />
      {note ? <FieldNote id={noteId}>{note}</FieldNote> : null}
      <FieldError message={error} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
  required,
  note,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
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
          aria-invalid={Boolean(error)}
          aria-describedby={noteId}
          onChange={(event) => onChange(event.target.value)}
          className={`${CONTROL} ${borderFor(
            Boolean(error),
          )} appearance-none pr-12 ${value ? "text-platinum" : "text-white/30"}`}
        >
          <option value="" disabled className="bg-ink-900 text-white/40">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-ink-900 text-platinum">
              {option}
            </option>
          ))}
        </select>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45"
        >
          <path d="M6 9 L12 15 L18 9" />
        </svg>
      </div>
      {note ? <FieldNote id={noteId}>{note}</FieldNote> : null}
      <FieldError message={error} />
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  optional,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className={LABEL}>
        {label}
        {optional ? <span className="ml-2 text-white/30">(optional)</span> : null}
      </label>
      <textarea
        id={name}
        name={name}
        rows={4}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-3 resize-none ${CONTROL} ${borderFor(Boolean(error))}`}
      />
      <FieldError message={error} />
    </div>
  );
}

/**
 * Two or three mutually exclusive answers shown side by side — one tap, every
 * option visible, which a dropdown cannot offer. Real radio inputs underneath,
 * so arrow keys and screen readers behave as they should.
 */
export function ChoiceField<T extends string>({
  label,
  name,
  value,
  onChange,
  options,
  error,
}: Omit<BaseProps, "note"> & {
  value: T | "";
  onChange: (value: T) => void;
  options: readonly T[];
}) {
  return (
    <div role="radiogroup" aria-labelledby={`${name}-label`} aria-invalid={Boolean(error)}>
      <span id={`${name}-label`} className={LABEL}>
        {label}
      </span>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {options.map((option) => {
          const checked = value === option;
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center justify-center rounded-md border px-4 py-4 text-center text-xs font-light uppercase tracking-widest2 transition-all duration-500 ease-lux has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ice/70 sm:text-[13px] ${
                checked
                  ? "border-ice/60 bg-ice/[0.08] text-platinum shadow-[0_0_30px_-12px_rgba(191,211,224,0.45)]"
                  : error
                    ? "border-red-400/50 text-white/60 hover:text-platinum"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-platinum"
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
      <FieldError message={error} />
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
    <section className="space-y-9 border-t border-white/10 pt-14">
      <h2 className="text-metal font-display text-3xl font-normal tracking-tight sm:text-4xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** The house button: hairline border, wide tracking, glow on hover. */
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
      className={`group relative border border-white/20 px-9 py-4 text-xs font-light uppercase tracking-widest2 text-platinum/90 transition-all duration-500 ease-lux hover:border-ice/60 hover:text-platinum hover:shadow-[0_0_36px_-8px_rgba(191,211,224,0.35)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-white/20 disabled:hover:shadow-none sm:px-11 sm:py-[1.125rem] sm:text-[13px] ${
        pulsing ? "animate-fo-pulse" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
