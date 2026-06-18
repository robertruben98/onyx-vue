/** A single tab entry within a tabs demo. */
export interface TabDemoItem {
  label: string;
  disabled?: boolean;
  /** Panel content for this tab. */
  content: string;
}

/** A single live example for the docs/playground. */
export interface TabsDemo {
  title: string;
  description?: string;
  /** Props applied to the `Tabs` root. */
  props?: Record<string, unknown>;
  /** Child tabs projected into the default slot. */
  tabs: TabDemoItem[];
}

export const tabsDemos: TabsDemo[] = [
  {
    title: "Basic",
    props: { ariaLabel: "Account" },
    tabs: [
      { label: "Profile", content: "Your public profile details." },
      { label: "Security", content: "Password and two-factor settings." },
      {
        label: "Billing",
        disabled: true,
        content: "Upgrade to manage billing.",
      },
    ],
  },
];
