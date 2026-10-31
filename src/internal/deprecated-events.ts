import { getCurrentInstance, onBeforeUpdate } from "vue";
import { DEPRECATED_EVENTS, type DeprecatedEvent } from "../deprecations";
import { warnDeprecated } from "./deprecation-warning";

/** Inspect subscriptions, including .once, without waiting for an emission. */
export function useDeprecatedEvents() {
  if (import.meta.env.DEV) {
    const instance = getCurrentInstance();
    if (!instance) return;
    const emits = instance.type.emits ?? [];
    const names = Object.keys(DEPRECATED_EVENTS).filter((name) =>
      Array.isArray(emits) ? emits.includes(name) : Object.prototype.hasOwnProperty.call(emits, name),
    ) as DeprecatedEvent[];
    const check = () => {
      const props = instance.vnode.props;
      if (!props) return;
      for (const name of names) {
        const handler = `on${name[0].toUpperCase()}${name.slice(1)}`;
        if (props[handler] || props[`${handler}Once`]) {
          warnDeprecated("event", name, DEPRECATED_EVENTS[name]);
        }
      }
    };
    check();
    onBeforeUpdate(check);
  }
}
