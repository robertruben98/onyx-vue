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

const LEGACY: Record<LegacyTone, SemanticTone> = {
  ok: "success",
  warn: "warning",
  default: "neutral",
};

/** Traduce un nombre antiguo al canonico; el resto pasa tal cual. */
export function canonicalTone<T extends string>(tone: T): Exclude<T, LegacyTone> | SemanticTone {
  return (LEGACY as Record<string, SemanticTone>)[tone] ?? (tone as Exclude<T, LegacyTone>);
}
