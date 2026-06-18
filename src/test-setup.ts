import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

// Accessibility matcher; component tests use native DOM assertions otherwise
// (toBeTruthy / getAttribute) to keep the type setup minimal and portable.
expect.extend(toHaveNoViolations);
