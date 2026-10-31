declare const process: { env: { NODE_ENV?: string } };
const warned = new Set<string>();

/** Shared across component instances for the lifetime of the loaded module. */
export function warnDeprecated(kind: "tone" | "event", name: string, replacement: string) {
  // Literal a proposito, sin try: el bundler del consumidor lo sustituye y en
  // produccion queda `if (true) return`, asi que el minificador quita el aviso
  // y su texto. Solo se llega aqui despues de un `isDev()`, que en un UMD sin
  // `process` ya devolvio false.
  if (process.env.NODE_ENV === "production") return;
  {
    const key = `${kind}:${name}`;
    if (warned.has(key)) return;
    warned.add(key);
    console.warn(`[onyx-vue] Deprecated ${kind} "${name}": use "${replacement}" instead. It will be removed in 1.0.`);
  }
}
