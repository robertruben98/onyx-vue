import type { ComponentDoc } from "../../docs-model";

export const avatarDoc: ComponentDoc = {
  id: "avatar",
  title: "Avatar",
  description:
    "Person or entity image with an initials fallback. If the image fails to load it falls back on its own, so a broken URL never leaves a hole in the layout.",
  imports: ["UiAvatar"],
  api: [
    {
      name: "src",
      type: "string",
      default: "''",
      description: "Image URL. On error the component falls back to initials.",
    },
    {
      name: "name",
      type: "string",
      default: "''",
      description:
        "Used for the image alt text and to derive up to two initials (first and last word).",
    },
    {
      name: "alt",
      type: "string",
      default: "name",
      description: "Alternative text of the image (and accessible name of the initials). Defaults to the name.",
    },
    {
      name: "size",
      type: "'sm' | 'md' | 'lg' | 'xl'",
      default: "'md'",
      description: "32, 40, 48 or 72px (--ui-avatar-size-*). `xl` is the profile hero size.",
    },
    {
      name: "shape",
      type: "'circle' | 'square'",
      default: "'circle'",
      description: "Avatar shape.",
    },
    {
      name: "gradient",
      type: "boolean",
      default: "false",
      description:
        "White initials on one of eight gradients (--ui-avatar-gradient-1…8), always the same one for a name. Every stop reaches 4.5:1 with the initials.",
    },
    {
      name: "ringValue",
      type: "number | null",
      default: "null",
      description: "Draws a progress ring around the avatar (the UiProgressRing drawing). `null` draws none.",
    },
    { name: "ringMax", type: "number", default: "100", description: "Value of a full ring." },
    {
      name: "ringTone",
      type: "'primary' | 'success' | 'warning' | 'danger' | 'neutral'",
      default: "'primary'",
      description: "Colour of the ring.",
    },
    { name: "ringGradient", type: "boolean", default: "false", description: "Paints the ring with the brand gradient." },
    {
      name: "ringLabel",
      type: "string",
      default: "''",
      description: "Set, the ring is a progressbar beside the avatar with this name; unset, it is decorative.",
    },
  ],
  demos: [
    {
      title: "Initials",
      description: "Two words give two letters; one word gives one.",
      code: `<UiAvatar name="Ada Lovelace" />
<UiAvatar name="Grace Hopper" />
<UiAvatar name="Turing" />`,
    },
    {
      title: "Sizes",
      code: `<UiAvatar size="sm" name="Ada Lovelace" />
<UiAvatar name="Ada Lovelace" />
<UiAvatar size="lg" name="Ada Lovelace" />
<UiAvatar size="xl" name="Ada Lovelace" />`,
    },
    {
      title: "Gradient",
      description: "The same name always gets the same gradient.",
      code: `<UiAvatar gradient name="Ada Lovelace" />
<UiAvatar gradient name="Grace Hopper" />
<UiAvatar gradient name="Alan Turing" />
<UiAvatar gradient size="xl" name="Robert Ruben" />`,
    },
    {
      title: "Progress ring",
      description: "Level progress around a profile avatar.",
      code: `<UiAvatar size="xl" gradient name="Robert Ruben" :ring-value="68" ring-gradient ring-label="Level 7: 68%" />
<UiAvatar size="lg" name="Ada Lovelace" :ring-value="3" :ring-max="4" ring-tone="success" />`,
    },
    { title: "Square", code: `<UiAvatar name="Alan Turing" shape="square" />` },
    {
      title: "Broken image falls back",
      description: "The `src` below does not resolve; initials take over.",
      code: `<UiAvatar name="Ada Lovelace" src="/does-not-exist.png" />`,
    },
  ],
};
