import type { ComponentDoc } from "../../docs-model";

export const relativeTimeDoc: ComponentDoc = {
  id: "relative-time",
  title: "Relative Time",
  description:
    "A compact age — 5m, 3h, 2d, 4mo — with the absolute date in the title and a stale flag past a threshold. Takes its clock as a prop so it can be tested.",
  imports: ["UiRelativeTime", "formatRelative"],
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
    {
      name: "formatRelative(date: string | Date, now: Date): string",
      type: "exported function",
      default: "—",
      description:
        "Compact age — 0m, 5m, 3h, 2d, 4mo. A future date clamps to 0m rather than going negative. Takes `now` as a parameter, same as the component, so it stays testable.",
    },
    {
      name: "units",
      type: "RelativeUnits",
      default: "{ minute: 'm', hour: 'h', day: 'd', month: 'mo' }",
      description:
        "Suffixes for the four rungs. The only words the component renders, and so the only part a page in another language has to change — a Spanish console reading 16m, 3h, 5d and then 1mo mixes languages in the cell where it shows most.",
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
    {
      title: "In another language",
      code: `<UiRelativeTime :date="hace" :units="{ minute: 'm', hour: 'h', day: 'd', month: 'mes' }" />`,
      setup: () => ({ hace: new Date(Date.now() - 90 * 24 * 3600 * 1000) }),
    },
  ],
};
