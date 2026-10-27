// Sample data for the operations overview: one production environment, a
// fixed clock, fourteen services. Everything the page shows is derived from
// these rows, so the KPIs, the chips and the table can never disagree.

import type { BarListItem, BarPoint, BarSeries, LogLine } from "@onyx/vue";

/** The page's "now". Fixed, so relative times read the same on every visit. */
export const NOW = new Date("2026-10-04T13:00:00Z");

export type Health = "healthy" | "degraded" | "down";

export interface Service {
  name: string;
  team: string;
  version: string;
  region: string;
  health: Health;
  /** p95 latency, ms. */
  p95: number;
  /** Share of 5xx responses, 0–1. */
  errorRate: number;
  /** Requests per minute. */
  rpm: number;
  deployedAt: string;
}

export const SERVICES: Service[] = [
  { name: "api-gateway", team: "platform", version: "v4.12.0", region: "eu-west-1", health: "healthy", p95: 41, errorRate: 0.0011, rpm: 4120, deployedAt: "2026-10-03T16:20:00Z" },
  { name: "auth", team: "identity", version: "v2.31.4", region: "eu-west-1", health: "healthy", p95: 63, errorRate: 0.0006, rpm: 1830, deployedAt: "2026-10-01T09:05:00Z" },
  { name: "payments-api", team: "payments", version: "v7.3.0", region: "eu-west-1", health: "down", p95: 2410, errorRate: 0.214, rpm: 380, deployedAt: "2026-10-04T09:38:00Z" },
  { name: "checkout", team: "payments", version: "v5.8.2", region: "eu-west-1", health: "healthy", p95: 188, errorRate: 0.0042, rpm: 610, deployedAt: "2026-09-30T14:10:00Z" },
  { name: "catalog", team: "storefront", version: "v3.4.1", region: "eu-central-1", health: "healthy", p95: 72, errorRate: 0.0008, rpm: 1490, deployedAt: "2026-10-02T11:45:00Z" },
  { name: "search", team: "storefront", version: "v6.0.0-rc.2", region: "eu-central-1", health: "degraded", p95: 640, errorRate: 0.0123, rpm: 970, deployedAt: "2026-10-04T07:15:00Z" },
  { name: "inventory", team: "fulfilment", version: "v1.19.3", region: "eu-west-1", health: "healthy", p95: 95, errorRate: 0.0015, rpm: 520, deployedAt: "2026-09-28T10:30:00Z" },
  { name: "notifications", team: "platform", version: "v2.7.0", region: "eu-west-1", health: "healthy", p95: 110, errorRate: 0.0021, rpm: 340, deployedAt: "2026-09-29T15:00:00Z" },
  { name: "orders", team: "fulfilment", version: "v4.2.5", region: "eu-west-1", health: "healthy", p95: 134, errorRate: 0.0029, rpm: 450, deployedAt: "2026-10-03T08:50:00Z" },
  { name: "pricing", team: "storefront", version: "v2.10.1", region: "eu-central-1", health: "healthy", p95: 58, errorRate: 0.0004, rpm: 880, deployedAt: "2026-09-25T13:20:00Z" },
  { name: "recommendations", team: "data", version: "v0.42.0", region: "eu-central-1", health: "degraded", p95: 410, errorRate: 0.0087, rpm: 760, deployedAt: "2026-10-04T10:05:00Z" },
  { name: "shipping", team: "fulfilment", version: "v3.0.7", region: "eu-west-1", health: "healthy", p95: 121, errorRate: 0.0018, rpm: 290, deployedAt: "2026-09-27T09:40:00Z" },
  { name: "users", team: "identity", version: "v5.1.2", region: "eu-west-1", health: "healthy", p95: 49, errorRate: 0.0007, rpm: 1210, deployedAt: "2026-10-02T17:25:00Z" },
  { name: "webhooks", team: "platform", version: "v1.6.0", region: "eu-west-1", health: "healthy", p95: 205, errorRate: 0.0035, rpm: 230, deployedAt: "2026-09-26T12:00:00Z" },
];

/** Requests per hour across all services, 14:00 yesterday to 13:00 today. */
export const TRAFFIC_SERIES: BarSeries[] = [
  { id: "requests", label: "Requests", tone: "one" },
];

export const TRAFFIC_24H: BarPoint[] = [
  612, 640, 655, 690, 702, 671, 598, 520, 431, 342, 268, 214,
  190, 186, 221, 305, 448, 571, 653, 688, 704, 719, 731, 745,
].map((thousands, i) => {
  const hour = String((14 + i) % 24).padStart(2, "0");
  // Two-digit labels: UiBarChart prints every category, and "14:00" x 24
  // overlaps in a side column. The full hour lives in the tooltip.
  return {
    label: hour,
    values: { requests: thousands * 1000 },
    tip: `${hour}:00 — ${thousands}k requests`,
  };
});

/** Incidents per day, oldest first: 90 days ending today. */
export const INCIDENTS_90D: number[] = (
  "000100000020000000010000000000003100000000000100000000" +
  "000000200000000001000000000000000011"
)
  .split("")
  .map(Number);

/** Share of each service's 30-day error budget already spent. */
export const ERROR_BUDGET: BarListItem[] = [
  { label: "payments-api", value: 92, tone: "bad", valueText: "92%" },
  { label: "search", value: 61, tone: "warn", valueText: "61%" },
  { label: "recommendations", value: 48, tone: "warn", valueText: "48%" },
  { label: "checkout", value: 22, tone: "ok", valueText: "22%" },
  { label: "auth", value: 9, tone: "ok", valueText: "9%" },
];

/** What happened today, newest first. */
export const ACTIVITY: LogLine[] = [
  { time: "12:58", action: "payments-api health check failed in 3 of 3 zones", result: "error", detail: "GET /healthz → 503 · upstream ledger-db timeout" },
  { time: "12:41", action: "Rollback of payments-api to v7.2.4 started", result: "pending", detail: "by on-call · ETA 6 min" },
  { time: "10:05", action: "recommendations v0.42.0 deployed", result: "ok", detail: "canary 10% → 100% in 22 min" },
  { time: "09:42", action: "Incident INC-2291 opened: payments-api 5xx above 20%", result: "error", detail: "paged payments on-call" },
  { time: "09:38", action: "payments-api v7.3.0 deployed", result: "ok", detail: "migration 0142 applied" },
  { time: "07:15", action: "search v6.0.0-rc.2 deployed to eu-central-1", result: "ok", detail: "p95 up from 180 ms to 640 ms since" },
];

/** Day `i` of INCIDENTS_90D as a calendar date, for the strip's tooltips. */
export function incidentDay(i: number): string {
  const day = new Date(NOW.getTime() - (INCIDENTS_90D.length - 1 - i) * 86_400_000);
  return day.toISOString().slice(0, 10);
}
