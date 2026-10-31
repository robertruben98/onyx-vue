import { isDev } from "./dev";
import { warnDeprecated } from "./deprecation-warning";

/**
 * El vocabulario de tonos de la libreria.
 *
 * Habia dos: Alert, Badge, Tag, Readout y los KPI decian `success` /
 * `warning` / `danger`, y BlockMeter, FilterChip, MetricChip y TriStateCount
 * decian `ok` / `warn` / `danger`. Un consumidor tenia que recordar cual usaba
 * cada uno, y el compilador solo le avisaba despues de equivocarse.
 *
 * El canonico es el primero. Los otros nombres se siguen aceptando (no se
 * rompe a nadie en 0.x) y se traducen aqui; quedan marcados como obsoletos en
 * los tipos y se iran en 1.0.
 */
export type SemanticTone = "neutral" | "info" | "success" | "warning" | "danger" | "muted";

/** @deprecated Spellings kept for compatibility: use `success`, `warning`, `neutral`. */
export type LegacyTone = "ok" | "warn" | "default";

export const LEGACY_TONES = {
  ok: "success",
  warn: "warning",
  default: "neutral",
} as const satisfies Record<LegacyTone, SemanticTone>;

/** Traduce un nombre antiguo al canonico; el resto pasa tal cual. */
export function canonicalTone<T extends string>(tone: T): Exclude<T, LegacyTone> | SemanticTone {
  const replacement = Object.prototype.hasOwnProperty.call(LEGACY_TONES, tone)
    ? LEGACY_TONES[tone as LegacyTone]
    : undefined;
  if (isDev() && replacement) warnDeprecated("tone", tone, replacement);
  return replacement ?? (tone as Exclude<T, LegacyTone>);
}
