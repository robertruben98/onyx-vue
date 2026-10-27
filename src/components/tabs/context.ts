import type { InjectionKey, Ref } from "vue";

/** Per-tab registration shared with the parent `Tabs` via provide/inject. */
export interface TabRegistration {
  /** Stable id used to track and order tabs. */
  readonly uid: number;
  /** Reactive trigger label shown in the tab list. */
  readonly label: Ref<string>;
  /** Reactive disabled state of the tab. */
  readonly disabled: Ref<boolean>;
  /** Trigger element id (links tab -> panel). */
  readonly tabId: string;
  /** Panel element id (links panel -> tab). */
  readonly panelId: string;
}

/** API exposed by `Tabs` to its `Tab` children. */
export interface TabsContext {
  /**
   * Whether the tab at the given position is the selected one.
   *
   * The position is the child's index IN THE SLOT, which the parent hands down
   * as a prop — never a number the child works out for itself. Both halves of
   * the widget then count from the same place, which is the only way they
   * cannot drift apart.
   */
  isActive(index: number): boolean;
}

export const TABS_CONTEXT: InjectionKey<TabsContext> = Symbol("ui-tabs");
