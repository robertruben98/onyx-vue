import type { ComponentDoc } from "../../docs-model";

export const mediaCardDoc: ComponentDoc = {
  id: "media-card",
  title: "Media Card",
  description:
    "Hover a card: its picture zooms inside its box. A thing best known by its picture — a series by its poster, a book by its cover. The image leads at a fixed aspect ratio, so a grid of them lines up whatever size each file is, and loads lazily. A missing or broken image becomes the title's initials on the gradient UiAvatar gives the same name. Lay several out with UiGrid `min-item-width`.",
  imports: ["UiMediaCard", "UiGrid", "UiTag", "UiButton"],
  api: [
    { name: "title", type: "string", default: "—", description: "What the card is: its heading, and the image's alt text unless `alt` is set." },
    { name: "src", type: "string", default: "''", description: "Image URL. Empty draws the initials placeholder." },
    { name: "alt", type: "string", default: "title", description: "Alternative text of the image; `\"\"` marks it decorative." },
    { name: "subtitle", type: "string", default: "''", description: "A second line: an original title, an author, a year." },
    { name: "href", type: "string", default: "''", description: "Makes the title a link." },
    { name: "target", type: "string", default: "undefined", description: "`target` of the title link; `_blank` adds `rel=\"noopener\"`." },
    { name: "ratio", type: "string", default: "'2 / 3'", description: "CSS aspect-ratio of the image box: `2 / 3` a poster, `1` a sleeve, `16 / 9` a still." },
    { name: "titleTag", type: "'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'", default: "'h3'", description: "Heading element of the title, to fit the page's outline." },
    { name: "zoom", type: "boolean", default: "true", description: "Zoom the picture inside its box on hover or when the title link has focus (450 ms, eased). Off under `prefers-reduced-motion` and on screens that cannot hover." },
    { name: "#badges", type: "slot", default: "—", description: "Laid over the top of the image: a status, a count." },
    { name: "#default", type: "slot", default: "—", description: "The card's details, under the subtitle." },
    { name: "#actions", type: "slot", default: "—", description: "Buttons at the foot of the card." },
  ],
  demos: [
    {
      title: "A grid of posters",
      description: "UiGrid fits as many columns as there is room for; the cards keep the same shape.",
      code: `<UiGrid min-item-width="10rem" :gap="3">
  <UiMediaCard title="The Exiled Heavy Knight" subtitle="Tsuihou Sareta Tensei Juukishi" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20200%20300'%3E%3Cdefs%3E%3ClinearGradient%20id='g'%20x1='0'%20y1='0'%20x2='0'%20y2='1'%3E%3Cstop%20offset='0'%20stop-color='%231e3a8a'/%3E%3Cstop%20offset='1'%20stop-color='%23f97316'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width='200'%20height='300'%20fill='url%28%23g%29'/%3E%3Ccircle%20cx='100'%20cy='120'%20r='46'%20fill='%23fde68a'/%3E%3Cpath%20d='M0%20230%20L60%20170%20L110%20215%20L150%20180%20L200%20225%20L200%20300%20L0%20300%20Z'%20fill='%230f172a'/%3E%3C/svg%3E" href="#">
    <template #badges><UiTag variant="success">followed</UiTag></template>
    E18 · Thu 16:26
    <template #actions><UiButton size="sm" variant="secondary">Get</UiButton></template>
  </UiMediaCard>
  <UiMediaCard title="A series with no poster yet" subtitle="the initials stand in">
    E1 · Sat 23:00
    <template #actions><UiButton size="sm" variant="secondary">Follow</UiButton></template>
  </UiMediaCard>
  <UiMediaCard title="A broken image link" src="https://example.invalid/missing.jpg">
    falls back the same way
  </UiMediaCard>
</UiGrid>`,
    },
    {
      title: "A grid of one",
      description:
        "One card keeps the width it has in a full row: a grid of media cards keeps its empty columns, so the column count depends on the width alone, never on how many cards there are.",
      code: `<UiGrid min-item-width="15rem" :gap="3">
  <UiMediaCard title="The Last: Naruto the Movie" subtitle="the only pick in this section">
    Film · 2014
    <template #actions><UiButton size="sm" variant="secondary">Save</UiButton></template>
  </UiMediaCard>
</UiGrid>`,
    },
    {
      title: "Other shapes",
      code: `<UiGrid min-item-width="12rem" :gap="3">
  <UiMediaCard title="Square sleeve" ratio="1" subtitle="ratio=&quot;1&quot;" />
  <UiMediaCard title="Wide still" ratio="16 / 9" subtitle="ratio=&quot;16 / 9&quot;" />
</UiGrid>`,
    },
  ],
};
