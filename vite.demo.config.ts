import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  root: "demo",
  base: "/onyx-vue/",
  plugins: [vue()],
  build: {
    outDir: resolve(__dirname, "site"),
    emptyOutDir: true,
  },
});
