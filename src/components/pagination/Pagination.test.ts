import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Pagination from "./Pagination.vue";

const labels = () =>
  [...document.querySelectorAll(".ui-pagination__list > li")].map((li) =>
    li.querySelector(".ui-pagination__gap") ? "…" : (li.textContent ?? "").trim(),
  );

describe("Pagination (Vue)", () => {
  it("is a named navigation with the current page marked", () => {
    render(Pagination, { props: { pageCount: 5, page: 3, label: "Results" } });
    expect(screen.getByRole("navigation", { name: "Results" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Page 3" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "Page 2" }).hasAttribute("aria-current")).toBe(false);
  });

  it("shows first, last, the current page and its siblings, with gaps", () => {
    render(Pagination, { props: { pageCount: 20, page: 10 } });
    expect(labels()).toEqual(["‹", "1", "…", "9", "10", "11", "…", "20", "›"]);
  });

  it("shows a page instead of a gap that would hide only that page", () => {
    render(Pagination, { props: { pageCount: 7, page: 4 } });
    expect(labels()).toEqual(["‹", "1", "2", "3", "4", "5", "6", "7", "›"]);
  });

  it("honours more siblings", () => {
    render(Pagination, { props: { pageCount: 20, page: 10, siblings: 2 } });
    expect(labels()).toEqual(["‹", "1", "…", "8", "9", "10", "11", "12", "…", "20", "›"]);
  });

  it("goes to a page, and to the previous and next ones", async () => {
    const { emitted } = render(Pagination, { props: { pageCount: 10, page: 5 } });
    await fireEvent.click(screen.getByRole("button", { name: "Page 6" }));
    await fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    await fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    // Sin un padre que escuche, defineModel guarda la pagina: 5 -> 6 -> 7 -> 6.
    expect(emitted()["update:page"]).toEqual([[6], [7], [6]]);
    expect(emitted().pageChanged).toEqual([[6], [7], [6]]);
  });

  it("disables previous on the first page and next on the last", () => {
    const first = render(Pagination, { props: { pageCount: 3, page: 1 } });
    expect((screen.getByRole("button", { name: "Previous page" }) as HTMLButtonElement).disabled).toBe(true);
    first.unmount();
    render(Pagination, { props: { pageCount: 3, page: 3 } });
    expect((screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("does not emit for the current page", async () => {
    const { emitted } = render(Pagination, { props: { pageCount: 3, page: 2 } });
    await fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(emitted().pageChanged).toBeFalsy();
  });

  it("clamps a page out of range and renders nothing without pages", () => {
    render(Pagination, { props: { pageCount: 4, page: 99 } });
    expect(screen.getByRole("button", { name: "Page 4" }).getAttribute("aria-current")).toBe("page");
    const empty = render(Pagination, { props: { pageCount: 0 } });
    expect(empty.container.querySelector("nav")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(Pagination, { props: { pageCount: 12, page: 6 } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
