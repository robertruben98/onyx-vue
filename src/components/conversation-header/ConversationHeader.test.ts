import { render } from "@testing-library/vue";
import { axe } from "jest-axe";
import ConversationHeader from "./ConversationHeader.vue";

describe("ConversationHeader (Vue)", () => {
  it("renders the name as heading with the subtitle stacked under it", () => {
    const { getByRole, container } = render(ConversationHeader, {
      props: { name: "Ana Torres", subtitle: "online" },
    });
    expect(getByRole("heading", { level: 2 }).textContent).toBe("Ana Torres");
    const text = container.querySelector(".ui-conversation-header__text")!;
    expect(text.children[0].className).toContain("__name");
    expect(text.children[1].textContent).toBe("online");
  });

  it("shows a 40px avatar with initials when there is no image", () => {
    const { container } = render(ConversationHeader, { props: { name: "Ana Torres" } });
    const avatar = container.querySelector(".ui-avatar");
    expect(avatar).not.toBeNull();
    expect(avatar?.textContent?.trim()).toBe("AT");
  });

  it("renders leading and actions slots only when given", () => {
    const bare = render(ConversationHeader, { props: { name: "Ana" } });
    expect(bare.container.querySelector(".ui-conversation-header__leading")).toBeNull();
    expect(bare.container.querySelector(".ui-conversation-header__actions")).toBeNull();
    const full = render(ConversationHeader, {
      props: { name: "Ana" },
      slots: {
        leading: '<button type="button" aria-label="Back">&lt;</button>',
        actions: '<button type="button" aria-label="Search">s</button>',
      },
    });
    expect(full.getByLabelText("Back")).toBeTruthy();
    expect(full.getByLabelText("Search")).toBeTruthy();
  });

  it("omits the subtitle element when empty", () => {
    const { container } = render(ConversationHeader, { props: { name: "Ana" } });
    expect(container.querySelector(".ui-conversation-header__subtitle")).toBeNull();
  });

  it("headingLevel 0 renders plain text", () => {
    const { queryByRole } = render(ConversationHeader, { props: { name: "Ana", headingLevel: 0 } });
    expect(queryByRole("heading")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(ConversationHeader, {
      props: { name: "Ana Torres", subtitle: "online" },
      slots: { actions: '<button type="button" aria-label="Menu">:</button>' },
    });
    expect(await axe(container, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
