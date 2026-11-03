import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import MessageBubble from "./MessageBubble.vue";
import { ES_MESSAGES, provideOnyxLocale } from "../../locale";
import { defineComponent, h } from "vue";

const scss = readFileSync(join(__dirname, "message-bubble.scss"), "utf8");
const rule = (selector: string) =>
  scss.match(new RegExp(`${selector.replace(/[.]/g, "\\.")}\\s*\\{([^}]*)\\}`))?.[1] ?? "";

const base = { direction: "in" as const, time: "18:42" };

describe("MessageBubble (Vue)", () => {
  it("renders text, time and author", () => {
    const { container } = render(MessageBubble, { props: { ...base, author: "Baby" }, slots: { default: "Hola" } });
    expect(container.textContent).toContain("Hola");
    expect(container.textContent).toContain("18:42");
    expect(container.textContent).toContain("Baby");
  });

  it("shows no author line when author is unset", () => {
    const { container } = render(MessageBubble, { props: base, slots: { default: "Hola" } });
    expect(container.querySelector(".ui-message-bubble__author")).toBeNull();
  });

  it("aligns out to the end and in to the start (the root carries the direction, the scss maps it)", () => {
    const out = render(MessageBubble, { props: { ...base, direction: "out" }, slots: { default: "voy" } });
    const inn = render(MessageBubble, { props: base, slots: { default: "hola" } });
    expect(out.container.firstElementChild!.getAttribute("data-direction")).toBe("out");
    expect(inn.container.firstElementChild!.getAttribute("data-direction")).toBe("in");
    expect(rule(".ui-message-bubble--out")).toMatch(/align-self:\s*flex-end/);
    expect(rule(".ui-message-bubble--in")).toMatch(/align-self:\s*flex-start/);
    expect(rule(".ui-message-bubble--out")).toMatch(/--ui-chat-bubble-out/);
    expect(rule(".ui-message-bubble--in")).toMatch(/--ui-chat-bubble-in/);
  });

  it("draft with copyText: Copiar button writes the exact text to the clipboard and emits copied", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const text = "Su pedido 1041 sale hoy.\nUn saludo";
    const { emitted } = render(MessageBubble, {
      props: { ...base, direction: "out", variant: "draft", copyText: text, copyLabel: "Copiar" },
      slots: { default: text },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(text);
    await vi.waitFor(() => expect(emitted().copied).toHaveLength(1));
  });

  it("the copy button is Copy by default and Copiar under the Spanish catalog", () => {
    const en = render(MessageBubble, { props: { ...base, variant: "draft", copyText: "x" } });
    expect(en.getByRole("button").textContent?.trim()).toBe("Copy");
    en.unmount();
    const Es = defineComponent({
      setup() {
        provideOnyxLocale(ES_MESSAGES);
        return () => h(MessageBubble, { ...base, variant: "draft", copyText: "x" });
      },
    });
    const es = render(Es);
    expect(es.getByRole("button", { name: "Copiar" })).toBeTruthy();
  });

  it("copyLabel overrides the catalog", () => {
    render(MessageBubble, { props: { ...base, variant: "draft", copyText: "x", copyLabel: "Copy it" } });
    expect(screen.getByRole("button", { name: "Copy it" })).toBeTruthy();
  });

  it("does not emit copied when the clipboard write fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { emitted } = render(MessageBubble, {
      props: { ...base, variant: "draft", copyText: "x", copyLabel: "Copiar" },
      slots: { default: "x" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(emitted().copied).toBeUndefined();
  });

  it("renders no Copiar button unless draft with copyText", () => {
    const a = render(MessageBubble, { props: { ...base, copyText: "x" }, slots: { default: "x" } });
    expect(a.queryByRole("button")).toBeNull();
    const b = render(MessageBubble, { props: { ...base, variant: "draft" }, slots: { default: "x" } });
    expect(b.queryByRole("button")).toBeNull();
  });

  it("an empty default slot with a media slot renders no text block", () => {
    const { container } = render(MessageBubble, { props: base, slots: { media: "<img alt='foto' src='x.png'>" } });
    expect(screen.getByAltText("foto")).toBeTruthy();
    expect(container.querySelector(".ui-message-bubble__text")).toBeNull();
  });

  it("puts media above text and meta below text", () => {
    const { container } = render(MessageBubble, {
      props: base,
      slots: { default: "texto", media: "<i data-t='media'></i>", meta: "<i data-t='meta'></i>", footer: "<i data-t='footer'></i>" },
    });
    const order = [...container.querySelectorAll("[data-t], .ui-message-bubble__text")].map(
      (el) => el.getAttribute("data-t") ?? "text",
    );
    expect(order).toEqual(["media", "text", "meta", "footer"]);
  });

  it("keeps line breaks and the CSS wraps long unbroken strings", () => {
    const long = "x".repeat(300);
    const { container } = render(MessageBubble, { props: base, slots: { default: long } });
    expect(container.querySelector(".ui-message-bubble__text")!.textContent).toBe(long);
    const r = rule(".ui-message-bubble__text");
    expect(r).toMatch(/overflow-wrap:\s*anywhere/);
    expect(r).toMatch(/white-space:\s*pre-wrap/);
  });

  it("context variant is dimmed and smaller in the scss", () => {
    const { container } = render(MessageBubble, { props: base, slots: { default: "antes" } });
    expect(container.firstElementChild!.getAttribute("data-variant")).toBe("message");
    const ctx = render(MessageBubble, { props: { ...base, variant: "context" }, slots: { default: "antes" } });
    expect(ctx.container.firstElementChild!.getAttribute("data-variant")).toBe("context");
    const r = rule(".ui-message-bubble--context");
    expect(r).toMatch(/opacity:/);
    expect(r).toMatch(/font-size:/);
  });

  it("draft has a dashed border from the draft token", () => {
    const r = rule(".ui-message-bubble--draft");
    expect(r).toMatch(/dashed/);
    expect(r).toMatch(/--ui-chat-bubble-draft-border/);
  });

  it("has no axe violations", async () => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn() }, configurable: true });
    const { container } = render(MessageBubble, {
      props: { ...base, author: "Baby", variant: "draft", copyText: "hola" },
      slots: { default: "hola", meta: "Pedido 1041", footer: "<a href='#x'>abrir en Rocket.Chat</a>" },
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
