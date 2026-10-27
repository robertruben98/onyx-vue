// Los medidores del scorecard que necesitan los componentes compilados.
//
// Corren con vitest (y su transformacion de .vue) pero NO son tests: cada
// `*.score.ts` escribe lo que mide en `scorecard/.out/` y `run.mjs` lo puntua.
// Viven fuera de `src/` para que `npm test` no los recoja.
import { defineConfig, mergeConfig } from "vitest/config";
import base from "../vite.config";

export default mergeConfig(
  base,
  defineConfig({
    test: {
      include: ["scorecard/**/*.score.ts"],
      setupFiles: ["./src/test-setup.ts"],
    },
  }),
);
