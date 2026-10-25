import type { ComponentDoc } from "../../docs-model";
import { useToast } from "./toast-store";

export const toastDoc: ComponentDoc = {
  id: "toast",
  title: "Toast",
  description:
    "Transient messages about something that just happened. Call useToast().show() from anywhere — a click handler, a polling composable — and mount one UiToastHost per page to render them. Danger toasts go to an assertive live region, the rest to a polite one; at most three are shown.",
  imports: ["UiToastHost", "useToast", "UiButton"],
  api: [
    { name: "useToast().show", type: "(message, { tone?, duration?, action? }) => id", default: "—", description: "Queues a message. duration in ms (default 3200, or 6000 with an action); 0 keeps it until dismissed. The countdown stops while focus or the pointer is inside the toast." },
    { name: "action", type: "{ label: string; onAction: () => void }", default: "undefined", description: "A button on the toast, such as Undo. It is in the Tab order (the host sits at the end of the page) and F8 jumps to it; activating it runs onAction, closes the toast and returns focus to where it came from." },
    { name: "useToast().pause / resume", type: "(id) => void", default: "—", description: "Stop and restart a toast's countdown. The host calls them on focus and hover; rarely needed by hand." },
    { name: "useToast().act", type: "(id) => void", default: "—", description: "Runs a toast's action and closes it, as if its button were pressed." },
    { name: "useToast().dismiss", type: "(id) => void", default: "—", description: "Removes one message." },
    { name: "useToast().clear", type: "() => void", default: "—", description: "Removes all messages." },
    { name: "tone", type: "'neutral' | 'success' | 'warning' | 'danger'", default: "'neutral'", description: "Semantic tone; danger is announced assertively." },
    { name: "dismissLabel", type: "string", default: "'Dismiss'", description: "UiToastHost: accessible name of each dismiss button." },
    { name: "hotkey", type: "string | null", default: "'F8'", description: "UiToastHost: key (KeyboardEvent.key) that moves focus to the newest toast's first button from anywhere on the page, so Undo is one key away instead of at the end of the Tab order. null turns it off." },
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
    {
      title: "With an action (Undo)",
      description: "F8 (or Tab at the end of the page) reaches the Undo button; the toast stays while it has focus.",
      setup: () => {
        const { show } = useToast();
        const remove = () => show("Removed from today's plan", { action: { label: "Undo", onAction: () => show("Restored") } });
        return { remove };
      },
      code: `<UiToastHost />
<UiButton size="sm" variant="secondary" @clicked="remove">Remove</UiButton>`,
    },
  ],
};
