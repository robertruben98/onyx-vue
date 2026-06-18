import type { InjectionKey, Ref } from "vue";

/** A single item registered with its parent accordion. */
export interface AccordionItemRef {
  /** Expanded state (managed by the parent accordion). */
  expanded: Ref<boolean>;
}

/** Contract a parent accordion exposes to its items (avoids a circular import). */
export interface AccordionHost {
  /** Register an item so the host can coordinate single-open mode. */
  register(item: AccordionItemRef): void;
  /** Unregister an item on unmount. */
  unregister(item: AccordionItemRef): void;
  /** Toggle an item, collapsing siblings when not in multi mode. */
  toggleItem(item: AccordionItemRef): void;
}

export const ACCORDION_HOST: InjectionKey<AccordionHost> =
  Symbol("ACCORDION_HOST");
