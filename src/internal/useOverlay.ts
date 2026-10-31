import { nextTick, onBeforeUnmount, ref, watch, type Ref } from "vue";

/** CSS applies these tokens; keep layer selection out of inline z-index styles. */
export const overlayLayers = {
  select: "--ui-select-z",
  menu: "--ui-menu-z",
  popover: "--ui-popover-z",
  tooltip: "--ui-tooltip-z",
} as const;

type Kind = keyof typeof overlayLayers;
type Placement = "top" | "bottom" | "left" | "right";
interface OverlayOptions {
  kind: Kind;
  open: Ref<boolean>;
  trigger: Ref<HTMLElement | null>;
  panel: Ref<HTMLElement | null>;
  placement?: () => Placement;
  onOpened?: () => void;
}

// A single capture listener consumes Escape before any ancestor (including a
// dialog) can see it. Opening order, not DOM ancestry or focus, chooses the owner.
const stack: (() => void)[] = [];
function onEscape(event: KeyboardEvent): void {
  if (event.key !== "Escape" || !stack.length) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  stack[stack.length - 1]();
}

type Box = { top: number; left: number; right: number; bottom: number; width: number; height: number };

/**
 * The box to anchor to. A `display: contents` host (UiTooltip wraps its trigger
 * that way so it does not change the layout) has no box of its own: its rect is
 * 0 × 0 at the page origin, and the tooltip was painted in the top-left corner
 * of the page. Such a host is measured by the union of its children.
 */
export function anchorBox(el: HTMLElement): Box {
  if (getComputedStyle(el).display !== "contents") return el.getBoundingClientRect();
  const rects = [...el.children]
    .map((c) => (c instanceof HTMLElement ? anchorBox(c) : c.getBoundingClientRect()))
    .filter((r) => r.width > 0 || r.height > 0);
  if (!rects.length) return el.getBoundingClientRect();
  const top = Math.min(...rects.map((r) => r.top));
  const left = Math.min(...rects.map((r) => r.left));
  const right = Math.max(...rects.map((r) => r.right));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  return { top, left, right, bottom, width: right - left, height: bottom - top };
}

export function useOverlay(options: OverlayOptions) {
  const { kind, open, trigger, panel } = options;
  const style = ref<Record<string, string>>({});
  let generation = 0;
  let restoreTarget: HTMLElement | null = null;
  const focusable = 'button, a[href], input, select, textarea, [tabindex]';

  function position(): void {
    if (!trigger.value) return;
    const r = anchorBox(trigger.value);
    const p = panel.value?.getBoundingClientRect();
    const width = p?.width ?? 0;
    const height = p?.height ?? 0;
    let top = r.bottom;
    let left = r.left;
    if (kind === "select") {
      style.value = { top: `${top + window.scrollY}px`, left: `${left + window.scrollX}px`, width: `${r.width}px` };
      return;
    }
    if (kind === "menu") {
      const edge = 8;
      if (left + width > window.innerWidth - edge) {
        left = Math.max(edge, Math.min(r.right, window.innerWidth - edge) - width);
      }
      if (top + height > window.innerHeight - edge && r.top - height >= edge) top = r.top - height;
      style.value = { position: "fixed", top: `${top}px`, left: `${left}px` };
      return;
    }
    const placement = options.placement?.() ?? "bottom";
    const centered = kind === "tooltip";
    switch (placement) {
      case "top": top = r.top - height; break;
      case "left": top = r.top; left = r.left - width; break;
      case "right": top = r.top; left = r.right; break;
    }
    if (centered) {
      if (placement === "top" || placement === "bottom") left += (r.width - width) / 2;
      else top += (r.height - height) / 2;
    }
    style.value = { top: `${Math.round(top)}px`, left: `${Math.round(left)}px` };
  }

  function close(): void { open.value = false; }
  function toggle(): void { open.value = !open.value; }
  function onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget && stack.at(-1) === close) close();
  }
  function cleanup(): void {
    generation++;
    const index = stack.indexOf(close);
    if (index >= 0) stack.splice(index, 1);
    if (!stack.length) window.removeEventListener("keydown", onEscape, true);
    window.removeEventListener("scroll", position, true);
    window.removeEventListener("resize", position);
  }

  watch(open, (isOpen) => {
    if (typeof window === "undefined") return;
    cleanup();
    if (!isOpen) {
      restoreTarget?.focus();
      restoreTarget = null;
      return;
    }
    if (kind !== "tooltip") {
      const active = document.activeElement;
      restoreTarget = active instanceof HTMLElement && trigger.value?.contains(active)
        ? active
        : trigger.value?.matches(focusable) ? trigger.value : trigger.value?.querySelector<HTMLElement>(focusable) ?? null;
    }
    stack.push(close);
    window.addEventListener("keydown", onEscape, true);
    window.addEventListener("scroll", position, true);
    window.addEventListener("resize", position);
    const current = generation;
    void (async () => {
      await nextTick();
      if (current !== generation) return;
      position();
      if (kind === "menu") {
        // The first fixed-position pass establishes the menu's intrinsic width.
        await nextTick();
        if (current !== generation) return;
        position();
        await nextTick();
      }
      if (current !== generation) return;
      options.onOpened?.();
      if (kind === "popover" || kind === "tooltip") {
        // Same reason for a panel placed above, beside or centred on its trigger:
        // the first pass ran against a 0 × 0 panel (the tooltip sat on its
        // trigger instead of above it). Measured again once it has its size,
        // after the initial focus so that does not move.
        await nextTick();
        if (current === generation) position();
      }
    })();
  }, { immediate: true, flush: "sync" });
  onBeforeUnmount(cleanup);
  return { style, close, toggle, onBackdrop, layerToken: overlayLayers[kind] };
}
