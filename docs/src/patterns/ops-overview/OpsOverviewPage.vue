<script setup lang="ts">
import { computed, ref } from "vue";
import {
  UiAlert,
  UiAppBar,
  UiAppShell,
  UiBarChart,
  UiBarList,
  UiButton,
  UiDataTable,
  UiFilterBar,
  UiFilterChip,
  UiHeatStrip,
  UiKpiStrip,
  UiLogLines,
  UiNavRail,
  UiNavRailGroup,
  UiNavRailItem,
  UiPanel,
  UiRelativeTime,
  UiStatusDot,
  UiTag,
  type DataTableColumn,
  type FilterChipTone,
  type KpiItem,
  type StatusDotState,
} from "@onyx/vue";
import {
  ACTIVITY,
  ERROR_BUDGET,
  INCIDENTS_90D,
  NOW,
  SERVICES,
  TRAFFIC_24H,
  TRAFFIC_SERIES,
  incidentDay,
  type Health,
  type Service,
} from "./fixtures";

/**
 * The operations overview of one production environment.
 *
 * Reading order is the on-call's: is anything on fire (the alert), how is the
 * whole thing doing (the KPIs), which service (the table), and what changed
 * (the activity log). The table gets the full width because it is the thing
 * acted on; the charts under it are context.
 */

const DOT: Record<Health, StatusDotState> = {
  healthy: "live",
  degraded: "warn",
  down: "dead",
};

const CHIPS: { health: Health; label: string; tone: FilterChipTone }[] = [
  { health: "healthy", label: "Healthy", tone: "ok" },
  { health: "degraded", label: "Degraded", tone: "warn" },
  { health: "down", label: "Down", tone: "danger" },
];

const search = ref("");
const health = ref<Health | null>(null);
const refreshing = ref(false);

const countOf = (h: Health) => SERVICES.filter((s) => s.health === h).length;
const down = SERVICES.filter((s) => s.health === "down");

const rows = computed(() => {
  const q = search.value.trim().toLowerCase();
  return SERVICES.filter(
    (s) =>
      (health.value === null || s.health === health.value) &&
      (q === "" || s.name.includes(q) || s.team.includes(q)),
  );
});

// Service takes twice Team's share of what the fixed columns leave. The fixed
// ones are kept narrow on purpose: `hideBelow` reads the viewport, not the
// table, so the table must hold every column at the narrowest width at which
// they are all shown (900 px), or the 1fr tracks collapse to 0.
const columns: DataTableColumn<Service>[] = [
  { id: "name", header: "Service", field: "name", sortable: true, width: "minmax(0, 2fr)" },
  { id: "version", header: "Version", field: "version", width: "8rem" },
  { id: "team", header: "Team", field: "team", hideBelow: 900 },
  { id: "p95", header: "p95", field: "p95", align: "end", sortable: true, width: "5.5rem" },
  {
    id: "errors",
    header: "5xx",
    value: (s) => s.errorRate,
    align: "end",
    sortable: true,
    width: "5rem",
  },
  {
    id: "deployed",
    header: "Deployed",
    field: "deployedAt",
    sortable: true,
    width: "7.5rem",
    hideBelow: 700,
  },
];

const kpis = computed<KpiItem[]>(() => {
  const rpm = SERVICES.reduce((n, s) => n + s.rpm, 0);
  const errors = SERVICES.reduce((n, s) => n + s.rpm * s.errorRate, 0) / rpm;
  const attention = SERVICES.length - countOf("healthy");
  return [
    { label: "Requests / min", value: `${(rpm / 1000).toFixed(1)}k`, sub: "all services" },
    {
      label: "5xx rate",
      value: `${(errors * 100).toFixed(2)}%`,
      sub: "weighted by traffic",
      tone: errors > 0.005 ? "warning" : "success",
    },
    { label: "Uptime, 30 days", value: "99.96%", sub: "SLO 99.9%", tone: "success" },
    {
      label: "Need a look",
      value: attention,
      sub: `of ${SERVICES.length} services`,
      tone: attention > 0 ? "danger" : "success",
    },
  ];
});

function toggleHealth(h: Health, pressed: boolean) {
  health.value = pressed ? h : null;
}

function refresh() {
  refreshing.value = true;
  setTimeout(() => (refreshing.value = false), 900);
}
</script>

<template>
  <UiAppShell label="Acme Cloud">
    <template #rail>
      <UiNavRail label="Main">
        <UiNavRailItem label="Overview" active />
        <UiNavRailItem label="Services" :count="SERVICES.length" />
        <UiNavRailItem label="Incidents" :count="down.length" count-tone="danger" />
        <UiNavRailItem label="Deploys" :count="ACTIVITY.length" />
        <UiNavRailGroup label="Environments">
          <UiNavRailItem label="production" active />
          <UiNavRailItem label="staging" />
        </UiNavRailGroup>
      </UiNavRail>
    </template>

    <UiAppBar eyebrow="Acme Cloud" title="Operations" subtitle="production · eu-west-1, eu-central-1">
      <template #status>
        <UiStatusDot state="warn" label="Degraded" />
        <span class="ops__muted">
          {{ countOf("healthy") }} of {{ SERVICES.length }} healthy
        </span>
      </template>
      <template #actions>
        <UiButton variant="secondary" size="sm" :loading="refreshing" @clicked="refresh">
          Refresh
        </UiButton>
      </template>
    </UiAppBar>

    <div class="ops">
      <UiAlert
        v-if="down.length"
        variant="danger"
        :title="`${down[0].name} is down`"
      >
        Health checks fail in every zone since 09:42; a rollback to v7.2.4 is in
        progress.
        <template #action>
          <UiButton variant="secondary" size="sm" @clicked="health = 'down'">
            Show affected
          </UiButton>
        </template>
      </UiAlert>

      <UiKpiStrip :items="kpis" label="Environment health" />

      <UiPanel title="Services" :count="rows.length">
        <template #controls>
          <UiFilterBar
            v-model:search="search"
            search-placeholder="Filter by service or team"
            search-label="Filter services"
            label="Service filters"
          >
            <UiFilterChip
              v-for="c in CHIPS"
              :key="c.health"
              :label="c.label"
              :count="countOf(c.health)"
              :tone="c.tone"
              :pressed="health === c.health"
              @toggled="toggleHealth(c.health, $event)"
            />
          </UiFilterBar>
        </template>

        <UiDataTable
          :columns="columns"
          :rows="rows"
          row-key="name"
          caption="Services"
          :loading="refreshing"
          empty-text="No service matches the filters."
        >
          <template #cell-name="{ row }">
            <span class="ops__service">
              <UiStatusDot :state="DOT[row.health]" :label="row.health" />
              {{ row.name }}
            </span>
          </template>
          <template #cell-version="{ row }">
            <UiTag
              appearance="outline"
              :variant="row.version.includes('-') ? 'warning' : 'neutral'"
            >
              {{ row.version }}
            </UiTag>
          </template>
          <template #cell-p95="{ row }">{{ row.p95 }} ms</template>
          <template #cell-errors="{ row }">
            {{ (row.errorRate * 100).toFixed(2) }}%
          </template>
          <template #cell-deployed="{ row }">
            <UiRelativeTime :date="row.deployedAt" :now="NOW" :stale-after-days="30" />
          </template>
        </UiDataTable>
      </UiPanel>

      <div class="ops__context">
        <UiPanel title="Traffic" count="last 24 h">
          <UiBarChart
            :series="TRAFFIC_SERIES"
            :points="TRAFFIC_24H"
            label="Requests per hour"
            :height="140"
            :show-legend="false"
            :value-format="(n: number) => `${Math.round(n / 1000)}k`"
            category-header="hour"
            table-summary="see the hours"
          />
        </UiPanel>

        <UiPanel title="Error budget spent" count="30 days">
          <UiBarList :items="ERROR_BUDGET" label="Error budget spent" :max="100" />
        </UiPanel>

        <UiPanel title="Incidents" count="90 days">
          <UiHeatStrip
            :values="INCIDENTS_90D"
            :levels="3"
            label="Incidents per day"
            legend="90 days ago · today"
            :bucket-label="(i: number, n: number) => `${incidentDay(i)}: ${n} incidents`"
          />
        </UiPanel>
      </div>

      <UiPanel title="Activity" count="today">
        <UiLogLines :lines="ACTIVITY" label="Today's activity" />
      </UiPanel>
    </div>
  </UiAppShell>
</template>

<style scoped>
.ops {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}
.ops__context {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 16px;
  align-items: start;
}
.ops__service {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ops__muted {
  color: var(--ui-color-text-muted);
  font-size: 0.875rem;
}
</style>
