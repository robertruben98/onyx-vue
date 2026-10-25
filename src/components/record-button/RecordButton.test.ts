import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, fireEvent } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import RecordButton from "./RecordButton.vue";

const scss = readFileSync(join(process.cwd(), "src", "components", "record-button", "record-button.scss"), "utf8");

describe("RecordButton (Vue)", () => {
  it("is a toggle button, not pressed while idle", () => {
    render(RecordButton, { props: { label: "Record my answer" } });
    const button = screen.getByRole("button", { name: "Record my answer" });
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.hasAttribute("aria-busy")).toBe(false);
  });

  it("is pressed while recording and shows the recording label", () => {
    const { container } = render(RecordButton, {
      props: { label: "Record my answer", recordingLabel: "Stop", recording: true },
    });
    const button = screen.getByRole("button", { name: "Stop", pressed: true });
    expect(button.classList.contains("ui-record-button--recording")).toBe(true);
    expect(container.querySelector(".ui-record-button__spinner")).toBeNull();
  });

  it("emits the state it moves to", async () => {
    const { emitted, rerender } = render(RecordButton, { props: { label: "Rec" } });
    await fireEvent.click(screen.getByRole("button"));
    await rerender({ label: "Rec", recording: true });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().toggled).toEqual([[true], [false]]);
  });

  it("activates with Enter and Space", async () => {
    const { emitted } = render(RecordButton, { props: { label: "Rec" } });
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(emitted().toggled).toHaveLength(2);
  });

  it("is busy: spinner, aria-busy, busy label, disabled and silent", async () => {
    const { container, emitted } = render(RecordButton, {
      props: { label: "Rec", busyLabel: "Transcribing…", busy: true, recording: true },
    });
    const button = screen.getByRole("button", { name: "Transcribing…" }) as HTMLButtonElement;
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.disabled).toBe(true);
    expect(container.querySelector(".ui-record-button__spinner")).toBeTruthy();
    expect(button.classList.contains("ui-record-button--recording")).toBe(false);
    await fireEvent.click(button);
    expect(emitted().toggled).toBeFalsy();
  });

  it("does not emit when disabled", async () => {
    const { emitted } = render(RecordButton, { props: { label: "Rec", disabled: true } });
    await fireEvent.click(screen.getByRole("button"));
    expect(emitted().toggled).toBeFalsy();
  });

  it("shows the meter slot only while recording, hidden from the accessible name", async () => {
    const slots = { meter: "<span class='m'>|||</span>", detail: "0:12" };
    const { container, rerender } = render(RecordButton, { props: { label: "Stop", recording: false }, slots });
    expect(container.querySelector(".m")).toBeNull();
    await rerender({ label: "Stop", recording: true });
    expect(container.querySelector(".ui-record-button__meter .m")).toBeTruthy();
    expect(container.querySelector(".ui-record-button__meter")!.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".ui-record-button__detail")!.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("button", { name: "Stop" })).toBeTruthy();
  });

  it("puts size and block classes on the button", () => {
    render(RecordButton, { props: { size: "md", block: true } });
    const cls = screen.getByRole("button").classList;
    expect(cls.contains("ui-record-button--md")).toBe(true);
    expect(cls.contains("ui-record-button--block")).toBe(true);
  });

  it("pulses only with motion allowed, and draws focus with an outline", () => {
    expect(scss).toMatch(/\.ui-record-button--recording::before \{[^}]*animation: ui-record-button-pulse/);
    const reduced = scss.slice(scss.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/\.ui-record-button--recording::before \{[^}]*animation: none/);
    expect(reduced).toMatch(/\.ui-record-button__spinner \{[^}]*animation: none/);
    expect(scss).toMatch(/\.ui-record-button:focus-visible \{[^}]*outline: var\(--ui-focus-ring-width\) solid var\(--ui-focus-ring\)/);
  });

  it.each([
    [{ label: "Record" }],
    [{ label: "Record", recording: true, recordingLabel: "Stop" }],
    [{ label: "Record", busy: true, busyLabel: "Transcribing…" }],
  ])("has no axe violations (%o)", async (props) => {
    const { container } = render(RecordButton, { props });
    expect(await axe(container)).toHaveNoViolations();
  });
});
