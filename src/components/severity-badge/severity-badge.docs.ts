import type { ComponentDoc } from "../../docs-model";

export const severityBadgeDoc: ComponentDoc = {
  id: "severity-badge",
  title: "Severity Badge",
  description:
    "The severity scale of a security or alert list. Ships with severityRank(), the sort key that orders worst first, so every consumer sorts on the same scale instead of copying its own map.",
  imports: ["UiSeverityBadge"],
  api: [
    {
      name: "severity",
      type: "'critical' | 'high' | 'moderate' | 'medium' | 'low' | 'unknown'",
      default: "'unknown'",
      description: "Severity reported. `medium` renders as `moderate`.",
    },
    {
      name: "#default",
      type: "slot",
      default: "the severity",
      description: "Overrides the visible text.",
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
