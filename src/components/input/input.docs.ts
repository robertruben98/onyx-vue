import type { ComponentDoc } from "../../docs-model";

export const inputDoc: ComponentDoc = {
  id: "input",
  title: "Input",
  description:
    "Single-line text field with a visible label or an accessible name. Exposes `focus()` and `select()`, because a `ref` on the component is not an element and `ref.querySelector('input')` throws. Listening to a deprecated event warns once per name per page load in development; old events remain until 1.0.",
  imports: ["UiInput"],
  api: [
    {
      name: "v-model",
      type: "string",
      default: "''",
      description: "Two-way bound value.",
    },
    {
      name: "type",
      type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local'",
      default: "'text'",
      description: "Native input type.",
    },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Control height." },
    { name: "variant", type: "'default' | 'pill'", default: "'default'", description: "`pill` is the search field: 40 px, fully round, filled (`--ui-input-pill-bg`), no border, with a leading search glyph. Pair it with `type=\"search\"` and an `ariaLabel`." },
    { name: "placeholder", type: "string", default: "''", description: "Placeholder text." },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible label, rendered as a `<label>` linked to the input.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when there is no visible label.",
    },
    {
      name: "invalid",
      type: "boolean",
      default: "false",
      description: "Sets `aria-invalid` and the invalid border token.",
    },
    { name: "disabled", type: "boolean", default: "false", description: "Disabled state. Greys the text out; to show a value that cannot change, use `readonly`." },
    { name: "readonly", type: "boolean", default: "false", description: "The value can be read, selected and copied but not edited, in the normal text colour (a learner's answer after a check)." },
    { name: "fluid", type: "boolean", default: "false", description: "Block and full width: fills its column instead of sitting inline at its intrinsic width." },
    { name: "icon", type: "'search'", default: "—", description: "Decorative leading icon (`aria-hidden`) inside the field. The `leading` slot replaces it; with `variant=\"pill\"` the pill's own glyph is used (never two)." },
    { name: "clearable", type: "boolean", default: "false", description: "Shows a clear button (named by the locale `inputClearLabel`, \"Clear\") while the value is not empty and the field is neither disabled nor readonly. Clicking it, or pressing Escape, empties the value, emits `cleared` and returns focus to the input. Pair with `type=\"search\"` to keep native semantics." },
    { name: "leading / trailing", type: "slots", default: "—", description: "Content placed inside the field before / after the text (an icon, a unit, a button). Trailing content sits before the clear button." },
    { name: "@cleared", type: "() => void", default: "—", description: "Emitted after the clear button or Escape emptied the value (`v-model` and `@valueChanged` fire with `''` first)." },
    {
      name: "@valueChanged / @valueChange",
      type: "(value: string) => void",
      default: "—",
      description: "Emitted on every change, in addition to `v-model`. `@valueChange` is the deprecated name of the same event, still emitted until 1.0.",
    },
    {
      name: "focus() / select()",
      type: "exposed methods",
      default: "—",
      description:
        "Focus or select the native input through a component ref: `caja.value?.focus()`.",
    },
  ],
  demos: [
    {
      title: "Basic",
      code: `<UiInput v-model="value" label="Email" type="email" placeholder="you@example.com" />
<span>value: {{ value || '(empty)' }}</span>`,
      setup: () => ({ value: "" }),
    },
    {
      title: "Sizes",
      code: `<UiInput size="sm" label="Small" placeholder="sm" />
<UiInput label="Medium" placeholder="md" />
<UiInput size="lg" label="Large" placeholder="lg" />`,
    },
    {
      title: "Invalid and disabled",
      code: `<UiInput label="Invalid" invalid placeholder="Required" />
<UiInput label="Disabled" disabled model-value="Read only" />`,
    },
    {
      title: "Search icon and clearable",
      code: `<UiInput v-model="q" type="search" icon="search" clearable aria-label="Search" placeholder="Search by repo, number or title" @cleared="n++" />
<UiInput v-model="q" clearable label="Name with slots">
  <template #leading>@</template>
  <template #trailing>.com</template>
</UiInput>
<span>cleared {{ n }} times</span>`,
      setup: () => ({ q: "onyx-vue", n: 0 }),
    },
    {
      title: "Programmatic focus",
      code: `<UiInput ref="caja" aria-label="Search" placeholder="Press the button" />
<UiButton size="sm" @clicked="$refs.caja.focus()">Focus the field</UiButton>`,
    },
  ],
};
