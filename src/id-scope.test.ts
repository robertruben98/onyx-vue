import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// A counter declared inside `<script setup>` is NOT module scope: Vue compiles
// that block into `setup()`, so it resets for every instance and two components
// on one page render the same DOM id. `<label for>` then points at the wrong
// control, and aria-labelledby/aria-describedby resolve to the wrong element.
//
// The check is static on purpose. Rendering every component twice would need
// every component's required props; reading where the counter is declared needs
// nothing and catches the mistake at the place it is made.
const COMPONENTES = join(process.cwd(), "src", "components");

/**
 * The `<script setup>` body with comments removed.
 *
 * Comments matter: a component that documents this very bug quotes the broken
 * line, and a guard that reads raw text would flag the fix as the defect.
 */
function cuerpoDeScriptSetup(sfc: string): string {
  const m = /<script setup[^>]*>([\s\S]*?)<\/script>/.exec(sfc);
  if (!m) return "";
  return m[1]
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const sfcs = readdirSync(COMPONENTES, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) =>
    readdirSync(join(COMPONENTES, d.name))
      .filter((f) => f.endsWith(".vue"))
      .map((f) => [`${d.name}/${f}`, readFileSync(join(COMPONENTES, d.name, f), "utf8")] as const),
  );

describe("id generation is not scoped to setup()", () => {
  it("finds the component files", () => {
    // Guards the guard: a broken glob would make the check below vacuously pass.
    expect(sfcs.length).toBeGreaterThan(30);
  });

  it("declares no id counter inside <script setup>", () => {
    const infractores = sfcs
      .filter(([, sfc]) => /\blet\s+next\w*[Ii]d\b/.test(cuerpoDeScriptSetup(sfc)))
      .map(([nombre]) => nombre);
    expect(infractores).toEqual([]);
  });
});
