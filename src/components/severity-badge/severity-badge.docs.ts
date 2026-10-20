import type { ComponentDoc } from "../../docs-model";

export const severityBadgeDoc: ComponentDoc = {
  id: "severity-badge",
  title: "Severity Badge",
  description:
    "The severity scale of a security or alert list. Ships with severityRank(), the sort key that orders worst first, so every consumer sorts on the same scale instead of copying its own map.",
  imports: ["UiSeverityBadge", "severityRank"],
  api: [
    {
      name: "severity",
      type: "'critical' | 'high' | 'moderate' | 'medium' | 'low' | 'unknown'",
      default: "'unknown'",
      description:
        "Severity reported. `medium` looks like `moderate` — they share a rung — but the visible text still reads `medium`, since the default slot renders `{{ severity }}`.",
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
