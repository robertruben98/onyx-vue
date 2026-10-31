import type { ComponentDoc } from "../../docs-model";

export const severityBadgeDoc: ComponentDoc = {
  id: "severity-badge",
  title: "Severity Badge",
  description:
    "The severity scale of a security or alert list. Ships with severityRank(), the sort key that orders worst first, so every consumer sorts on the same scale instead of copying its own map. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiSeverityBadge", "severityRank"],
  api: [
    {
      name: "severity",
      type: "'critical' | 'very-high' | 'high' | 'moderate' | 'medium' | 'low' | 'very-low' | 'unknown'",
      default: "'unknown'",
      description:
        "Severity reported. `medium` looks like `moderate` — they share a rung — but the visible text still reads `medium`, since the default slot renders `{{ severity }}`. `very-low | low | medium | high | very-high` is a five-level scale: `very-high` looks and ranks like `critical`, `very-low` is green and ranks after `low`. Every level reaches 4.5:1 in light and dark.",
    },
    {
      name: "#default",
      type: "slot",
      default: "the severity",
      description: "Overrides the visible text.",
    },
    {
      name: "severityRank(severity: Severity | string): number",
      type: "exported function",
      default: "—",
      description:
        "Sort key, lower first: critical 0, high 1, moderate/medium 2, low 3, anything unrecognised 9. Consumers that list alerts sort on this instead of copying their own rank map.",
    },
  ],
  demos: [
    {
      title: "Scale",
      code: `<UiSeverityBadge severity="critical" />
<UiSeverityBadge severity="high" />
<UiSeverityBadge severity="moderate" />
<UiSeverityBadge severity="low" />
<UiSeverityBadge severity="unknown" />`,
    },
    {
      title: "With a count",
      code: `<UiSeverityBadge severity="high">high · 12</UiSeverityBadge>`,
    },
  ],
};
