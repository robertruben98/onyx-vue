import type { ComponentDoc } from "../../docs-model";

export const statCardDoc: ComponentDoc = {
  id: "stat-card",
  title: "Stat Card",
  description:
    "One prominent figure — a streak, a level, the days left — with its label, an optional hint and a trend that is said in words, not only shown by an arrow or a colour. The value dominates; the label is read first. `as=\"button\"` or `as=\"a\"` makes it tappable like UiCard.",
  imports: ["UiStatCard"],
  api: [
    { name: "value", type: "string | number | null", default: "null", description: "The figure, already formatted. Empty shows `emptyValue`." },
    { name: "label", type: "string", default: "—", description: "What the figure is. Read before the value." },
    { name: "hint", type: "string", default: "''", description: "Secondary line under the label." },
    { name: "tone", type: "'neutral' | 'primary' | 'success' | 'warning' | 'danger'", default: "'neutral'", description: "Colour of the value (4.5:1 on the surface in every theme)." },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Value 22, 30 or 40px, with matching padding." },
    { name: "variant", type: "'card' | 'plain'", default: "'card'", description: "`card`: surface, border, radius. `plain`: the bare figure, for a header row." },
    { name: "trend", type: "'up' | 'down' | 'flat' | null", default: "null", description: "Direction of change: a decorative arrow plus the word (\"Up\", \"Down\", \"No change\")." },
    { name: "trendLabel", type: "string", default: "''", description: "Visible change, e.g. \"+3 this week\". With it, the direction word is visually hidden but still read." },
    { name: "trendText", type: "string", default: "''", description: "Replaces the direction word (another language, or \"Better\")." },
    { name: "as", type: "'div' | 'button' | 'a'", default: "'div'", description: "`button` and `a`: the whole card is one control, ≥44px, outline ring, pressed state." },
    { name: "href", type: "string", default: "undefined", description: "Link target with as=\"a\"." },
    { name: "disabled", type: "boolean", default: "false", description: "Disables an as=\"button\" card." },
    { name: "loading", type: "boolean", default: "false", description: "A skeleton in place of the value and aria-busy on the card." },
    { name: "emptyValue", type: "string", default: "'—'", description: "What an empty value shows." },
    { name: "#icon", type: "slot", default: "—", description: "Decorative icon (aria-hidden), in --ui-stat-card-icon-color." },
    { name: "#value", type: "slot", default: "—", description: "Custom value markup." },
  ],
  demos: [
    {
      title: "Sizes and tones",
      code: `<UiStatCard size="sm" value="12 days" label="Streak" />
<UiStatCard value="56" label="Level" hint="2,340 XP" tone="primary" />
<UiStatCard size="lg" value="72%" label="Exam readiness" tone="success" />`,
    },
    {
      title: "Trend",
      code: `<UiStatCard value="4 h 20 min" label="Practice this week" trend="up" trend-label="+35 min" />
<UiStatCard value="3" label="Repeated mistakes" trend="down" trend-label="−2 since Monday" tone="success" />
<UiStatCard value="18" label="Days practised" trend="flat" />`,
    },
    {
      title: "Tappable and loading",
      code: `<UiStatCard as="button" value="128" label="Answer bank" hint="Open your saved answers" />
<UiStatCard label="Marked by the AI" loading />`,
    },
  ],
};
