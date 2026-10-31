const warned = new Set<string>();

/** Shared across component instances for the lifetime of the loaded module. */
export function warnDeprecated(kind: "tone" | "event", name: string, replacement: string) {
  if (import.meta.env.DEV) {
    const key = `${kind}:${name}`;
    if (warned.has(key)) return;
    warned.add(key);
    console.warn(`[onyx-vue] Deprecated ${kind} "${name}": use "${replacement}" instead. It will be removed in 1.0.`);
  }
}
