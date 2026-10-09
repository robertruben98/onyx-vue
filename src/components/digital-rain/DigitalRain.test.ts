import { render } from "@testing-library/vue";
import DigitalRain from "./DigitalRain.vue";

/**
 * The rain stops when its window has no focus or its tab is hidden, and moves
 * again on focus. The canvas context is a fake that counts the frames painted
 * (one `fillRect` for the persistence veil per frame).
 */
let frames = 0;
let focused = true;

function fakeContext() {
  return {
    setTransform: () => undefined,
    fillRect: () => {
      frames++;
    },
    fillText: () => undefined,
    fillStyle: "",
    font: "",
    textBaseline: "",
  } as unknown as CanvasRenderingContext2D;
}

beforeEach(() => {
  frames = 0;
  focused = true;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => fakeContext());
  vi.spyOn(document, "hasFocus").mockImplementation(() => focused);
  window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Frames painted over `ms` of fake time. */
function paintedIn(ms: number): number {
  const before = frames;
  vi.advanceTimersByTime(ms);
  return frames - before;
}

describe("DigitalRain", () => {
  it("paints at about 19 fps while the window has focus", () => {
    const { unmount } = render(DigitalRain);
    const n = paintedIn(1000);
    expect(n).toBeGreaterThanOrEqual(15);
    expect(n).toBeLessThanOrEqual(22);
    unmount();
  });

  it("stops without focus and starts again on focus, with a single loop", () => {
    const { unmount } = render(DigitalRain);
    paintedIn(200);
    focused = false;
    window.dispatchEvent(new Event("blur"));
    paintedIn(200); // the frame already scheduled may still land
    expect(paintedIn(2000)).toBe(0);
    focused = true;
    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("focus")); // a second focus must not start a second loop
    const n = paintedIn(1000);
    expect(n).toBeGreaterThanOrEqual(15);
    expect(n).toBeLessThanOrEqual(22);
    unmount();
  });

  it("keeps painting without focus when pauseWhenUnfocused is off", () => {
    focused = false;
    const { unmount } = render(DigitalRain, { props: { pauseWhenUnfocused: false } });
    expect(paintedIn(1000)).toBeGreaterThanOrEqual(15);
    unmount();
  });

  it("stops while the tab is hidden, whatever the prop", () => {
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    const { unmount } = render(DigitalRain, { props: { pauseWhenUnfocused: false } });
    paintedIn(200);
    expect(paintedIn(2000)).toBe(0);
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(paintedIn(1000)).toBeGreaterThanOrEqual(15);
    unmount();
  });

  it("removes its listeners on unmount", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const removeDoc = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(DigitalRain);
    unmount();
    expect(remove).toHaveBeenCalledWith("focus", expect.any(Function));
    expect(removeDoc).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });
});
