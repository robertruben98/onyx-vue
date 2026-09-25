import type { ComponentDoc } from "../../docs-model";
import { useToast } from "./toast-store";

export const toastDoc: ComponentDoc = {
  id: "toast",
  title: "Toast",
  description:
    "Transient messages about something that just happened. Call useToast().show() from anywhere — a click handler, a polling composable — and mount one UiToastHost per page to render them. Danger toasts go to an assertive live region, the rest to a polite one; at most three are shown.",
  imports: ["UiToastHost", "useToast", "UiButton"],
  api: [
    { name: "useToast().show", type: "(message, { tone?, duration? }) => id", default: "—", description: "Queues a message. duration in ms (default 3200); 0 keeps it until dismissed." },
    { name: "useToast().dismiss", type: "(id) => void", default: "—", description: "Removes one message." },
    { name: "useToast().clear", type: "() => void", default: "—", description: "Removes all messages." },
    { name: "tone", type: "'neutral' | 'success' | 'warning' | 'danger'", default: "'neutral'", description: "Semantic tone; danger is announced assertively." },
    { name: "dismissLabel", type: "string", default: "'Dismiss'", description: "UiToastHost: accessible name of each dismiss button." },
  ],
  demos: [
    {
      title: "Tones",
      description: "The host is mounted by the page; the buttons call useToast().show() through the demo's setup.",
      setup: () => {
        const { show } = useToast();
        return { show };
      },
      code: `<UiToastHost />
<UiButton size="sm" variant="secondary" @clicked="show('cola pausada')">neutral</UiButton>
<UiButton size="sm" variant="secondary" @clicked="show('PR encolada', { tone: 'success' })">success</UiButton>
<UiButton size="sm" variant="secondary" @clicked="show('cuota casi llena', { tone: 'warning' })">warning</UiButton>
<UiButton size="sm" variant="danger" @clicked="show('no se pudo lanzar', { tone: 'danger' })">danger</UiButton>`,
    },
  ],
};
