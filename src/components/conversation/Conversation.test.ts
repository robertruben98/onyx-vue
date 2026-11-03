import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h, nextTick } from "vue";
import Conversation from "./Conversation.vue";
import { ES_MESSAGES, provideOnyxLocale } from "../../locale";

const scss = readFileSync(join(__dirname, "conversation.scss"), "utf8");

const ITEM_HEIGHT = 100;
const VIEWPORT = 400;

type Item = { key: string; day: string };
const mk = (...pairs: string[]): Item[] => pairs.map((p) => ({ key: p.split(":")[0], day: p.split(":")[1] }));

const itemSlot = ({ item }: { item: Item }) => h("p", { class: "probe" }, item.key);

/** jsdom has no layout: scrollHeight is derived from the rendered items, scrollTop is a plain number. */
function mockScroller(container: HTMLElement, scrollTop: number) {
  const el = container.querySelector<HTMLElement>(".ui-conversation__scroll")!;
  let top = scrollTop;
  Object.defineProperty(el, "scrollHeight", {
    configurable: true,
    get: () => el.querySelectorAll(".ui-conversation__item").length * ITEM_HEIGHT,
  });
  Object.defineProperty(el, "clientHeight", { configurable: true, get: () => VIEWPORT });
  Object.defineProperty(el, "scrollTop", { configurable: true, get: () => top, set: (v: number) => (top = v) });
  return { el, top: () => top, setTop: (v: number) => (top = v) };
}

const mount = (items: Item[], props: Record<string, unknown> = {}) =>
  render(Conversation, { props: { items, ...props }, slots: { item: itemSlot } });

describe("Conversation (Vue)", () => {
  it("renders every item through the item slot, in order", () => {
    const { container } = mount(mk("a:A", "b:A", "c:B"));
    expect([...container.querySelectorAll(".probe")].map((n) => n.textContent)).toEqual(["a", "b", "c"]);
  });

  it("items with days A,A,B give exactly 2 separators: before item 1 and before item 3", () => {
    const { container } = mount(mk("a:A", "b:A", "c:B"));
    const seps = [...container.querySelectorAll(".ui-conversation__day")];
    expect(seps.map((s) => s.textContent?.trim())).toEqual(["A", "B"]);
    const order = [...container.querySelectorAll(".ui-conversation__day, .probe")].map((n) =>
      n.classList.contains("probe") ? n.textContent : `sep:${n.textContent?.trim()}`,
    );
    expect(order).toEqual(["sep:A", "a", "b", "sep:B", "c"]);
  });

  it("emits load-older once when scrolled within 200px of the top, not again while loadingOlder", async () => {
    const { container, emitted, rerender } = mount(mk("a:A", "b:A", "c:A", "d:A", "e:A", "f:A"), { hasOlder: true });
    const s = mockScroller(container, 500);
    await fireEvent.scroll(s.el);
    expect(emitted()["load-older"]).toBeUndefined(); // 500px from the top

    s.setTop(200);
    await fireEvent.scroll(s.el);
    expect(emitted()["load-older"]).toHaveLength(1);

    s.setTop(150);
    await fireEvent.scroll(s.el); // parent has not reacted yet
    expect(emitted()["load-older"]).toHaveLength(1);

    await rerender({ loadingOlder: true });
    s.setTop(100);
    await fireEvent.scroll(s.el);
    expect(emitted()["load-older"]).toHaveLength(1);
  });

  it("does not emit load-older without hasOlder", async () => {
    const { container, emitted } = mount(mk("a:A", "b:A"), { hasOlder: false });
    const s = mockScroller(container, 0);
    await fireEvent.scroll(s.el);
    expect(emitted()["load-older"]).toBeUndefined();
  });

  it("emits load-older again after a load finished", async () => {
    const { container, emitted, rerender } = mount(mk("c:A", "d:A"), { hasOlder: true });
    const s = mockScroller(container, 0);
    await fireEvent.scroll(s.el);
    await rerender({ loadingOlder: true });
    await rerender({ loadingOlder: false, items: mk("a:A", "b:A", "c:A", "d:A") });
    s.setTop(0);
    await fireEvent.scroll(s.el);
    expect(emitted()["load-older"]).toHaveLength(2);
  });

  it("prepending 2 items keeps the visual position: scrollTop moves by the height delta", async () => {
    const { container, rerender } = mount(mk("c:A", "d:A", "e:A", "f:A"), { hasOlder: true });
    const s = mockScroller(container, 30); // near the top, 4 items = 400px
    await rerender({ items: mk("a:A", "b:A", "c:A", "d:A", "e:A", "f:A") }); // 600px
    await nextTick();
    expect(s.top()).toBe(30 + 2 * ITEM_HEIGHT);
  });

  it("appending while within 80px of the bottom scrolls to the bottom, with no pill", async () => {
    const { container, rerender } = mount(mk("a:A", "b:A", "c:A", "d:A", "e:A"));
    const s = mockScroller(container, 500 - VIEWPORT - 80); // exactly 80px from the bottom
    await rerender({ items: mk("a:A", "b:A", "c:A", "d:A", "e:A", "f:A") });
    await nextTick();
    expect(s.top()).toBe(6 * ITEM_HEIGHT);
    expect(container.querySelector(".ui-conversation__pill")).toBeNull();
  });

  it("appending while scrolled up shows the pill with '1 nuevo' (Spanish) and does not move the scroll", async () => {
    const Es = defineComponent({
      props: { items: { type: Array, required: true } },
      setup(p) {
        provideOnyxLocale(ES_MESSAGES);
        return () => h(Conversation, { items: p.items as Item[] }, { item: itemSlot });
      },
    });
    const { container, rerender } = render(Es, { props: { items: mk("a:A", "b:A", "c:A", "d:A", "e:A") } });
    const s = mockScroller(container, 0);
    await rerender({ items: mk("a:A", "b:A", "c:A", "d:A", "e:A", "f:A") });
    await nextTick();
    expect(s.top()).toBe(0);
    expect(container.querySelector(".ui-conversation__pill")!.textContent?.trim()).toBe("↓ 1 nuevo");

    await rerender({ items: mk("a:A", "b:A", "c:A", "d:A", "e:A", "f:A", "g:A") });
    await nextTick();
    expect(container.querySelector(".ui-conversation__pill")!.textContent?.trim()).toBe("↓ 2 nuevos");
  });

  it("the pill is English by default; clicking it scrolls to the bottom and hides it", async () => {
    const { container, rerender } = mount(mk("a:A", "b:A", "c:A", "d:A", "e:A"));
    const s = mockScroller(container, 0);
    await rerender({ items: mk("a:A", "b:A", "c:A", "d:A", "e:A", "f:A") });
    await nextTick();
    const pill = container.querySelector<HTMLElement>(".ui-conversation__pill")!;
    expect(pill.textContent?.trim()).toBe("↓ 1 new");
    await fireEvent.click(pill);
    expect(s.top()).toBe(6 * ITEM_HEIGHT);
    expect(container.querySelector(".ui-conversation__pill")).toBeNull();
  });

  it("scrolling back to the bottom by hand hides the pill", async () => {
    const { container, rerender } = mount(mk("a:A", "b:A", "c:A", "d:A", "e:A"));
    const s = mockScroller(container, 0);
    await rerender({ items: mk("a:A", "b:A", "c:A", "d:A", "e:A", "f:A") });
    await nextTick();
    expect(container.querySelector(".ui-conversation__pill")).not.toBeNull();
    s.setTop(6 * ITEM_HEIGHT - VIEWPORT);
    await fireEvent.scroll(s.el);
    expect(container.querySelector(".ui-conversation__pill")).toBeNull();
  });

  it("background is --ui-chat-bg and the scroller owns the overflow", () => {
    expect(scss).toMatch(/background:\s*var\(--ui-chat-bg/);
    expect(scss).toMatch(/overflow-y:\s*auto/);
  });

  it("has no a11y violations", async () => {
    const { container } = mount(mk("a:A", "b:B"));
    expect(await axe(container)).toHaveNoViolations();
  });
});
