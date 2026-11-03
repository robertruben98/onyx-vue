import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import PanelHeader from "./PanelHeader.vue";

describe("PanelHeader (Vue)", () => {
  it("renders the title as a level-2 heading by default", () => {
    const { getByRole } = render(PanelHeader, { props: { title: "Chats" } });
    expect(getByRole("heading", { level: 2 }).textContent).toBe("Chats");
  });

  it("renders plain text with headingLevel 0", () => {
    const { container, queryByRole } = render(PanelHeader, { props: { title: "Chats", headingLevel: 0 } });
    expect(queryByRole("heading")).toBeNull();
    expect(container.querySelector("span.ui-panel-header__title")?.textContent).toBe("Chats");
  });

  it("renders the actions slot only when given", () => {
    const none = render(PanelHeader, { props: { title: "Chats" } });
    expect(none.container.querySelector(".ui-panel-header__actions")).toBeNull();
    const some = render(PanelHeader, {
      props: { title: "Chats" },
      slots: { actions: '<button type="button" aria-label="New chat">+</button>' },
    });
    expect(some.getByLabelText("New chat")).toBeTruthy();
  });

  it("title slot replaces the title text", () => {
    const { getByText, container } = render(PanelHeader, { slots: { title: "<b>Custom</b>" } });
    expect(getByText("Custom")).toBeTruthy();
    expect(container.querySelector(".ui-panel-header__title")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(PanelHeader, {
      props: { title: "Chats" },
      slots: { actions: '<button type="button" aria-label="Menu">:</button>' },
    });
    expect(await axe(container, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});

describe("PanelHeader branches", () => {
  it("renders no title element without a title or slot", () => {
    const { container } = render(PanelHeader);
    expect(container.querySelector(".ui-panel-header__title")).toBeNull();
  });

  it.each([1, 3] as const)("renders an h%i for headingLevel %i", (level) => {
    const { getByRole } = render(PanelHeader, { props: { title: "Chats", headingLevel: level } });
    expect(getByRole("heading", { level }).textContent).toBe("Chats");
  });
});
