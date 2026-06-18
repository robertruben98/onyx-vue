import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h } from "vue";
import Accordion from "./Accordion.vue";
import AccordionItem from "./AccordionItem.vue";

function renderAccordion(multi = false) {
  const Host = defineComponent({
    components: { Accordion, AccordionItem },
    props: { multi: { type: Boolean, default: false } },
    setup(props) {
      return () =>
        h(Accordion, { multi: props.multi }, () => [
          h(AccordionItem, { heading: "One" }, () => "First body"),
          h(AccordionItem, { heading: "Two" }, () => "Second body"),
          h(
            AccordionItem,
            { heading: "Three", disabled: true },
            () => "Third body",
          ),
        ]);
    },
  });
  return render(Host, { props: { multi } });
}

describe("Accordion (Vue)", () => {
  it("starts collapsed with aria-expanded=false", () => {
    renderAccordion();
    for (const name of ["One", "Two", "Three"]) {
      expect(
        screen.getByRole("button", { name }).getAttribute("aria-expanded"),
      ).toBe("false");
    }
  });

  it("expands an item on click", async () => {
    renderAccordion();
    await fireEvent.click(screen.getByRole("button", { name: "One" }));
    expect(
      screen.getByRole("button", { name: "One" }).getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      screen.getByRole("region", { name: "One" }).hasAttribute("hidden"),
    ).toBe(false);
  });

  it("collapses others in single mode", async () => {
    renderAccordion(false);
    await fireEvent.click(screen.getByRole("button", { name: "One" }));
    await fireEvent.click(screen.getByRole("button", { name: "Two" }));
    expect(
      screen.getByRole("button", { name: "One" }).getAttribute("aria-expanded"),
    ).toBe("false");
    expect(
      screen.getByRole("button", { name: "Two" }).getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("keeps multiple open in multi mode", async () => {
    renderAccordion(true);
    await fireEvent.click(screen.getByRole("button", { name: "One" }));
    await fireEvent.click(screen.getByRole("button", { name: "Two" }));
    expect(
      screen.getByRole("button", { name: "One" }).getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: "Two" }).getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("does not toggle a disabled item", async () => {
    renderAccordion();
    await fireEvent.click(screen.getByRole("button", { name: "Three" }));
    expect(
      screen
        .getByRole("button", { name: "Three" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("has no axe violations", async () => {
    const { container } = renderAccordion();
    expect(await axe(container)).toHaveNoViolations();
  });
});
