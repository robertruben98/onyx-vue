import { fireEvent, render } from "@testing-library/vue";
import { axe } from "jest-axe";
import TabBar, { type TabBarItem } from "./TabBar.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const ITEMS: TabBarItem[] = [
  { id: "home", label: "Home", href: "#/", icon: "🏠" },
  { id: "get", label: "Get", href: "#/get" },
  { id: "library", label: "Library", href: "#/library" },
  { id: "jobs", label: "Jobs", href: "#/jobs", count: 2 },
  { id: "rules", label: "Rules", href: "#/rules" },
  { id: "log", label: "Log", href: "#/log", live: true },
];

// Every width counts as "phone" unless a test says otherwise.
function stubWidth(wide: boolean): void {
  window.matchMedia = ((q: string) => ({
    matches: wide,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => stubWidth(false));

describe("TabBar (Vue)", () => {
  it("puts the first `visible` destinations in the bar and the rest behind More", () => {
    const { container, getByRole } = render(TabBar, { props: { items: ITEMS, visible: 4 } });
    const bar = container.querySelector(".ui-tab-bar__items")!;
    expect([...bar.querySelectorAll("a")].map((a) => a.getAttribute("href")))
      .toEqual(["#/", "#/get", "#/library", "#/jobs"]);
    expect(getByRole("button", { name: /More/ }).getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".ui-tab-bar__sheet")).toBeNull();
  });

  it("shows everything when only one destination would be left over", () => {
    const { container, queryByRole } = render(TabBar, {
      props: { items: ITEMS.slice(0, 5), visible: 4 },
    });
    expect(container.querySelectorAll(".ui-tab-bar__items a").length).toBe(5);
    expect(queryByRole("button", { name: /More/ })).toBeNull();
  });

  it("opens the sheet with the rest and closes it on Escape, returning focus", async () => {
    const { container, getByRole } = render(TabBar, { props: { items: ITEMS } });
    const more = getByRole("button", { name: /More/ });
    await fireEvent.click(more);
    expect(more.getAttribute("aria-expanded")).toBe("true");
    const sheet = container.querySelector(".ui-tab-bar__sheet")!;
    expect([...sheet.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual(["#/rules", "#/log"]);
    await fireEvent.keyDown(document, { key: "Escape" });
    expect(container.querySelector(".ui-tab-bar__sheet")).toBeNull();
    expect(document.activeElement).toBe(more);
  });

  it("closes the sheet on a tap outside", async () => {
    const { container, getByRole } = render(TabBar, { props: { items: ITEMS } });
    await fireEvent.click(getByRole("button", { name: /More/ }));
    await fireEvent.pointerDown(document.body);
    expect(container.querySelector(".ui-tab-bar__sheet")).toBeNull();
  });

  it("marks the current page, and More when the page is behind it", async () => {
    const { container, getByRole, rerender } = render(TabBar, {
      props: { items: ITEMS, activeId: "get" },
    });
    expect(container.querySelector('[aria-current="page"]')?.getAttribute("href")).toBe("#/get");
    await rerender({ items: ITEMS, activeId: "rules" });
    expect(getByRole("button", { name: /More/ }).classList).toContain("ui-tab-bar__item--active");
  });

  it("emits itemClicked on a plain click and leaves modified clicks to the browser", async () => {
    const { getByText, emitted } = render(TabBar, { props: { items: ITEMS } });
    await fireEvent.click(getByText("Library"));
    expect(emitted().itemClicked).toHaveLength(1);
    expect((emitted().itemClicked[0] as [TabBarItem])[0].id).toBe("library");
    await fireEvent.click(getByText("Library"), { ctrlKey: true });
    expect(emitted().itemClicked).toHaveLength(1);
  });

  it("shows a count, hides a zero, and lets live win over the count", async () => {
    const items: TabBarItem[] = [
      { id: "a", label: "A", href: "#/a", count: 3 },
      { id: "b", label: "B", href: "#/b", count: 0 },
      { id: "c", label: "C", href: "#/c", count: 5, live: true },
    ];
    const { container, getAllByRole } = render(TabBar, { props: { items } });
    expect([...container.querySelectorAll(".ui-tab-bar__count")].map((c) => c.textContent)).toEqual(["3"]);
    expect(getAllByRole("img", { name: "running" })).toHaveLength(1);
  });

  it("is not rendered at all above hideAbove", () => {
    stubWidth(true);
    const { container } = render(TabBar, { props: { items: ITEMS, hideAbove: 640 } });
    expect(container.querySelector(".ui-tab-bar")).toBeNull();
    expect(container.querySelector(".ui-tab-bar__spacer")).toBeNull();
  });

  it("has no axe violations, closed and open", async () => {
    const { container, getByRole } = render(TabBar, { props: { items: ITEMS, activeId: "home" } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
    await fireEvent.click(getByRole("button", { name: /More/ }));
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
