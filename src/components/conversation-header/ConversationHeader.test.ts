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

import { render as renderBranches } from "@testing-library/vue";
import ConversationHeaderBranches from "./ConversationHeader.vue";

describe("ConversationHeader branches", () => {
  it("renders no name or subtitle element without text", () => {
    const { container } = renderBranches(ConversationHeaderBranches);
    expect(container.querySelector(".ui-conversation-header__name")).toBeNull();
    expect(container.querySelector(".ui-conversation-header__subtitle")).toBeNull();
    expect(container.querySelector(".ui-conversation-header__leading")).toBeNull();
    expect(container.querySelector(".ui-conversation-header__actions")).toBeNull();
  });

  it("renders plain text for headingLevel 0 and a heading otherwise", () => {
    const plain = renderBranches(ConversationHeaderBranches, { props: { name: "Ada", headingLevel: 0 } });
    expect(plain.queryByRole("heading")).toBeNull();
    expect(plain.container.querySelector("span.ui-conversation-header__name")?.textContent).toBe("Ada");
    const h3 = renderBranches(ConversationHeaderBranches, { props: { name: "Ada", headingLevel: 3 } });
    expect(h3.getByRole("heading", { level: 3 }).textContent).toBe("Ada");
  });

  it("leading, actions, avatar, title and subtitle slots replace the defaults", () => {
    const { container, getByText } = renderBranches(ConversationHeaderBranches, {
      props: { name: "Ada", subtitle: "online" },
      slots: {
        leading: "<i>back</i>",
        actions: "<i>more</i>",
        avatar: "<i>pic</i>",
        title: "<i>Custom name</i>",
        subtitle: "<i>Custom sub</i>",
      },
    });
    for (const t of ["back", "more", "pic", "Custom name", "Custom sub"]) expect(getByText(t)).toBeTruthy();
    expect(container.querySelector(".ui-conversation-header__name")).toBeNull();
    expect(container.querySelector(".ui-avatar")).toBeNull();
  });

  it("shows the avatar image or initials, with or without the gradient", () => {
    const img = renderBranches(ConversationHeaderBranches, { props: { name: "Ada", avatarSrc: "a.png" } });
    expect(img.container.querySelector("img")?.getAttribute("src")).toBe("a.png");
    const flat = renderBranches(ConversationHeaderBranches, { props: { name: "Ada", avatarGradient: false } });
    expect(flat.container.querySelector(".ui-avatar--gradient")).toBeNull();
  });
});
