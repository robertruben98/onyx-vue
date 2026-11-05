/**
 * The nearest ancestor of `el` that scrolls vertically, or null.
 */
export function scrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * Bring `el` inside its scrolling container's visible box, moving only that
 * container's `scrollTop` by the least amount (the `block: "nearest"` rule).
 *
 * Not `scrollIntoView`: in Chromium that also moves the sequential focus
 * navigation starting point to the element, so on a fresh page load the first
 * Tab skipped the skip link and landed on the entry after the active one.
 * Setting `scrollTop` leaves focus navigation alone, never scrolls the page
 * itself, and is never smooth.
 */
export function revealInScroller(el: HTMLElement): void {
  const box = scrollParent(el);
  if (!box) return;
  const outer = box.getBoundingClientRect();
  const inner = el.getBoundingClientRect();
  if (inner.top < outer.top) box.scrollTop -= outer.top - inner.top;
  else if (inner.bottom > outer.bottom) box.scrollTop += inner.bottom - outer.bottom;
}
