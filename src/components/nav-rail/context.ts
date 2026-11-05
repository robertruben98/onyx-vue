import type { InjectionKey } from "vue";

/** What a rail offers to the groups and entries inside it. */
export interface NavRailContext {
  /** Ask the rail to bring the active entry into view (after a group opened). */
  scrollToActive: () => void;
}

export const NAV_RAIL_KEY: InjectionKey<NavRailContext> = Symbol("ui-nav-rail");

/** What a group offers to the entries inside it. */
export interface NavRailGroupContext {
  /** An entry reports whether it is the active one; `id` is unique per entry. */
  reportActive: (id: symbol, active: boolean) => void;
}

export const NAV_RAIL_GROUP_KEY: InjectionKey<NavRailGroupContext> = Symbol("ui-nav-rail-group");
