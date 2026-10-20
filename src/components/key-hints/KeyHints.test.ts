import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import KeyHints from "./KeyHints.vue";

const axeOptions = { rules: { region: { enabled: false } } };

const hints = [
  { keys: "j k", action: "mover" },
  { keys: "enter", action: "workflow" },
  { keys: "1-7", action: "vistas" },
];

describe("KeyHints (Vue)", () => {
  it("renders every pair", () => {
    render(KeyHints, { props: { hints } });
    expect(screen.getByText("j k")).toBeTruthy();
    expect(screen.getByText("mover")).toBeTruthy();
    expect(screen.getByText("vistas")).toBeTruthy();
  });

  it("keeps the pairing, so a key and its meaning cannot drift apart", () => {
    const { container } = render(KeyHints, { props: { hints } });
    const pairs = container.querySelectorAll(".ui-key-hints__hint");
    expect(pairs.length).toBe(3);
    expect(pairs[1].querySelector("kbd")?.textContent).toBe("enter");
    expect(pairs[1].querySelector("dd")?.textContent).toBe("workflow");
  });

  it("marks the keys up as keys", () => {
    const { container } = render(KeyHints, { props: { hints } });
    expect(container.querySelectorAll("kbd").length).toBe(3);
  });

  it("renders the trailing slot", () => {
    render(KeyHints, {
      props: { hints },
      slots: { trailing: () => "auto-refresh 60s" },
    });
    expect(screen.getByText("auto-refresh 60s")).toBeTruthy();
  });

  it("renders nothing but the trailing slot with no hints", () => {
    const { container } = render(KeyHints, { props: { hints: [] } });
    expect(container.querySelectorAll(".ui-key-hints__hint").length).toBe(0);
    expect(container.querySelector(".ui-key-hints")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(KeyHints, { props: { hints } });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
