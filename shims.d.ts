declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<Record<string, unknown>, unknown, any>;
  export default component;
}
declare module "*.scss";
declare module "*.css";

// jest-axe matcher on Vitest's expect (extended in test-setup.ts).
import "vitest";
declare module "vitest" {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
