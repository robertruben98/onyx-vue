import type { ComponentDoc } from "../../docs-model";

export const spinnerDoc: ComponentDoc = {
  id: "spinner",
  title: "Spinner",
  description:
    "Indeterminate loading indicator. It carries `role=\"status\"` and an accessible label, so screen readers announce it without any extra markup.",
  imports: ["UiSpinner"],
  api: [
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Spinner size." },
    {
      name: "label",
      type: "string",
      default: "'Loading'",
      description: "Accessible label announced by assistive tech.",
    },
  ],
  demos: [
    {
      title: "Sizes",
      code: `<UiSpinner size="sm" />
<UiSpinner />
<UiSpinner size="lg" />`,
    },
    {
      title: "With its own label",
      code: `<UiSpinner label="Fetching results" />`,
    },
  ],
};
