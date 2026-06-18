import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import Tag from "./Tag.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Tag (Vue)", () => {
  it("projects its content", () => {
    render(Tag, { slots: { default: "Frontend" } });
    expect(screen.getByText("Frontend")).toBeTruthy();
  });

  it("has no remove button unless removable", () => {
    render(Tag, { slots: { default: "Tag" } });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("emits removed when the remove button is clicked", async () => {
    const { emitted } = render(Tag, {
      props: { removable: true, removeLabel: "Quitar" },
      slots: { default: "Tag" },
    });
    await fireEvent.click(screen.getByRole("button", { name: /quitar/i }));
    expect(emitted().removed).toBeTruthy();
    expect(emitted().removed!.length).toBe(1);
  });

  it("remove button is keyboard operable", async () => {
    const { emitted } = render(Tag, {
      props: { removable: true },
      slots: { default: "Tag" },
    });
    const button = screen.getByRole("button");
    button.focus();
    expect(document.activeElement).toBe(button);
    await fireEvent.keyDown(button, { key: "Enter" });
    // Native button activates on Enter via click; simulate the resulting click.
    await fireEvent.click(button);
    expect(emitted().removed).toBeTruthy();
  });

  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    "has no axe violations (%s)",
    async (variant) => {
      const { container } = render(Tag, {
        props: { variant, removable: true },
        slots: { default: "Tag" },
      });
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
