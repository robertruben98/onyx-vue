import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import LoadMoreRow from "./LoadMoreRow.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("LoadMoreRow (Vue)", () => {
  it("says how many rows are still hidden", () => {
    render(LoadMoreRow, { props: { remaining: 737 } });
    expect(screen.getByRole("button", { name: /737/ })).toBeTruthy();
  });

  it("takes a custom label", () => {
    render(LoadMoreRow, { props: { remaining: 12, label: "ver las 12 restantes" } });
    expect(screen.getByRole("button", { name: "ver las 12 restantes" })).toBeTruthy();
  });

  it("emits loadMore when activated", () => {
    const { emitted } = render(LoadMoreRow, { props: { remaining: 5 } });
    (screen.getByRole("button") as HTMLButtonElement).click();
    expect(emitted().loadMore).toBeTruthy();
    expect(emitted().loadMore!.length).toBe(1);
  });

  it("renders nothing at all when nothing remains", () => {
    const { container } = render(LoadMoreRow, { props: { remaining: 0 } });
    expect(container.querySelector(".ui-load-more-row")).toBe(null);
  });

  it("renders nothing for a negative remainder either", () => {
    const { container } = render(LoadMoreRow, { props: { remaining: -3 } });
    expect(container.querySelector(".ui-load-more-row")).toBe(null);
  });

  it("shows a busy button while loading, and does not emit again", () => {
    const { emitted } = render(LoadMoreRow, { props: { remaining: 9, loading: true } });
    const button = screen.getByRole("button") as HTMLButtonElement;
    button.click();
    expect(emitted().loadMore).toBeFalsy();
  });

  it("has no axe violations", async () => {
    const { container } = render(LoadMoreRow, { props: { remaining: 42 } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
