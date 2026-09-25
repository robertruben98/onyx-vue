import type { ComponentDoc } from "../../docs-model";

export const confirmButtonDoc: ComponentDoc = {
  id: "confirm-button",
  title: "Confirm Button",
  description:
    "A button that asks twice before doing something that cannot be taken back. The first click arms it and turns the label into the question; the second, within the timeout, confirms. It disarms on timeout, Esc, blur, and when another confirm button is armed — only one asks at a time.",
  imports: ["UiConfirmButton"],
  api: [
    { name: "label", type: "string", default: "—", description: "Resting label: what it does." },
    { name: "confirmLabel", type: "string", default: "'confirm?'", description: "Label while armed." },
    { name: "armedHint", type: "string", default: "'press again to confirm'", description: "Announced to assistive tech when it arms." },
    { name: "timeout", type: "number", default: "6000", description: "Milliseconds it stays armed." },
    { name: "variant", type: "ButtonVariant", default: "'secondary'", description: "Resting variant." },
    { name: "armedVariant", type: "ButtonVariant", default: "'danger'", description: "Variant while armed." },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'sm'", description: "Control size." },
    { name: "disabled", type: "boolean", default: "false", description: "Disabled; also disarms." },
    { name: "loading", type: "boolean", default: "false", description: "Work in flight after confirming." },
    { name: "@armed / @disarmed", type: "() => void", default: "—", description: "State changes." },
    { name: "@confirmed", type: "() => void", default: "—", description: "Second click within the timeout." },
  ],
  demos: [
    {
      title: "Writes that go to GitHub",
      setup: () => ({ done: "" }),
      code: `<UiConfirmButton label="publicar plan" confirm-label="¿publicar?" @confirmed="done = 'publicado'" />
<UiConfirmButton label="cerrar PR" confirm-label="confirmar · cerrar" @confirmed="done = 'cerrada'" />
<span>{{ done }}</span>`,
    },
  ],
};
