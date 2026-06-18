import type { MenuItem } from "./Menu.vue";

/** A single live example for the docs/playground. */
export interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content (the trigger label). */
  slot: string;
}

const items: MenuItem[] = [
  { id: "edit", label: "Edit" },
  { id: "duplicate", label: "Duplicate" },
  { id: "archive", label: "Archive" },
  { id: "delete", label: "Delete", disabled: true },
];

export const menuDemos: Demo[] = [
  { title: "Basic", props: { items }, slot: "Actions" },
];
