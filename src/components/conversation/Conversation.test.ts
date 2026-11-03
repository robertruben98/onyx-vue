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

type Item = { key: string; day: string; group?: string };
const mk = (...pairs: string[]): Item[] => pairs.map((p) => ({ key: p.split(":")[0], day: p.split(":")[1] }));

const itemSlot = ({ item }: { item: Item }) => h("p", { class: "probe" }, item.key);

/** jsdom has no layout: scrollHeight is derived from the rendered items, scrollTop is a plain number. */
function mockScroller(container: Element, scrollTop: number) {
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
    const { container, emitted, rerender } = mount(mk("c:A", "d:A", "e:A", "f:A", "g:A", "h:A"), { hasOlder: true });
    const s = mockScroller(container, 0);
    await fireEvent.scroll(s.el);
    await rerender({ loadingOlder: true });
    await rerender({ loadingOlder: false, items: mk("a:A", "b:A", "c:A", "d:A", "e:A", "f:A", "g:A", "h:A") });
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

  it("prepending items of the same day keeps the existing section and item nodes (no remount) and the position", async () => {
    const { container, rerender } = mount(mk("c:A", "d:A", "e:B"), { hasOlder: true });
    const s = mockScroller(container, 30);
    const section = container.querySelector(".ui-conversation__section")!;
    const probe = container.querySelector(".probe")!;
    await rerender({ items: mk("a:A", "b:A", "c:A", "d:A", "e:B") });
    await nextTick();
    expect(container.querySelector(".ui-conversation__section")).toBe(section);
    expect([...container.querySelectorAll(".probe")].find((n) => n.textContent === "c")).toBe(probe);
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

  describe("mount, swap and short content", () => {
    const proto = HTMLElement.prototype;
    const saved: Record<string, PropertyDescriptor | undefined> = {};
    function layoutAll(scrollHeight: number, clientHeight: number) {
      let top = 0;
      for (const [k, d] of Object.entries({
        scrollHeight: { get: () => scrollHeight },
        clientHeight: { get: () => clientHeight },
        scrollTop: { get: () => top, set: (v: number) => (top = v) },
      })) {
        saved[k] = Object.getOwnPropertyDescriptor(proto, k);
        Object.defineProperty(proto, k, { configurable: true, ...d });
      }
      return () => top;
    }
    afterEach(() => {
      for (const [k, d] of Object.entries(saved)) {
        if (d) Object.defineProperty(proto, k, d);
        else delete (proto as unknown as Record<string, unknown>)[k];
      }
    });

    it("mounted with items it lands at the bottom and emits no load-older", async () => {
      const top = layoutAll(1000, VIEWPORT);
      const { emitted } = mount(mk("a:A", "b:A", "c:A", "d:A", "e:A"), { hasOlder: true });
      await nextTick();
      expect(top()).toBe(1000);
      expect(emitted()["load-older"]).toBeUndefined();
    });

    it("content shorter than the viewport emits load-older once after render", async () => {
      layoutAll(200, VIEWPORT);
      const { emitted, rerender } = mount(mk("a:A", "b:A"), { hasOlder: true });
      await nextTick();
      expect(emitted()["load-older"]).toHaveLength(1);
      await rerender({ items: mk("a:A", "b:A", "c:A") }); // appended, still short, load not finished
      await nextTick();
      expect(emitted()["load-older"]).toHaveLength(2); // items changed: the load answered, ask again
    });

    it("short content without hasOlder emits nothing", async () => {
      layoutAll(200, VIEWPORT);
      const { emitted } = mount(mk("a:A"), { hasOlder: false });
      await nextTick();
      expect(emitted()["load-older"]).toBeUndefined();
    });

    it("empty -> filled scrolls to the bottom", async () => {
      const { container, rerender } = mount([]);
      const s = mockScroller(container, 0);
      await rerender({ items: mk("a:A", "b:A", "c:A", "d:A", "e:A") });
      await nextTick();
      expect(s.top()).toBe(5 * ITEM_HEIGHT);
    });

    it("swapping to a list with no shared keys resets the pill and scrolls to the bottom", async () => {
      const { container, rerender } = mount(mk("a:A", "b:A", "c:A", "d:A", "e:A"));
      const s = mockScroller(container, 0);
      await rerender({ items: mk("a:A", "b:A", "c:A", "d:A", "e:A", "f:A") });
      await nextTick();
      expect(container.querySelector(".ui-conversation__pill")).not.toBeNull();
      s.setTop(40);
      await rerender({ items: mk("x:A", "y:A", "z:A", "w:A", "v:A", "u:A", "t:A", "s:A") });
      await nextTick();
      expect(container.querySelector(".ui-conversation__pill")).toBeNull();
      expect(s.top()).toBe(8 * ITEM_HEIGHT);
    });
  });

  describe("WhatsApp-parity layout", () => {
    const grouped = (): Item[] => [
      { key: "a", day: "D", group: "A" },
      { key: "b", day: "D", group: "A" },
      { key: "c", day: "D", group: "B" },
    ];
    const firstSlot = ({ item, first }: { item: Item; first: boolean }) =>
      h("p", { class: "probe", "data-first": String(first) }, item.key);

    it("groups A,A,B give first = true,false,true and the matching gap classes", () => {
      const { container } = render(Conversation, { props: { items: grouped() }, slots: { item: firstSlot } });
      expect([...container.querySelectorAll(".probe")].map((n) => n.getAttribute("data-first"))).toEqual([
        "true",
        "false",
        "true",
      ]);
      const items = [...container.querySelectorAll(".ui-conversation__item")];
      expect(items.map((n) => n.classList.contains("ui-conversation__item--first"))).toEqual([true, false, true]);
    });

    it("a day change starts a run even when the group is the same", () => {
      const items: Item[] = [
        { key: "a", day: "D1", group: "A" },
        { key: "b", day: "D2", group: "A" },
      ];
      const { container } = render(Conversation, { props: { items }, slots: { item: firstSlot } });
      expect([...container.querySelectorAll(".probe")].map((n) => n.getAttribute("data-first"))).toEqual(["true", "true"]);
    });

    it("items without a group are all run starts (backward compatible)", () => {
      const { container } = render(Conversation, { props: { items: mk("a:A", "b:A") }, slots: { item: firstSlot } });
      expect([...container.querySelectorAll(".probe")].map((n) => n.getAttribute("data-first"))).toEqual(["true", "true"]);
    });

    it("each day is a section holding a chip with the day text", () => {
      const { container } = mount(mk("a:Hoy", "b:Hoy", "c:Ayer"));
      const sections = [...container.querySelectorAll(".ui-conversation__section")];
      expect(sections).toHaveLength(2);
      expect(sections[0].querySelector(".ui-conversation__day > .ui-conversation__day-chip")?.textContent).toBe("Hoy");
      expect(sections[0].querySelectorAll(".ui-conversation__item")).toHaveLength(2);
    });

    it("renders the aria-hidden wallpaper layer", () => {
      const { container } = mount(mk("a:A"));
      expect(container.querySelector(".ui-conversation__wallpaper")?.getAttribute("aria-hidden")).toBe("true");
    });

    it("composerText renders a read-only pill; no pill without text or slot", () => {
      const { container } = mount(mk("a:A"), { composerText: "Solo lectura" });
      const pill = container.querySelector(".ui-conversation__composer");
      expect(pill?.textContent?.trim()).toBe("Solo lectura");
      expect(pill?.classList.contains("ui-conversation__composer--readonly")).toBe(true);
      expect(mount(mk("a:A")).container.querySelector(".ui-conversation__composer")).toBeNull();
    });

    it("the footer slot replaces composerText", () => {
      const { container } = render(Conversation, {
        props: { items: mk("a:A"), composerText: "ignored" },
        slots: { item: itemSlot, footer: () => h("input", { class: "own" }) },
      });
      expect(container.querySelector(".ui-conversation__composer .own")).not.toBeNull();
      expect(container.textContent).not.toContain("ignored");
    });

    it("scss: wallpaper masked with the ink token at .6, 63px rows, sticky 24px chip radius 6, 52px pill", () => {
      expect(scss).toMatch(/--ui-chat-wallpaper-ink/);
      expect(scss).toMatch(/opacity:\s*0\.6/);
      expect(scss).toMatch(/mask-image:\s*\$conversation-wallpaper/);
      expect(scss).toMatch(/padding:\s*0\.75rem 63px/);
      expect(scss).toMatch(/padding-inline:\s*25px 19px/);
      expect(scss).toMatch(/position:\s*sticky/);
      expect(scss).toMatch(/height:\s*24px/);
      expect(scss).toMatch(/border-radius:\s*6px/);
      expect(scss).toMatch(/min-height:\s*52px/);
      expect(scss).toMatch(/border-radius:\s*26px/);
    });
  });
});
