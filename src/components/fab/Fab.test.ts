import { render, screen, fireEvent } from "@testing-library/vue";
import { nextTick } from "vue";
import { axe } from "jest-axe";
import Fab from "./Fab.vue";

const scrollTo = async (y: number) => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
  window.dispatchEvent(new Event("scroll"));
  await nextTick();
};

describe("Fab (Vue)", () => {
  afterEach(() => { Object.defineProperty(window, "scrollY", { configurable: true, value: 0 }); });

  it("is a button named by its label, extended by default, and emits clicked", async () => {
    const { container, emitted } = render(Fab, { props: { label: "Ask", icon: "M12 5v14" } });
    const btn = screen.getByRole("button", { name: "Ask" });
    expect(btn.classList.contains("ui-fab--compact")).toBe(false);
    expect(container.querySelector(".ui-fab__svg")).toBeTruthy();
    await fireEvent.click(btn);
    expect(emitted().clicked).toHaveLength(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("extended=false is always the round button, with the same name", () => {
    render(Fab, { props: { label: "New note", extended: false } });
    expect(screen.getByRole("button", { name: "New note" }).classList.contains("ui-fab--compact")).toBe(true);
  });

  it("collapse-on-scroll: round while scrolling down, extended scrolling up and near the top", async () => {
    render(Fab, { props: { label: "Ask", collapseOnScroll: true } });
    const btn = screen.getByRole("button", { name: "Ask" });
    await scrollTo(400);
    expect(btn.classList.contains("ui-fab--compact")).toBe(true);
    await scrollTo(404); // un temblor no cuenta
    expect(btn.classList.contains("ui-fab--compact")).toBe(true);
    await scrollTo(300);
    expect(btn.classList.contains("ui-fab--compact")).toBe(false);
    await scrollTo(600);
    expect(btn.classList.contains("ui-fab--compact")).toBe(true);
    await scrollTo(20);
    expect(btn.classList.contains("ui-fab--compact")).toBe(false);
  });

  it("without collapse-on-scroll it never shrinks", async () => {
    render(Fab, { props: { label: "Ask" } });
    await scrollTo(900);
    expect(screen.getByRole("button", { name: "Ask" }).classList.contains("ui-fab--compact")).toBe(false);
  });

  it("sits in the start corner on request", () => {
    render(Fab, { props: { label: "Ask", placement: "start" } });
    expect(screen.getByRole("button", { name: "Ask" }).classList.contains("ui-fab--start")).toBe(true);
  });
});
