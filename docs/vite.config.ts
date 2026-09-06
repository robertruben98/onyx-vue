import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// The docs app consumes the library directly from source (`../src`). The
// `@onyx/vue` alias mirrors the published package name used in code snippets,
// so example imports read exactly as a consumer would write them.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: {
      "@onyx/vue": fileURLToPath(new URL("../src/index.ts", import.meta.url)),
      "@lib": fileURLToPath(new URL("../src", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
