/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { cpSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

// Las hojas de tokens y presets viajan tal cual en `dist/styles`, para que un
// consumidor importe solo la capa base y su preset (`onyx-vue/styles/base.css`,
// `onyx-vue/styles/matrix.css`) en vez del paquete entero. Se copian y no se
// compilan: sus `@import` son relativos y siguen valiendo en la copia.
function copyStyles(): Plugin {
  return {
    name: "onyx-copy-styles",
    apply: "build",
    closeBundle() {
      cpSync(resolve(__dirname, "src/styles"), resolve(__dirname, "dist/styles"), {
        recursive: true,
        filter: (src) => !src.endsWith(".test.ts"),
      });
    },
  };
}

export default defineConfig({
  plugins: [vue(), copyStyles()],
  // Los mismos alias que la app de documentacion (docs/vite.config.ts), para
  // que sus paginas y sus pruebas se resuelvan bajo vitest desde la raiz.
  resolve: {
    alias: {
      "@onyx/vue/styles": resolve(__dirname, "src/styles"),
      "@onyx/vue": resolve(__dirname, "src/index.ts"),
      "@lib": resolve(__dirname, "src"),
      "@": resolve(__dirname, "docs/src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "OnyxVue",
      fileName: (format) => `onyx-vue.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["vue"],
      output: { globals: { vue: "Vue" } },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    // `?raw` de las hojas de tokens (la pagina de Theming) tiene que devolver el
    // texto, no una cadena vacia; el resto del CSS sigue desactivado.
    css: { include: [/src\/styles\/.*\.css\?raw/] },
  },
});
