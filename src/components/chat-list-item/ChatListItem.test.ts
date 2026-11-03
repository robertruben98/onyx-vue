import { readFileSync } from "node:fs";
import { join } from "node:path";
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

  it("emits select on click", async () => {
    const { emitted } = render(ChatListItem, { props: base });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().select).toHaveLength(1);
  });

  it("is a native type=button, so Enter and Space activate it with no key handler of its own", () => {
    // jsdom does not turn Enter into click; a keydown handler here would
    // double-fire in browsers. The native button is the keyboard support.
    const { container } = render(ChatListItem, { props: base });
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("BUTTON");
    expect(root.getAttribute("type")).toBe("button");
    expect(root.hasAttribute("disabled")).toBe(false);
    expect(root.getAttribute("tabindex")).toBeNull();
  });

  it("selected sets aria-current", () => {
    render(ChatListItem, { props: { ...base, selected: true } });
    expect(screen.getByRole("button").getAttribute("aria-current")).toBe("true");
  });

  it("not selected carries no aria-current", () => {
    render(ChatListItem, { props: base });
    expect(screen.getByRole("button").getAttribute("aria-current")).toBeNull();
  });

  it("keeps a long preview whole in the DOM and the CSS cuts it to one line with an ellipsis", () => {
    const { container } = render(ChatListItem, { props: { ...base, preview: "x".repeat(200) } });
    expect(container.querySelector(".ui-chat-list-item__preview")!.textContent).toHaveLength(200);
    const scss = readFileSync(join(__dirname, "chat-list-item.scss"), "utf8");
    const rule = scss.match(/\.ui-chat-list-item__preview\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toMatch(/white-space:\s*nowrap/);
    expect(rule).toMatch(/overflow:\s*hidden/);
    expect(rule).toMatch(/text-overflow:\s*ellipsis/);
    expect(rule).toMatch(/min-width:\s*0/);
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
