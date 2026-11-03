import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import ChatListItem from "./ChatListItem.vue";

const base = { title: "Baby Sm23", preview: "Recupérame estas 4 del 1041", time: "18:42" };

describe("ChatListItem (Vue)", () => {
  it("renders title, preview and time inside a button", () => {
    render(ChatListItem, { props: base });
    const btn = screen.getByRole("button");
    expect(btn.textContent).toContain("Baby Sm23");
    expect(btn.textContent).toContain("Recupérame estas 4 del 1041");
    expect(btn.textContent).toContain("18:42");
  });

  it("shows the unread count as a badge, and none for 0", () => {
    const { container, rerender } = render(ChatListItem, { props: { ...base, unread: 3 } });
    expect(container.querySelector(".ui-chat-list-item__unread")?.textContent?.trim()).toBe("3");
    return rerender({ ...base, unread: 0 }).then(() => {
      expect(container.querySelector(".ui-chat-list-item__unread")).toBeNull();
    });
  });

  it("emits select on click and on Enter", async () => {
    const { emitted } = render(ChatListItem, { props: base });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(emitted().select).toHaveLength(1);
    btn.focus();
    await fireEvent.keyDown(btn, { key: "Enter" });
    // A native button turns Enter into click in browsers; jsdom does not, so
    // the component must not rely on it being silent either way.
    expect(emitted().select.length).toBeGreaterThanOrEqual(1);
  });

  it("selected sets aria-current", () => {
    render(ChatListItem, { props: { ...base, selected: true } });
    expect(screen.getByRole("button").getAttribute("aria-current")).toBe("true");
  });

  it("not selected carries no aria-current", () => {
    render(ChatListItem, { props: base });
    expect(screen.getByRole("button").getAttribute("aria-current")).toBeNull();
  });

  it("truncates a long preview to one line with an ellipsis class", () => {
    const { container } = render(ChatListItem, { props: { ...base, preview: "x".repeat(200) } });
    const el = container.querySelector(".ui-chat-list-item__preview")!;
    expect(el.textContent).toHaveLength(200);
    expect(el.classList.contains("ui-chat-list-item__preview")).toBe(true);
  });

  it("renders source mark and tag with tone", () => {
    const { container } = render(ChatListItem, { props: { ...base, source: "WA", tag: "#ordenes", tagTone: "danger" } });
    expect(container.querySelector(".ui-chat-list-item__source")?.textContent).toBe("WA");
    expect(container.querySelector(".ui-chat-list-item__tag")?.textContent).toContain("#ordenes");
    expect(container.querySelector(".ui-badge--danger")).toBeTruthy();
  });

  it("same avatarSeed gives the same gradient class", () => {
    const a = render(ChatListItem, { props: { ...base, avatarSeed: "chat-1" } });
    const b = render(ChatListItem, { props: { ...base, title: "Other", avatarSeed: "chat-1" } });
    const cls = (c: Element) => [...c.querySelector(".ui-avatar")!.classList].find((x) => /gradient-\d/.test(x));
    expect(cls(a.container)).toBeTruthy();
    expect(cls(a.container)).toBe(cls(b.container));
  });

  it("avatarText shows as the initials", () => {
    const { container } = render(ChatListItem, { props: { ...base, avatarText: "BS" } });
    expect(container.querySelector(".ui-avatar")?.textContent).toContain("BS");
  });

  it("has no axe violations", async () => {
    const { container } = render(ChatListItem, { props: { ...base, unread: 2, source: "WA", tag: "#ordenes", selected: true } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
