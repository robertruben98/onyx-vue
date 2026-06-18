/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
}

export const inputDemos: Demo[] = [
  {
    title: "Basic",
    props: {
      label: "Email",
      placeholder: "you@example.com",
      type: "email",
    },
  },
  { title: "Small", props: { size: "sm", label: "Small", placeholder: "sm" } },
  {
    title: "Medium",
    props: { size: "md", label: "Medium", placeholder: "md" },
  },
  { title: "Large", props: { size: "lg", label: "Large", placeholder: "lg" } },
  { title: "Invalid", props: { label: "Invalid", invalid: true } },
  { title: "Disabled", props: { label: "Disabled", disabled: true } },
];
