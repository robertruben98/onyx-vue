<script setup lang="ts">
import { computed, ref } from "vue";
import {
  UiCrtOverlay,
  UiDigitalRain,
  UiHudFrame,
  UiReadout,
  UiRunState,
  UiStateBar,
  UiTab,
  UiTabs,
  runStateNeedsAttention,
  runStateRank,
  type RunState,
} from "@onyx/vue";

/**
 * The run view of the OIDC bench, assembled from the library.
 *
 * The shape below is the runner's wire format: `oidc_e2e.py` emits one NDJSON
 * event per line and the browser polls for them. `valor` is the short reading
 * the runner emits alongside the prose — it is what lets a row be read without
 * opening anything, and it is the reason the list is one line per step instead
 * of a paragraph per step.
 */
interface Paso {
  id: string;
  titulo: string;
  estado: RunState;
  /** The short reading: `BYPASS`, `develop/main`, `1 clave en el JWKS`. */
  valor?: string;
  /** Full prose. Only ever read when someone opens the entry. */
  detalle: string;
  /** Free-form dict from the runner, rendered verbatim. */
  datos?: Record<string, string>;
  issue?: number;
}

/**
 * The first five are the real steps of the capture, with their own text. The
 * rest are filler so the console has the density of a real run — the titles are
 * plausible, the verdicts mean nothing.
 */
const PASOS: Paso[] = [
  {
    id: "descubrimiento",
    titulo: "Descubrimiento",
    estado: "ok",
    valor: "1 clave en el JWKS",
    detalle:
      "issuer https://tiendasopenidconnect.local.com/openid, 1 clave(s) en el JWKS",
    datos: {
      issuer: "https://tiendasopenidconnect.local.com/openid",
      claves: "1 (RS256, kid=a3f1…)",
    },
  },
  {
    id: "codigo_proveedor",
    titulo: "Que codigo corre en el proveedor",
    estado: "ok",
    valor: "develop/main",
    detalle:
      "no anuncia revocation_endpoint: codigo de la linea develop/main",
    datos: { ausentes: "revocation_endpoint, introspection_endpoint" },
  },
  {
    id: "cache_discovery",
    titulo: "Cache del documento de discovery",
    estado: "aviso",
    valor: "BYPASS",
    detalle:
      "las cabeceras estan pero el estado es BYPASS: la cache esta apagada (USE_CACHE=False) o el backend no responde. El documento se sirve construido en cada peticion, asi que el ahorro del issue #111 no esta ocurriendo. En el contenedor es lo esperable mientras no reciba MEMCACHED_LOCATION.",
    datos: {
      "x-cache-status": "BYPASS",
      "cache-control": "max-age=3600, public",
      USE_CACHE: "False",
      MEMCACHED_LOCATION: "(sin definir)",
    },
    issue: 111,
  },
  {
    id: "cookie_discovery",
    titulo: "Cookie de sesion en el discovery cacheable",
    estado: "ok",
    valor: "sin op_browser_state",
    detalle: "el discovery no manda op_browser_state",
    datos: { "set-cookie": "(ninguna)" },
  },
  {
    id: "confirmacion_next",
    titulo: "Confirmacion de cuenta: `next` que no resuelve",
    estado: "defecto",
    valor: "302 → /",
    detalle:
      "el enlace de confirmacion acepta un next que no corresponde a ninguna ruta registrada y redirige a la raiz en silencio, asi que el usuario termina fuera del flujo sin saber por que.",
    datos: {
      peticion: "GET /openid/confirmar/?next=/cuenta/preferencias",
      respuesta: "302 Location: /",
      resolver: "NoReverseMatch (silenciada)",
    },
  },
  { id: "rsa", titulo: "Rotacion de claves RSA", estado: "defecto", valor: "412 d sin rotar", detalle: "la clave activa del JWKS no se ha rotado desde hace 412 dias." },
  { id: "pkce", titulo: "PKCE obligatorio en clientes publicos", estado: "defecto", valor: "3 sin PKCE", detalle: "3 clientes publicos aceptan el flujo de codigo sin code_challenge." },
  { id: "pwd", titulo: "Longitud minima de contrasena", estado: "defecto", valor: "6 caracteres", detalle: "el formulario de registro admite 6 caracteres." },
  { id: "refresh", titulo: "Caducidad del refresh token", estado: "fallo", valor: "sin limite", detalle: "el refresh token se emite sin caducidad absoluta y la rotacion esta desactivada." },
  { id: "referrer", titulo: "Cabecera Referrer-Policy en el login", estado: "aviso", valor: "ausente", detalle: "la respuesta del login no manda Referrer-Policy." },
  { id: "introspect", titulo: "Reintentos del endpoint de introspeccion", estado: "aviso", valor: "sin backoff", detalle: "los reintentos salen sin espera entre ellos." },
  { id: "samesite", titulo: "Cookie op_browser_state con SameSite", estado: "arreglado", valor: "issue #129", detalle: "estaba sin SameSite y ya lo lleva.", issue: 129 },
  { id: "logging", titulo: "Logging del login configurable", estado: "arreglado", valor: "issue #116", detalle: "el nivel del logging del login ya se configura.", issue: 116 },
  { id: "version", titulo: "Version del proveedor", estado: "info", valor: "1.9.2", detalle: "version desplegada del fork." },
  { id: "carga", titulo: "Prueba de carga del token endpoint", estado: "omitido", valor: "requiere VPN", detalle: "no se pudo concluir: el escenario necesita VPN." },
  { id: "correo", titulo: "Verificacion del correo saliente", estado: "omitido", valor: "sin SMTP", detalle: "no se pudo concluir: no hay SMTP en este entorno." },
  { id: "consent", titulo: "Consentimiento por tenant", estado: "omitido", valor: "sin datos", detalle: "no se pudo concluir: faltan datos de tenant." },
  { id: "federacion", titulo: "Federacion con el IdP externo", estado: "omitido", valor: "desactivada", detalle: "no se pudo concluir: la federacion esta desactivada." },
  { id: "backchannel", titulo: "Backchannel logout", estado: "omitido", valor: "no anunciado", detalle: "no se pudo concluir: el proveedor no lo anuncia." },
];

/** Filler so the counts match a 35-step run without inventing 16 findings. */
for (let i = 1; i <= 16; i++) {
  PASOS.push({
    id: `rutina_${i}`,
    titulo: `Comprobacion rutinaria ${i}`,
    estado: "ok",
    valor: "sin novedad",
    detalle: "paso de rutina.",
  });
}

/**
 * Steps the run will have when it finishes. Above the 35 already recorded, so
 * the view shows a run IN FLIGHT: the header says EJECUTANDO, the percentage is
 * under 100 and the bar keeps a gap on the right for what has not happened yet.
 * With TOTAL === recorded the gap never appears and the demo cannot show it.
 */
const TOTAL = 40;

const counts = computed(() => {
  const acc: Partial<Record<RunState, number>> = {};
  for (const p of PASOS) acc[p.estado] = (acc[p.estado] ?? 0) + 1;
  return acc;
});

const hechos = computed(() => PASOS.length);
const pct = computed(() => Math.round((hechos.value / TOTAL) * 100));

/**
 * The console tabs.
 *
 * Only what a reader has to act on, which is what was asked for — but
 * `omitido` earns a tab of its own even though it is not an error. It means the
 * step could not conclude, and an unanswered question is not the same as a
 * clean run. Leaving it out of the console would bury the one state that says
 * "nobody knows".
 */
const PESTANAS: { estado: RunState; label: string }[] = [
  { estado: "fallo", label: "Fallos" },
  { estado: "defecto", label: "Defectos" },
  { estado: "aviso", label: "Avisos" },
  { estado: "omitido", label: "Sin concluir" },
];

function pasosDe(estado: RunState): Paso[] {
  return PASOS.filter((p) => p.estado === estado).sort(
    (a, b) => runStateRank(a.estado) - runStateRank(b.estado),
  );
}

/** Open entries, by step id. The first of each tab opens on arrival. */
const abiertos = ref(new Set<string>(["refresh"]));

function alternar(id: string) {
  const next = new Set(abiertos.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  abiertos.value = next;
}

const atencion = computed(
  () => PASOS.filter((p) => runStateNeedsAttention(p.estado)).length,
);
const arreglados = computed(() => counts.value.arreglado ?? 0);
</script>

<template>
  <UiDigitalRain :opacity="0.18" />
  <UiCrtOverlay />

  <div class="run">
    <header class="run__head">
      <div>
        <p class="run__eyebrow">Banco de pruebas OIDC</p>
        <h1 class="run__host">tiendasopenidconnect.local.com</h1>
      </div>
      <p class="run__stamp">
        <span class="run__live">EJECUTANDO</span> · 11-09-2026 17:42:05
      </p>
    </header>

    <div class="run__grid">
      <UiHudFrame title="Progreso">
        <template #meta>{{ hechos }} de {{ TOTAL }} pasos</template>

        <div class="run__progress">
          <div class="run__pct">
            <UiReadout
              label="Completado"
              :value="pct"
              unit="%"
              class="run__pct-readout"
            />
            <UiReadout
              label="Piden atencion"
              :value="atencion"
              :tone="atencion > 0 ? 'danger' : 'success'"
            />
            <UiReadout
              label="Arreglados"
              :value="arreglados"
              :tone="arreglados > 0 ? 'success' : 'muted'"
            />
          </div>

          <UiStateBar :counts="counts" :total="TOTAL" label="Ejecucion" />

          <div class="run__readouts">
            <UiReadout label="Tiempo" value="6.0" unit="s" />
            <UiReadout label="Eventos" :value="38" />
            <UiReadout label="Claves JWKS" value="1" />
            <UiReadout label="Cache" value="BYPASS" tone="warning" />
          </div>
        </div>
      </UiHudFrame>

      <UiHudFrame title="Consola">
        <template #meta>solo lo que hay que mirar</template>

        <UiTabs aria-label="Resultados por estado">
          <UiTab
            v-for="t in PESTANAS"
            :key="t.estado"
            :label="`${t.label} ${pasosDe(t.estado).length}`"
          >
            <ol class="term" :aria-label="t.label">
              <li v-for="p in pasosDe(t.estado)" :key="p.id" class="term__row">
                <button
                  type="button"
                  class="term__line"
                  :aria-expanded="abiertos.has(p.id)"
                  @click="alternar(p.id)"
                >
                  <span class="term__ts">17:42:0{{ (p.id.length % 9) + 1 }}</span>
                  <UiRunState :state="p.estado" />
                  <span class="term__titulo">{{ p.titulo }}</span>
                  <span v-if="p.valor" class="term__valor">{{ p.valor }}</span>
                  <span class="term__caret" aria-hidden="true">{{
                    abiertos.has(p.id) ? "▾" : "▸"
                  }}</span>
                </button>

                <div v-if="abiertos.has(p.id)" class="term__detalle">
                  <p class="term__prosa">{{ p.detalle }}</p>
                  <p v-if="p.issue" class="term__issue">issue #{{ p.issue }}</p>
                  <dl v-if="p.datos" class="term__datos">
                    <template v-for="(v, k) in p.datos" :key="k">
                      <dt>{{ k }}</dt>
                      <dd>{{ v }}</dd>
                    </template>
                  </dl>
                </div>
              </li>
              <li v-if="!pasosDe(t.estado).length" class="term__vacio">
                Nada en {{ t.label.toLowerCase() }}.
              </li>
            </ol>
          </UiTab>
        </UiTabs>
      </UiHudFrame>
    </div>

    <p class="run__nota">
      Los cinco primeros pasos son los de la captura del banco, con su texto
      literal; el resto es relleno para ver la densidad. Los diecinueve
      <code>ok</code> no aparecen en la consola a proposito: un paso que pasa no
      es informacion.
    </p>
  </div>
</template>

<style scoped>
/* Chrome of this page only. Everything that could be reused lives in the
   library; what is left here is layout. */
.run {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.run__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 18px;
}

.run__eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--ui-color-text-muted);
}

.run__host {
  margin: 0;
  font-family: var(--ui-font-family-display, inherit);
  font-size: clamp(20px, 3.4vw, 30px);
  font-weight: 400;
  color: var(--ui-color-primary);
  text-shadow: var(--ui-matrix-glow, none);
}

.run__stamp {
  margin: 0 0 0 auto;
  font-size: 11px;
  color: var(--ui-color-text-muted);
  letter-spacing: 0.08em;
}

.run__live {
  color: var(--ui-color-primary);
}
.run__live::before {
  content: "●";
  margin-right: 6px;
  font-size: 9px;
  vertical-align: 1px;
  animation: run-latido 1.6s steps(2, end) infinite;
}
@keyframes run-latido {
  0%,
  60% {
    opacity: 1;
  }
  61%,
  100% {
    opacity: 0.25;
  }
}

.run__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.run__progress {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.run__pct {
  display: flex;
  flex-wrap: wrap;
  gap: 26px;
  align-items: flex-end;
}

/* The one figure that gets to be large. The rest of the readouts stay at their
   default size, so there is a single focal point and not four. */
.run__pct-readout {
  --ui-readout-size: clamp(38px, 7vw, 58px);
}

.run__readouts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 1px;
  background: var(--ui-color-border);
  border: 1px solid var(--ui-color-border);
}
.run__readouts > * {
  background: var(--ui-color-surface);
  padding: 11px 12px;
}

/* --- consola ----------------------------------------------------------- */
.term {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 460px;
  overflow-y: auto;
}

.term__row {
  border-bottom: 1px solid var(--ui-color-border);
}

.term__line {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto 12px;
  align-items: baseline;
  gap: 9px;
  padding: 7px 4px;
  background: none;
  border: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.term__line:hover {
  background: var(--ui-color-surface-hover);
}
.term__line:focus-visible {
  outline: 2px solid var(--ui-focus-ring);
  outline-offset: -2px;
}

.term__ts {
  font-size: 11px;
  color: var(--ui-color-text-muted);
  font-variant-numeric: tabular-nums;
}

.term__titulo {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ui-color-text);
}
.term__line[aria-expanded="true"] .term__titulo {
  white-space: normal;
}

/* The short reading. This column is why a row does not need opening. */
.term__valor {
  font-size: 11.5px;
  color: var(--ui-color-primary);
  white-space: nowrap;
}

.term__caret {
  color: var(--ui-color-text-muted);
  font-size: 11px;
}

.term__detalle {
  padding: 2px 4px 12px 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.term__prosa {
  margin: 0;
  max-width: 66ch;
  color: var(--ui-color-text-muted);
  font-size: 12.5px;
}

.term__issue {
  margin: 0;
  font-size: 11px;
  color: var(--ui-color-info);
}

.term__datos {
  margin: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 2px 14px;
  padding: 9px 11px;
  background: var(--ui-color-neutral-surface);
  border-left: 2px solid var(--ui-color-border);
  font-size: 11.5px;
}
.term__datos dt {
  color: var(--ui-color-text-muted);
}
.term__datos dd {
  margin: 0;
  color: var(--ui-color-text);
  overflow-wrap: anywhere;
}

.term__vacio {
  padding: 22px 4px;
  color: var(--ui-color-text-muted);
  font-size: 12.5px;
}

.run__nota {
  margin: 0;
  font-size: 11.5px;
  color: var(--ui-color-text-muted);
  border-left: 1px solid var(--ui-color-border);
  padding-left: 10px;
  max-width: 74ch;
}

@media (max-width: 900px) {
  .run__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
