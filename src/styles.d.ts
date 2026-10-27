// TypeScript 6 checks side-effect imports (noUncheckedSideEffectImports): every component imports
// its own stylesheet for the bundler, and a stylesheet exports nothing to type.
declare module "*.scss";
declare module "*.css";
