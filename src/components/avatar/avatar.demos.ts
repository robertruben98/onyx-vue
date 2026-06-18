/** A single live example for the docs/playground. */
export interface AvatarDemo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  /** Default-slot content. */
  slot?: string;
}

export const avatarDemos: AvatarDemo[] = [
  { title: "Initials", props: { name: "Ada Lovelace" } },
  { title: "Initials (two words)", props: { name: "Grace Hopper" } },
  { title: "Square", props: { name: "Alan Turing", shape: "square" } },
  { title: "Small", props: { size: "sm", name: "Ada Lovelace" } },
  { title: "Medium", props: { size: "md", name: "Ada Lovelace" } },
  { title: "Large", props: { size: "lg", name: "Ada Lovelace" } },
];
