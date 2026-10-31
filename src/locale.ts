import { inject, provide, type App, type InjectionKey } from "vue";

/** Default text catalog. Placeholder tokens (such as {n}) must be preserved. */
export interface OnyxMessages {
  spinnerLabel: string;
  diffViewLabel: string;
  diffViewEmptyText: string;
  diffViewBinaryText: string;
  bulkBarConfirmLabel: string;
  bulkBarCancelLabel: string;
  stepperLabel: string;
  breadcrumbLabel: string;
  barListTableSummary: string;
  drawerCloseLabel: string;
  dialogCloseLabel: string;
  dataTableEmptyText: string;
  alertDismissLabel: string;
  confirmButtonConfirmLabel: string;
  confirmButtonArmedHint: string;
  selectPlaceholder: string;
  timelineLabel: string;
  timelineEmptyText: string;
  appBarMenuLabel: string;
  courseSwitcherTilesLabel: string;
  profileHeaderStatsLabel: string;
  navRailLabel: string;
  logLinesEmptyText: string;
  logLinesLabel: string;
  tabBarMoreLabel: string;
  tabBarLabel: string;
  tabBarLiveLabel: string;
  toastHostDismissLabel: string;
  panelEmptyText: string;
  barChartTableSummary: string;
  sequenceGridItemLabel: string;
  sequenceGridPresentLabel: string;
  sequenceGridMissingLabel: string;
  appShellLabel: string;
  recordButtonLabel: string;
  skeletonLabel: string;
  tagRemoveLabel: string;
  kpiStripLabel: string;
  filterBarSearchPlaceholder: string;
  filterBarSearchLabel: string;
  filterBarLabel: string;
  paginationLabel: string;
  stateBarLabel: string;
  keyHintsLabel: string;
  ansiTerminalLabel: string;
  relativeTimeUnits: { "minute": string; "hour": string; "day": string; "month": string };
  metricChipDeltaLabels: { "up": string; "down": string; "same": string };
  countdownUnitLabels: { "days": { "short": string; "one": string; "other": string }; "hours": { "short": string; "one": string; "other": string }; "minutes": { "short": string; "one": string; "other": string }; "seconds": { "short": string; "one": string; "other": string } };
  stepperStateLabels: { "done": string; "active": string; "warn": string; "error": string; "pending": string; "skipped": string };
  statCardTrends: { "up": string; "down": string; "flat": string };
  countdownConjunction: string;
  previousPage: string;
  nextPage: string;
  page: string;
  selectAllRows: string;
  selectRow: string;
  loadingEllipsis: string;
  rowsPerPage: string;
  captionRows: string;
  rows: string;
  metricChipFailed: string;
  triStateLoading: string;
  triStateUnrequested: string;
  chartTableSummary: string;
  stateBarPending: string;
  stateBarSummary: string;
  bulkBarNoun: [string, string];
  barListTableHeaders: [string, string];
  barChartCategoryHeader: string;
  heatStripLabel: string;
  sparkBarsLabel: string;
  heatStripSummary: string;
  diffViewStats: string;
  sequenceGridSummary: string;
  loadMoreRowLabel: string;
  blockMeterValue: string;
  checkRowStates: { "pending": string; "running": string; "done": string; "failed": string };
  runStateLabels: { "ok": string; "arreglado": string; "defecto": string; "fallo": string; "aviso": string; "omitido": string; "info": string };
  severityLabels: { "critical": string; "very-high": string; "high": string; "moderate": string; "medium": string; "low": string; "very-low": string; "unknown": string };
}

export const DEFAULT_MESSAGES: OnyxMessages = {
  "spinnerLabel": "Loading",
  "diffViewLabel": "Diff",
  "diffViewEmptyText": "No changes",
  "diffViewBinaryText": "Binary file",
  "bulkBarConfirmLabel": "confirm",
  "bulkBarCancelLabel": "cancel",
  "stepperLabel": "Steps",
  "breadcrumbLabel": "Breadcrumb",
  "barListTableSummary": "data",
  "drawerCloseLabel": "Close",
  "dialogCloseLabel": "Close",
  "dataTableEmptyText": "No data",
  "alertDismissLabel": "Dismiss",
  "confirmButtonConfirmLabel": "confirm?",
  "confirmButtonArmedHint": "press again to confirm",
  "selectPlaceholder": "Select…",
  "timelineLabel": "History",
  "timelineEmptyText": "Nothing has happened yet",
  "appBarMenuLabel": "Menu",
  "courseSwitcherTilesLabel": "Courses",
  "profileHeaderStatsLabel": "Stats",
  "navRailLabel": "Sections",
  "logLinesEmptyText": "(no activity recorded)",
  "logLinesLabel": "Activity",
  "tabBarMoreLabel": "More",
  "tabBarLabel": "Main",
  "tabBarLiveLabel": "running",
  "toastHostDismissLabel": "Dismiss",
  "panelEmptyText": "Nothing here.",
  "barChartTableSummary": "data",
  "sequenceGridItemLabel": "Item",
  "sequenceGridPresentLabel": "present",
  "sequenceGridMissingLabel": "missing",
  "appShellLabel": "Navigation",
  "recordButtonLabel": "Record",
  "skeletonLabel": "Loading…",
  "tagRemoveLabel": "Remove",
  "kpiStripLabel": "Summary",
  "filterBarSearchPlaceholder": "filter",
  "filterBarSearchLabel": "Filter",
  "filterBarLabel": "Filters",
  "paginationLabel": "Pagination",
  "stateBarLabel": "Run progress",
  "keyHintsLabel": "Keyboard shortcuts",
  "ansiTerminalLabel": "Terminal output",
  "relativeTimeUnits": {
    "minute": "m",
    "hour": "h",
    "day": "d",
    "month": "mo"
  },
  "metricChipDeltaLabels": {
    "up": "up {n}",
    "down": "down {n}",
    "same": "unchanged"
  },
  "countdownUnitLabels": {
    "days": {
      "short": "d",
      "one": "day",
      "other": "days"
    },
    "hours": {
      "short": "h",
      "one": "hour",
      "other": "hours"
    },
    "minutes": {
      "short": "min",
      "one": "minute",
      "other": "minutes"
    },
    "seconds": {
      "short": "s",
      "one": "second",
      "other": "seconds"
    }
  },
  "stepperStateLabels": {
    "done": "done",
    "active": "in progress",
    "warn": "warning",
    "error": "failed",
    "pending": "pending",
    "skipped": "skipped"
  },
  "statCardTrends": {
    "up": "Up",
    "down": "Down",
    "flat": "No change"
  },
  "countdownConjunction": "and",
  "previousPage": "Previous page",
  "nextPage": "Next page",
  "page": "Page {page}",
  "selectAllRows": "Select all rows",
  "selectRow": "Select row",
  "loadingEllipsis": "Loading…",
  "rowsPerPage": "Rows per page",
  "captionRows": "{caption}, rows",
  "rows": "Rows",
  "metricChipFailed": "{label}: failed",
  "triStateLoading": "loading",
  "triStateUnrequested": "not requested",
  "chartTableSummary": "data",
  "stateBarPending": "{n} pending",
  "stateBarSummary": "{label}: {done} of {total}. {states}.",
  "bulkBarNoun": [
    "selected",
    "selected"
  ],
  "barListTableHeaders": [
    "category",
    "value"
  ],
  "barChartCategoryHeader": "category",
  "heatStripLabel": "activity",
  "sparkBarsLabel": "series",
  "heatStripSummary": "{label}: {total} across {count} buckets, peak {peak}",
  "diffViewStats": "{added} added, {removed} removed",
  "sequenceGridSummary": "{label}{present} of {total} {state}",
  "loadMoreRowLabel": "show the remaining {n}",
  "blockMeterValue": "{value} of {max}",
  "checkRowStates": {
    "pending": "pending",
    "running": "running",
    "done": "done",
    "failed": "failed"
  },
  "runStateLabels": {
    "ok": "ok",
    "arreglado": "arreglado",
    "defecto": "defecto",
    "fallo": "fallo",
    "aviso": "aviso",
    "omitido": "omitido",
    "info": "info"
  },
  "severityLabels": {
    "critical": "critical",
    "very-high": "very-high",
    "high": "high",
    "moderate": "moderate",
    "medium": "medium",
    "low": "low",
    "very-low": "very-low",
    "unknown": "unknown"
  }
};

export const ES_MESSAGES: OnyxMessages = {
  "spinnerLabel": "Cargando",
  "diffViewLabel": "Diferencias",
  "diffViewEmptyText": "Sin cambios",
  "diffViewBinaryText": "Archivo binario",
  "bulkBarConfirmLabel": "confirmar",
  "bulkBarCancelLabel": "cancelar",
  "stepperLabel": "Pasos",
  "breadcrumbLabel": "Ruta de navegación",
  "barListTableSummary": "datos",
  "drawerCloseLabel": "Cerrar",
  "dialogCloseLabel": "Cerrar",
  "dataTableEmptyText": "Sin datos",
  "alertDismissLabel": "Descartar",
  "confirmButtonConfirmLabel": "¿confirmar?",
  "confirmButtonArmedHint": "pulsa otra vez para confirmar",
  "selectPlaceholder": "Selecciona…",
  "timelineLabel": "Historial",
  "timelineEmptyText": "Todavía no ha ocurrido nada",
  "appBarMenuLabel": "Menú",
  "courseSwitcherTilesLabel": "Cursos",
  "profileHeaderStatsLabel": "Estadísticas",
  "navRailLabel": "Secciones",
  "logLinesEmptyText": "(sin actividad registrada)",
  "logLinesLabel": "Actividad",
  "tabBarMoreLabel": "Más",
  "tabBarLabel": "Principal",
  "tabBarLiveLabel": "en curso",
  "toastHostDismissLabel": "Descartar",
  "panelEmptyText": "No hay nada aquí.",
  "barChartTableSummary": "datos",
  "sequenceGridItemLabel": "Elemento",
  "sequenceGridPresentLabel": "presente",
  "sequenceGridMissingLabel": "ausente",
  "appShellLabel": "Navegación",
  "recordButtonLabel": "Grabar",
  "skeletonLabel": "Cargando…",
  "tagRemoveLabel": "Eliminar",
  "kpiStripLabel": "Resumen",
  "filterBarSearchPlaceholder": "filtrar",
  "filterBarSearchLabel": "Filtrar",
  "filterBarLabel": "Filtros",
  "paginationLabel": "Paginación",
  "stateBarLabel": "Progreso de la ejecución",
  "keyHintsLabel": "Atajos de teclado",
  "ansiTerminalLabel": "Salida del terminal",
  "relativeTimeUnits": {
    "minute": "min",
    "hour": "h",
    "day": "d",
    "month": "mes"
  },
  "metricChipDeltaLabels": {
    "up": "sube {n}",
    "down": "baja {n}",
    "same": "sin cambios"
  },
  "countdownUnitLabels": {
    "days": {
      "short": "d",
      "one": "día",
      "other": "días"
    },
    "hours": {
      "short": "h",
      "one": "hora",
      "other": "horas"
    },
    "minutes": {
      "short": "min",
      "one": "minuto",
      "other": "minutos"
    },
    "seconds": {
      "short": "s",
      "one": "segundo",
      "other": "segundos"
    }
  },
  "stepperStateLabels": {
    "done": "completado",
    "active": "en curso",
    "warn": "advertencia",
    "error": "fallido",
    "pending": "pendiente",
    "skipped": "omitido"
  },
  "statCardTrends": {
    "up": "Sube",
    "down": "Baja",
    "flat": "Sin cambios"
  },
  "countdownConjunction": "y",
  "previousPage": "Página anterior",
  "nextPage": "Página siguiente",
  "page": "Página {page}",
  "selectAllRows": "Seleccionar todas las filas",
  "selectRow": "Seleccionar fila",
  "loadingEllipsis": "Cargando…",
  "rowsPerPage": "Filas por página",
  "captionRows": "{caption}, filas",
  "rows": "Filas",
  "metricChipFailed": "{label}: fallido",
  "triStateLoading": "cargando",
  "triStateUnrequested": "no solicitado",
  "chartTableSummary": "datos",
  "stateBarPending": "{n} pendientes",
  "stateBarSummary": "{label}: {done} de {total}. {states}.",
  "bulkBarNoun": [
    "seleccionado",
    "seleccionados"
  ],
  "barListTableHeaders": [
    "categoría",
    "valor"
  ],
  "barChartCategoryHeader": "categoría",
  "heatStripLabel": "actividad",
  "sparkBarsLabel": "serie",
  "heatStripSummary": "{label}: {total} en {count} intervalos, máximo {peak}",
  "diffViewStats": "{added} añadidas, {removed} eliminadas",
  "sequenceGridSummary": "{label}{present} de {total} {state}",
  "loadMoreRowLabel": "mostrar los {n} restantes",
  "blockMeterValue": "{value} de {max}",
  "checkRowStates": {
    "pending": "pendiente",
    "running": "en curso",
    "done": "completado",
    "failed": "fallido"
  },
  "runStateLabels": {
    "ok": "correcto",
    "arreglado": "arreglado",
    "defecto": "defecto",
    "fallo": "fallo",
    "aviso": "aviso",
    "omitido": "omitido",
    "info": "información"
  },
  "severityLabels": {
    "critical": "crítica",
    "very-high": "muy alta",
    "high": "alta",
    "moderate": "moderada",
    "medium": "media",
    "low": "baja",
    "very-low": "muy baja",
    "unknown": "desconocida"
  }
};

const localeKey: InjectionKey<OnyxMessages> = Symbol("onyx-locale");

/** Call in a root/ancestor setup, or pass an app before mounting it. */
export function provideOnyxLocale(messages: OnyxMessages, app?: App): void {
  if (app) app.provide(localeKey, messages);
  else provide(localeKey, messages);
}

/** @internal Also called by Vue prop default factories, which support inject. */
export function useOnyxLocale(): OnyxMessages {
  return inject(localeKey, DEFAULT_MESSAGES);
}
