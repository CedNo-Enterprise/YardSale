import type { SaleStatus, StopStatus } from "@/lib/api/types";

export const button = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-tab bg-route px-4 py-2.5 text-sm font-semibold text-on-route transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-tab border border-ink/25 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-60",
  quiet:
    "inline-flex items-center justify-center gap-1.5 rounded-tab border border-haze px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-ink/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex items-center justify-center gap-1.5 rounded-tab border border-flag/40 px-2.5 py-1.5 text-xs font-semibold text-flag transition-colors hover:bg-flag hover:text-paper disabled:cursor-not-allowed disabled:opacity-60",
  // The committing button in a confirmation, where the action carries the
  // weight and should look like it.
  destructive:
    "inline-flex items-center justify-center gap-2 rounded-tab bg-flag px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60",
} as const;

export const panel = "rounded-tab border border-haze bg-card";

// No `focus:outline-none` here: a class beats the zero-specificity
// `:focus-visible` rule in globals.css, which would leave keyboard users with
// nothing but a border tint to go on.
export const field =
  "w-full rounded-tab border border-haze bg-card px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-dusk hover:border-ink/30 focus:border-route";

export const label = "block text-sm font-semibold text-ink";

export const hint = "text-xs text-ink-soft";

export const link = "text-route underline decoration-route/35 underline-offset-2 hover:decoration-route";

/**
 * A sale's state is carried by the colour of the strip down its left edge, so
 * the list can be read without stopping to parse each label.
 */
export const saleEdge: Record<SaleStatus, string> = {
  scheduled: "bg-route",
  active: "bg-flag",
  completed: "bg-moss",
  cancelled: "bg-dusk",
};

export const saleTagTone: Record<SaleStatus, string> = {
  scheduled: "text-route",
  active: "text-flag",
  completed: "text-moss",
  cancelled: "text-dusk line-through decoration-dusk/60",
};

/**
 * The numbered circle on a route. The three states differ in fill and border
 * style as well as colour — outlined, solid, dashed — so they stay apart from
 * each other for a reader who cannot tell the colours apart.
 */
export const stopMarker: Record<StopStatus, string> = {
  planned: "border-ink/30 bg-card text-ink",
  visited: "border-moss bg-moss text-paper",
  skipped: "border-dashed border-dusk bg-card text-dusk",
};

/** The same three states as a 10px dot, where a dashed border would be mud. */
export const stopPip: Record<StopStatus, string> = {
  planned: "border-ink/30 bg-card",
  visited: "border-moss bg-moss",
  skipped: "border-dusk bg-dusk/40",
};

/**
 * A skipped stop is crossed off the list. The rule goes through the sale name,
 * which is long enough to carry it — struck through a single digit in the
 * marker it was invisible.
 */
export const stopName: Record<StopStatus, string> = {
  planned: "text-ink",
  visited: "text-ink",
  skipped: "text-dusk line-through decoration-dusk/80 decoration-[1.5px]",
};

export const stopTone: Record<StopStatus, string> = {
  planned: "text-ink-soft",
  visited: "text-moss",
  skipped: "text-dusk",
};
