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
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Avatar size." },
    {
      name: "shape",
      type: "'circle' | 'square'",
      default: "'circle'",
      description: "Avatar shape.",
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
<UiAvatar size="lg" name="Ada Lovelace" />`,
    },
    { title: "Square", code: `<UiAvatar name="Alan Turing" shape="square" />` },
    {
      title: "Broken image falls back",
      description: "The `src` below does not resolve; initials take over.",
      code: `<UiAvatar name="Ada Lovelace" src="/does-not-exist.png" />`,
    },
  ],
};
