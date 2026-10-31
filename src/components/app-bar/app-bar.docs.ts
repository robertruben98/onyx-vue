import type { ComponentDoc } from "../../docs-model";

export const appBarDoc: ComponentDoc = {
  id: "app-bar",
  title: "App Bar",
  description:
    "The bar across the top of a console page: title on the left, the state of things in the middle, actions on the right. Sticky by default, and it wraps onto a second row instead of overflowing when the page gets narrow. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiAppBar", "UiButton", "UiStatusDot"],
  api: [
    { name: "title", type: "string", default: "''", description: "What the page shows; rendered as its heading." },
    { name: "subtitle", type: "string", default: "''", description: "Secondary line beside the title. Truncates first." },
    { name: "eyebrow", type: "string", default: "''", description: "Small caps line above the title." },
    {
      name: "headingLevel",
      type: "0 | 1 | 2 | 3",
      default: "1",
      description: "Heading level of the title; 0 renders plain text for pages that already have an h1.",
    },
    { name: "sticky", type: "boolean", default: "true", description: "Sticks the bar to the top of the page." },
    {
      name: "collapseBelow",
      type: "number",
      default: "0",
      description:
        "Viewport width in px under which status and actions fold behind a menu button, and eyebrow and title truncate to one line. The menu closes with Escape, a tap outside or choosing a button or link in it. 0 never folds.",
    },
    { name: "menuLabel", type: "string", default: "'Menu'", description: "Accessible name of the menu button." },
    { name: "#brand", type: "slot", default: "—", description: "Replaces eyebrow, title and subtitle." },
    { name: "#status", type: "slot", default: "—", description: "Middle region: a state line, a meter, a stamp." },
    { name: "#actions", type: "slot", default: "—", description: "Right region: buttons." },
  ],
  demos: [
    {
      title: "Folds into a menu on phones",
      description: "Make the window narrower than 640px: the actions move behind the menu button.",
      code: `<UiAppBar eyebrow="LanguageCert · B1" title="English B1 Sprint" :collapse-below="640" :sticky="false" :heading-level="0">
  <template #status>progress synced</template>
  <template #actions>
    <UiButton variant="secondary">Grammar drills</UiButton>
    <UiButton variant="text">Log out</UiButton>
  </template>
</UiAppBar>`,
    },
    {
      title: "Title, status and actions",
      code: `<UiAppBar title="Todos los agentes" subtitle="12 agentes" :sticky="false" :heading-level="0">
  <template #status>
    <UiStatusDot state="live" /> <span>3 corriendo</span>
    <span>12:04:31</span>
  </template>
  <template #actions>
    <UiButton size="sm" variant="secondary">opciones</UiButton>
    <UiButton size="sm">refrescar</UiButton>
  </template>
</UiAppBar>`,
    },
    {
      title: "With an eyebrow",
      code: `<UiAppBar eyebrow="Banco de pruebas OIDC" title="tiendasopenidconnect.local.com" :sticky="false" :heading-level="0">
  <template #actions><UiButton>Lanzar</UiButton></template>
</UiAppBar>`,
    },
  ],
};
