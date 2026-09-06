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
  // Served at https://onyx.local.com through the SM23 caddy (see
  // scripts/Caddyfile.local) by the `onyx-docs` user unit.
  //
  //  - `host: 127.0.0.1` keeps the dev server off the LAN; caddy is the only
  //    thing that reaches it.
  //  - `strictPort` makes a busy port a startup failure instead of a silent
  //    move to 9301, which would leave the domain proxying to nothing.
  //  - `allowedHosts`: vite rejects Host headers it does not know with a 403
  //    that reads like a blank page.
  //  - `hmr.clientPort`/`protocol`: the browser talks to caddy on 443, not to
  //    vite on 9300. Without this the client dials wss://onyx.local.com:9300
  //    and retries forever.
  server: {
    host: "127.0.0.1",
    port: 9300,
    strictPort: true,
    allowedHosts: ["onyx.local.com"],
    hmr: { protocol: "wss", host: "onyx.local.com", clientPort: 443 },
  },
});
