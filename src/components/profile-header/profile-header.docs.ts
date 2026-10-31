import type { ComponentDoc } from "../../docs-model";

export const profileHeaderDoc: ComponentDoc = {
  id: "profile-header",
  title: "Profile Header",
  description:
    "The identity hero of a profile page: an xl avatar (initials on the name's gradient, optional progress ring), the name as a heading, a subtitle, actions and a row of 2–4 compact stats. It answers to its own width: under 26rem it stacks and centres, and the stats go two by two. Default library texts use provideOnyxLocale; explicit text props and slots take precedence. The defaults listed below are English.",
  imports: ["UiProfileHeader", "UiStatCard", "UiButton"],
  api: [
    { name: "name", type: "string", default: "—", description: "The person's name, rendered as the heading (the avatar is then decorative)." },
    { name: "headingLevel", type: "1 | 2 | 3 | 4 | 5 | 6", default: "2", description: "Heading level of the name." },
    { name: "subtitle", type: "string", default: "''", description: "One line under the name. `#subtitle` replaces it." },
    { name: "avatarSrc", type: "string", default: "''", description: "Avatar image; initials when missing or broken." },
    { name: "avatarSize", type: "'sm' | 'md' | 'lg' | 'xl'", default: "'xl'", description: "Avatar size." },
    { name: "avatarGradient", type: "boolean", default: "true", description: "Initials on the name's gradient (UiAvatar `gradient`)." },
    { name: "ringValue / ringMax / ringTone / ringGradient / ringLabel", type: "UiAvatar ring props", default: "null / 100 / 'primary' / false / ''", description: "A progress ring around the avatar, passed to UiAvatar." },
    { name: "variant", type: "'plain' | 'card'", default: "'plain'", description: "`card` adds a surface, border, radius and padding." },
    { name: "statsLabel", type: "string", default: "'Stats'", description: "Accessible name of the stats group." },
    { name: "#subtitle", type: "slot", default: "—", description: "Rich subtitle, e.g. a flag and the course." },
    { name: "#actions", type: "slot", default: "—", description: "Buttons beside the name (under it when narrow): Edit, Settings." },
    { name: "#stats", type: "slot", default: "—", description: "2–4 compact stats: UiStatCard size=\"sm\" or plain items. A role=group named by statsLabel." },
    { name: "#avatar", type: "slot", default: "—", description: "Replaces the avatar." },
  ],
  demos: [
    {
      title: "Profile with stats",
      code: `<UiProfileHeader name="Robert Ruben" subtitle="English B1 · LanguageCert" :ring-value="68" ring-gradient ring-label="Level 7: 68% to level 8">
  <template #actions><UiButton variant="secondary" size="sm">Edit</UiButton></template>
  <template #stats>
    <UiStatCard size="sm" value="7" label="Level" tone="primary" />
    <UiStatCard size="sm" value="12 days" label="Streak" />
    <UiStatCard size="sm" value="18" label="Days practised" />
    <UiStatCard size="sm" value="9 h" label="Practice time" />
  </template>
</UiProfileHeader>`,
    },
    {
      title: "Card, no stats",
      code: `<UiProfileHeader variant="card" name="Ada Lovelace" subtitle="Norsk A1" :heading-level="3" />`,
    },
  ],
};
