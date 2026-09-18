import type { Locale } from "@/i18n/config";

/**
 * Sales happen at a place, so times are shown in that place's zone rather than
 * the viewer's. Everything renders on the server, so pinning the zone also
 * keeps the markup stable between the server and the browser.
 */
export const TIME_ZONE = process.env.NEXT_PUBLIC_TIME_ZONE ?? "America/Toronto";

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "CAD";

function bcp47(locale: Locale): string {
  return locale === "fr" ? "fr-CA" : "en-CA";
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(bcp47(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(iso));
}

export function formatDateShort(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(bcp47(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(iso));
}

export function formatTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(bcp47(locale), {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: Locale): string {
  return `${formatDate(iso, locale)}, ${formatTime(iso, locale)}`;
}

/** The three lines of the tear-off date tab on a sale listing. */
export function dateTab(iso: string, locale: Locale): { weekday: string; day: string; month: string } {
  const date = new Date(iso);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(bcp47(locale), { ...options, timeZone: TIME_ZONE }).format(date);

  return {
    weekday: part({ weekday: "short" }).replace(".", ""),
    day: part({ day: "numeric" }),
    month: part({ month: "short" }).replace(".", ""),
  };
}

export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(bcp47(locale), { style: "currency", currency: CURRENCY }).format(amount);
}

export function formatCoordinates(latitude: number, longitude: number, locale: Locale): string {
  const number = new Intl.NumberFormat(bcp47(locale), { maximumFractionDigits: 4 });
  return `${number.format(latitude)}, ${number.format(longitude)}`;
}

const WALL_CLOCK = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: TIME_ZONE,
});

function wallClockParts(instant: Date): Record<string, string> {
  return Object.fromEntries(
    WALL_CLOCK.formatToParts(instant)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

/** `datetime-local` wants a zone-less `YYYY-MM-DDTHH:mm` in the displayed zone. */
export function toDateTimeLocal(iso: string): string {
  const p = wallClockParts(new Date(iso));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** How far TIME_ZONE is from UTC at a given instant, in milliseconds. */
function zoneOffset(instant: Date): number {
  const p = wallClockParts(instant);
  const asUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second),
  );
  return asUtc - instant.getTime();
}

/**
 * Turns a `datetime-local` value back into an RFC 3339 instant. The value is a
 * wall clock reading in TIME_ZONE with no offset of its own, so the offset is
 * resolved twice: once from the naive guess, once from the corrected instant,
 * which settles the hour on either side of a daylight-saving change.
 */
export function fromDateTimeLocal(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return null;

  const naive = new Date(`${value.slice(0, 16)}:00Z`);
  if (Number.isNaN(naive.getTime())) return null;

  let instant = new Date(naive.getTime() - zoneOffset(naive));
  instant = new Date(naive.getTime() - zoneOffset(instant));

  return instant.toISOString();
}

/** A `date` input covers the whole day, so it starts at midnight in TIME_ZONE. */
export function fromDateOnly(value: string, endOfDay = false): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return fromDateTimeLocal(`${value}T${endOfDay ? "23:59" : "00:00"}`);
}

export function toDateOnly(iso: string): string {
  const p = wallClockParts(new Date(iso));
  return `${p.year}-${p.month}-${p.day}`;
}

export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
