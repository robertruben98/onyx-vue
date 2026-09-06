import type { ComponentDoc } from "../../docs-model";

export const relativeTimeDoc: ComponentDoc = {
  id: "relative-time",
  title: "Relative Time",
  description:
    "A compact age — 5m, 3h, 2d, 4mo — with the absolute date in the title and a stale flag past a threshold. Takes its clock as a prop so it can be tested.",
  imports: ["UiRelativeTime"],
  api: [
    {
      name: "date",
      type: "string | Date",
      default: "—",
      description: "The moment being aged.",
    },
    {
      name: "staleAfterDays",
      type: "number",
      default: "3",
      description: "Age past which the value renders as stale.",
    },
    {
      name: "now",
      type: "Date",
      default: "new Date()",
      description: "Clock, injectable for deterministic tests.",
    },
  ],
  demos: [
    {
      title: "Ages",
      code: `<UiRelativeTime :date="hace5m" :now="ahora" />
<UiRelativeTime :date="hace3h" :now="ahora" />
<UiRelativeTime :date="hace2d" :now="ahora" />
<UiRelativeTime :date="hace40d" :now="ahora" />`,
      setup: () => {
        const ahora = new Date();
        const atras = (ms: number) => new Date(ahora.getTime() - ms);
        return {
          ahora,
          hace5m: atras(5 * 60_000),
          hace3h: atras(3 * 3_600_000),
          hace2d: atras(2 * 86_400_000),
          hace40d: atras(40 * 86_400_000),
        };
      },
    },
  ],
};
