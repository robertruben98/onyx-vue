import { render, screen } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h } from "vue";
import FormField from "./FormField.vue";
import { UiInput } from "../input";

/** A field wired the way the docs show it. */
function field(props: { label: string; help?: string; error?: string; required?: boolean }) {
  return render(
    defineComponent({
      setup() {
        return () =>
          h(FormField, props, {
            default: (s: { id: string; describedBy?: string; invalid: boolean; required: boolean }) =>
              h(UiInput, { id: s.id, "aria-describedby": s.describedBy, invalid: s.invalid, required: s.required }),
          });
      },
    }),
  );
}

describe("FormField (Vue)", () => {
  it("labels the control through the id it hands to the slot", () => {
    field({ label: "Email" });
    expect(screen.getByLabelText("Email").tagName).toBe("INPUT");
  });

  it("describes the control with the hint", () => {
    field({ label: "Email", help: "Only for receipts." });
    const el = screen.getByLabelText("Email");
    const hint = document.getElementById(el.getAttribute("aria-describedby") ?? "");
    expect(hint?.textContent).toBe("Only for receipts.");
  });

  it("marks the control invalid and describes it with hint and error", () => {
    field({ label: "Email", help: "Only for receipts.", error: "Not an address." });
    const el = screen.getByLabelText("Email");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    const ids = (el.getAttribute("aria-describedby") ?? "").split(" ");
    expect(ids.length).toBe(2);
    expect(document.getElementById(ids[1])?.textContent).toBe("Not an address.");
  });

  it("leaves aria-describedby off with neither hint nor error", () => {
    field({ label: "Email" });
    expect(screen.getByLabelText("Email").hasAttribute("aria-describedby")).toBe(false);
  });

  it("shows the required mark, hidden from screen readers, and passes required down", () => {
    const { container } = field({ label: "Email", required: true });
    const mark = container.querySelector(".ui-form-field__required");
    expect(mark?.getAttribute("aria-hidden")).toBe("true");
    expect((screen.getByRole("textbox") as HTMLInputElement).required).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = field({ label: "Email", help: "Hint", error: "Wrong" });
    expect(await axe(container)).toHaveNoViolations();
  });
});
