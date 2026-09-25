import { reactive, readonly } from "vue";

/** Semantic tone of a toast. `danger` is announced assertively. */
export type ToastTone = "neutral" | "success" | "warning" | "danger";

/** One message in the queue. */
export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface ToastOptions {
  /** Semantic tone. */
  tone?: ToastTone;
  /** Milliseconds on screen; `0` keeps it until dismissed. */
  duration?: number;
}

/**
 * The queue lives at module scope on purpose: `useToast()` is called from
 * wherever something happened — a click handler three components deep, a
 * composable polling an API — and they all have to land in the one host the
 * page mounted. A provide/inject pair would force every caller to sit under
 * that host in the tree, which a composable does not.
 */
const queue = reactive<ToastMessage[]>([]);
const timers = new Map<number, ReturnType<typeof setTimeout>>();
let seq = 0;

/** At most this many on screen; the oldest goes first. */
const MAX_VISIBLE = 3;

function dismiss(id: number): void {
  const i = queue.findIndex((t) => t.id === id);
  if (i >= 0) queue.splice(i, 1);
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
}

function show(message: string, options: ToastOptions = {}): number {
  const id = ++seq;
  queue.push({ id, message, tone: options.tone ?? "neutral" });
  while (queue.length > MAX_VISIBLE) dismiss(queue[0].id);
  const duration = options.duration ?? 3200;
  if (duration > 0) timers.set(id, setTimeout(() => dismiss(id), duration));
  return id;
}

function clear(): void {
  for (const t of [...queue]) dismiss(t.id);
}

/** Show and dismiss transient messages; render them with one `UiToastHost`. */
export function useToast() {
  return { show, dismiss, clear, toasts: readonly(queue) };
}
