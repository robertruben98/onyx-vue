/**
 * Eventos renombrados: nombre antiguo -> nombre nuevo.
 *
 * La convencion de la libreria es que un evento dice lo que YA paso, en
 * participio (`clicked`, `toggled`, `selected`), o es el `update:*` de un
 * v-model. Doce eventos no la seguian. Desde 0.2 cada componente emite el
 * nombre nuevo y, justo despues, el antiguo, para no romper a quien ya lo
 * escucha; los antiguos se retiran en 1.0.
 *
 * Lo lee el scorecard (`scorecard/score.mjs`, aspecto API): un nombre antiguo
 * solo se admite si esta aqui y su componente emite tambien el nuevo.
 */
export const DEPRECATED_EVENTS = {
  checkedChange: "checkedChanged",
  valueChange: "valueChanged",
  change: "changed",
  toggle: "toggled",
  itemSelect: "itemSelected",
  loadMore: "loadMoreRequested",
  primaryAction: "primaryClicked",
  secondaryAction: "secondaryClicked",
} as const;

export type DeprecatedEvent = keyof typeof DEPRECATED_EVENTS;
