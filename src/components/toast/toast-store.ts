import { reactive, readonly } from "vue";

/** Semantic tone of a toast. `danger` is announced assertively. */
export type ToastTone = "neutral" | "success" | "warning" | "danger";

/** A button on the toast ("Undo"). Activating it runs `onAction` and closes the toast. */
export interface ToastAction {
  /** Visible label and accessible name of the button. */
  label: string;
  /** Runs when the button is activated, before the toast closes. */
  onAction: () => void;
}

/** One message in the queue. */
export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
  /** The action button, when the toast has one. */
  action?: ToastAction;
}

export interface ToastOptions {
  /** Semantic tone. */
  tone?: ToastTone;
  /**
   * Milliseconds on screen; `0` keeps it until dismissed. Defaults to 3200, or
   * 6000 when the toast has an action: the action has to be reachable.
   */
  duration?: number;
  /** An action button on the toast, such as Undo. */
  action?: ToastAction;
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
/** Time left and when the current countdown started, per toast with a duration. */
const countdowns = new Map<number, { left: number; since: number }>();
/** Toasts whose countdown is held (focus or pointer inside). */
const held = new Set<number>();
let seq = 0;

/** Default time on screen; longer when there is an action to reach. */
const DEFAULT_DURATION = 3200;
const DEFAULT_ACTION_DURATION = 6000;

/** At most this many on screen; the oldest goes first. */
const MAX_VISIBLE = 3;

function stopTimer(id: number): void {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
}

function startTimer(id: number): void {
  const countdown = countdowns.get(id);
  if (!countdown) return;
  countdown.since = Date.now();
  timers.set(id, setTimeout(() => dismiss(id), countdown.left));
}

function dismiss(id: number): void {
  const i = queue.findIndex((t) => t.id === id);
  if (i >= 0) queue.splice(i, 1);
  stopTimer(id);
  countdowns.delete(id);
  held.delete(id);
}

function show(message: string, options: ToastOptions = {}): number {
  const id = ++seq;
  queue.push({ id, message, tone: options.tone ?? "neutral", action: options.action });
  while (queue.length > MAX_VISIBLE) dismiss(queue[0].id);
  const duration = options.duration ?? (options.action ? DEFAULT_ACTION_DURATION : DEFAULT_DURATION);
  if (duration > 0) {
    countdowns.set(id, { left: duration, since: Date.now() });
    startTimer(id);
  }
  return id;
}

/**
 * Holds a toast on screen: its countdown stops until `resume`. The host calls
 * it while focus or the pointer is inside the toast, so a keyboard user who
 * tabbed to "Undo" does not see it vanish under the cursor (WCAG 2.2.1).
 */
function pause(id: number): void {
  const countdown = countdowns.get(id);
  if (!countdown || held.has(id)) return;
  held.add(id);
  stopTimer(id);
  countdown.left = Math.max(0, countdown.left - (Date.now() - countdown.since));
}

/** Restarts a held countdown with the time it had left. */
function resume(id: number): void {
  if (!held.delete(id)) return;
  startTimer(id);
}

/** Runs a toast's action and closes it. */
function act(id: number): void {
  const toast = queue.find((t) => t.id === id);
  if (!toast?.action) return;
  dismiss(id);
  toast.action.onAction();
}

function clear(): void {
  for (const t of [...queue]) dismiss(t.id);
}

/** What `useToast()` hands back. */
export interface ToastApi {
  /** Queue a message; returns its id. */
  show: (message: string, options?: ToastOptions) => number;
  dismiss: (id: number) => void;
  clear: () => void;
  /** Stops a toast's countdown (the host does this on focus and hover). */
  pause: (id: number) => void;
  /** Restarts a paused countdown with the time it had left. */
  resume: (id: number) => void;
  /** Runs a toast's action, then closes it. */
  act: (id: number) => void;
  /** The messages on screen, oldest first. Read-only. */
  toasts: readonly Readonly<ToastMessage>[];
}

/** Show and dismiss transient messages; render them with one `UiToastHost`. */
export function useToast(): ToastApi {
  return { show, dismiss, clear, pause, resume, act, toasts: readonly(queue) as readonly Readonly<ToastMessage>[] };
}
