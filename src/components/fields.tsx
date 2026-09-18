import { field, hint as hintClass, label as labelClass } from "./ui";

interface Shared {
  id: string;
  label: string;
  hint?: string;
  optionalLabel?: string;
}

function Wrapper({
  id,
  label,
  hint,
  optionalLabel,
  children,
}: Shared & { children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {optionalLabel && <span className="ml-2 font-normal text-dusk">({optionalLabel})</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className={`${hintClass} mt-1.5`}>{hint}</p>}
    </div>
  );
}

export function TextField({
  id,
  label,
  hint,
  optionalLabel,
  ...props
}: Shared & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper id={id} label={label} hint={hint} optionalLabel={optionalLabel}>
      <input id={id} className={field} {...props} />
    </Wrapper>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  optionalLabel,
  ...props
}: Shared & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrapper id={id} label={label} hint={hint} optionalLabel={optionalLabel}>
      <textarea id={id} rows={3} className={`${field} resize-y`} {...props} />
    </Wrapper>
  );
}

/**
 * A date field, with a floor on its width. The browser lays out the date
 * segments itself and silently clips them when the box is too narrow — there is
 * no overflow to detect, the text simply goes missing — so the field refuses to
 * be squeezed rather than trusting whatever column it lands in. `datetime-local`
 * needs more room because it carries a time as well.
 */
export function DateField({
  id,
  label,
  hint,
  optionalLabel,
  withTime = false,
  ...props
}: Shared & { withTime?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper id={id} label={label} hint={hint} optionalLabel={optionalLabel}>
      <input
        id={id}
        type={withTime ? "datetime-local" : "date"}
        className={`${field} ${withTime ? "min-w-[13rem]" : "min-w-[9.5rem]"}`}
        {...props}
      />
    </Wrapper>
  );
}

/**
 * The native select keeps its semantics and its platform menu; only the closed
 * state is restyled. The chevron is drawn in the markup rather than set as a
 * background image so it takes its colour from the theme.
 */
export function SelectField({
  id,
  label,
  hint,
  optionalLabel,
  children,
  ...props
}: Shared & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrapper id={id} label={label} hint={hint} optionalLabel={optionalLabel}>
      <div className="relative">
        <select id={id} className={`${field} cursor-pointer appearance-none pr-10`} {...props}>
          {children}
        </select>
        <Chevron />
      </div>
    </Wrapper>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 8"
      className="pointer-events-none absolute right-3.5 top-1/2 h-2 w-3 -translate-y-1/2 text-ink-soft"
    >
      <path
        d="M1 1.5 6 6.5 11 1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A checkbox and its label as one target. The row fills in when it is ticked,
 * so a set of them can be read at a glance rather than box by box.
 */
export function CheckboxField({
  id,
  label,
  description,
  swatch,
  ...props
}: {
  id: string;
  label: string;
  description?: string;
  /** A colour that means something elsewhere in the UI, echoed here. */
  swatch?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      htmlFor={id}
      className="group flex cursor-pointer items-start gap-2.5 rounded-tab border border-transparent px-2.5 py-2 transition-colors hover:bg-ink/5 has-[:checked]:border-route/30 has-[:checked]:bg-route/8"
    >
      <input id={id} type="checkbox" className="checkbox mt-0.5" {...props} />

      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          {swatch && <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${swatch}`} />}
          {label}
        </span>
        {description && <span className="mt-0.5 block text-xs text-ink-soft">{description}</span>}
      </span>
    </label>
  );
}
