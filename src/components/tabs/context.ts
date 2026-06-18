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

/** Identity and lifecycle handle handed back to a `Tab` on registration. */
export interface TabHandle {
  /** Mount-order index assigned by the parent (matches the trigger order). */
  readonly index: number;
  /** Trigger element id (links tab -> panel). */
  readonly tabId: string;
  /** Panel element id (links panel -> tab). */
  readonly panelId: string;
  /** Whether this tab's panel is currently selected (reactive getter). */
  readonly isActive: () => boolean;
  /** Detach this tab from the parent. */
  readonly unregister: () => void;
}

/** API exposed by `Tabs` to its `Tab` children. */
export interface TabsContext {
  /**
   * Register a child tab in mount order. The parent owns id assignment so the
   * panel ids always line up with the slot-derived triggers.
   */
  register(): TabHandle;
  /** Whether the tab with the given index is the selected one. */
  isActive(index: number): boolean;
}

export const TABS_CONTEXT: InjectionKey<TabsContext> = Symbol("ui-tabs");
