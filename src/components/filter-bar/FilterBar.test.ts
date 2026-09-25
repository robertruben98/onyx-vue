import { render, screen, fireEvent } from "@testing-library/vue";
import { axe } from "jest-axe";
import { defineComponent, h, ref } from "vue";
import FilterBar from "./FilterBar.vue";

const axeOptions = { rules: { region: { enabled: false } } };

describe("FilterBar (Vue)", () => {
  it("is a named search landmark with a named search box", () => {
    render(FilterBar, { props: { label: "Filtros de runs", searchLabel: "filtrar runs" } });
    expect(screen.getByRole("search", { name: "Filtros de runs" })).toBeTruthy();
    expect(screen.getByRole("searchbox", { name: "filtrar runs" })).toBeTruthy();
  });

  it("binds the search text two ways", async () => {
    const { emitted } = render(FilterBar, { props: { search: "" } });
    await fireEvent.update(screen.getByRole("searchbox"), "pr-fix");
    expect(emitted()["update:search"]?.[0]).toEqual(["pr-fix"]);
  });

  it("renders chips and trailing content", () => {
    render(FilterBar, {
      slots: {
        default: "<button type='button'>todos</button>",
        trailing: "<button type='button'>limpiar</button>",
      },
    });
    expect(screen.getByRole("button", { name: "todos" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "limpiar" })).toBeTruthy();
  });

  it("can drop the search box", () => {
    render(FilterBar, { props: { showSearch: false }, slots: { default: "<span>x</span>" } });
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("focuses the search box on request", async () => {
    const Host = defineComponent({
      setup() {
        const bar = ref<{ focusSearch: () => void } | null>(null);
        return () =>
          h("div", [
            h(FilterBar, { ref: bar }),
            h("button", { type: "button", onClick: () => bar.value?.focusSearch() }, "slash"),
          ]);
      },
    });
    render(Host);
    await fireEvent.click(screen.getByRole("button", { name: "slash" }));
    expect(document.activeElement).toBe(screen.getByRole("searchbox"));
  });

  it("has no axe violations", async () => {
    const { container } = render(FilterBar, {
      props: { searchLabel: "filtrar" },
      slots: { default: "<button type='button' aria-pressed='true'>todos</button>" },
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
