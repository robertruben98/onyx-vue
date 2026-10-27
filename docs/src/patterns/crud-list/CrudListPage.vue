<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
  UiAppBar,
  UiAvatar,
  UiBadge,
  UiBulkBar,
  UiButton,
  UiConfirmButton,
  UiDataTable,
  UiDateInput,
  UiDescriptionList,
  UiDrawer,
  UiEmptyState,
  UiFilterBar,
  UiFilterChip,
  UiFormField,
  UiInput,
  UiKpiStrip,
  UiPanel,
  UiRelativeTime,
  UiSegmented,
  UiSelect,
  UiStack,
  UiSwitch,
  UiTag,
  UiTextarea,
  UiToastHost,
  useToast,
  type BadgeVariant,
  type DataTableColumn,
  type DescriptionItem,
  type FilterChipTone,
  type KpiItem,
  type RowKey,
} from "@onyx/vue";
import { CUSTOMERS, NOW, PLAN_LABEL, STATUS_LABEL, type Customer, type Plan, type Status } from "./fixtures";

/**
 * Customers of a billing account: find one, open it, edit it, or act on many
 * at once. Everything is local: the page edits a copy of the fixtures.
 */

const customers = ref<Customer[]>(CUSTOMERS.map((c) => ({ ...c })));
const toast = useToast();

// --- Finding --------------------------------------------------------------
const search = ref("");
const status = ref<Status | null>(null);
const plan = ref<"all" | Plan>("all");

const PLAN_OPTIONS = [
  { value: "all", label: "All plans" },
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

const STATUS_CHIPS: { status: Status; tone: FilterChipTone }[] = [
  { status: "active", tone: "success" },
  { status: "trial", tone: "info" },
  { status: "suspended", tone: "warning" },
];

const rows = computed(() => {
  const q = search.value.trim().toLowerCase();
  return customers.value.filter(
    (c) =>
      (status.value === null || c.status === status.value) &&
      (plan.value === "all" || c.plan === plan.value) &&
      (q === "" || `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(q)),
  );
});

const countOf = (s: Status) => customers.value.filter((c) => c.status === s).length;

function clearFilters(): void {
  search.value = "";
  status.value = null;
  plan.value = "all";
}

const kpis = computed<KpiItem[]>(() => {
  const mrr = customers.value.reduce((n, c) => n + (c.status === "active" ? c.mrr : 0), 0);
  return [
    { label: "MRR", value: `€${mrr.toLocaleString("en")}`, sub: "active accounts" },
    { label: "Active", value: countOf("active"), sub: `of ${customers.value.length}`, tone: "success" },
    { label: "On trial", value: countOf("trial"), sub: "convert this week", tone: "muted" },
    { label: "Suspended", value: countOf("suspended"), sub: "payment failed", tone: countOf("suspended") ? "warning" : "success" },
  ];
});

// --- The table ------------------------------------------------------------
const BADGE: Record<Status, BadgeVariant> = { active: "success", trial: "info", suspended: "warning" };

const columns: DataTableColumn<Customer>[] = [
  { id: "name", header: "Customer", field: "name", sortable: true, width: "minmax(0, 2.2fr)" },
  { id: "plan", header: "Plan", field: "plan", sortable: true, width: "7.5rem", hideBelow: 640 },
  { id: "status", header: "Status", field: "status", width: "7rem" },
  { id: "mrr", header: "MRR", field: "mrr", align: "end", sortable: true, width: "6rem", hideBelow: 760 },
  { id: "signedUp", header: "Signed up", field: "signedUp", sortable: true, width: "8rem", hideBelow: 900 },
];

const selected = ref<Set<RowKey>>(new Set());
const askDelete = ref(false);

function selectedCustomers(): Customer[] {
  return customers.value.filter((c) => selected.value.has(c.id));
}

function suspendSelected(): void {
  const list = selectedCustomers();
  list.forEach((c) => (c.status = "suspended"));
  toast.show(`Suspended ${list.length} ${list.length === 1 ? "account" : "accounts"}`, { tone: "warning" });
  selected.value = new Set();
}

function deleteSelected(): void {
  const n = selected.value.size;
  customers.value = customers.value.filter((c) => !selected.value.has(c.id));
  selected.value = new Set();
  askDelete.value = false;
  toast.show(`Deleted ${n} ${n === 1 ? "account" : "accounts"}`, { tone: "danger" });
}

// --- The drawer: one customer, read and edited ----------------------------
const drawerOpen = ref(false);
const editing = ref<Customer | null>(null);
const draft = reactive({ name: "", email: "", plan: "free" as Plan, renewal: "", newsletter: true, notes: "" });
const errors = reactive({ name: "", email: "" });

const PLAN_SELECT = (Object.keys(PLAN_LABEL) as Plan[]).map((p) => ({ value: p, label: PLAN_LABEL[p] }));

const facts = computed<DescriptionItem[]>(() => {
  const c = editing.value;
  if (!c) return [];
  return [
    { term: "Company", value: c.company },
    { term: "Country", value: c.country },
    { term: "MRR", value: `€${c.mrr}` },
    { term: "Status", value: STATUS_LABEL[c.status], tone: c.status === "suspended" ? "warning" : "neutral" },
    { term: "Signed up", value: c.signedUp.slice(0, 10) },
  ];
});

function fill(c: Customer | null): void {
  draft.name = c?.name ?? "";
  draft.email = c?.email ?? "";
  draft.plan = c?.plan ?? "free";
  draft.renewal = c?.renewal ?? "";
  draft.newsletter = c?.newsletter ?? true;
  draft.notes = c?.notes ?? "";
  errors.name = "";
  errors.email = "";
}

function openEdit(c: Customer): void {
  editing.value = c;
  fill(c);
  drawerOpen.value = true;
}

function openCreate(): void {
  editing.value = null;
  fill(null);
  drawerOpen.value = true;
}

function validate(): boolean {
  errors.name = draft.name.trim() ? "" : "Give the customer a name.";
  errors.email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email) ? "" : "That is not an email address.";
  return !errors.name && !errors.email;
}

function save(): void {
  if (!validate()) return;
  if (editing.value) {
    Object.assign(editing.value, { ...draft });
    toast.show(`Saved ${draft.name}`, { tone: "success" });
  } else {
    const id = Math.max(0, ...customers.value.map((c) => c.id)) + 1;
    customers.value = [
      {
        id,
        ...draft,
        company: "—",
        status: "trial",
        mrr: 0,
        country: "—",
        signedUp: NOW.toISOString(),
      },
      ...customers.value,
    ];
    toast.show(`Added ${draft.name} on a trial`, { tone: "success" });
  }
  drawerOpen.value = false;
}

function deleteOne(): void {
  const c = editing.value;
  if (!c) return;
  customers.value = customers.value.filter((x) => x.id !== c.id);
  drawerOpen.value = false;
  toast.show(`Deleted ${c.name}`, { tone: "danger" });
}
</script>

<template>
  <div class="crud">
    <UiAppBar eyebrow="Acme Cloud · Billing" title="Customers" :subtitle="`${customers.length} accounts`">
      <template #actions>
        <UiButton size="sm" @clicked="openCreate">Add customer</UiButton>
      </template>
    </UiAppBar>

    <UiStack as="main" :gap="4" class="crud__body">
      <UiKpiStrip :items="kpis" label="Billing summary" />

      <UiPanel title="Accounts" :count="rows.length">
        <template #controls>
          <UiStack direction="horizontal" align="center" :gap="3" wrap>
            <UiFilterBar
              v-model:search="search"
              search-placeholder="Name, email or company"
              search-label="Find a customer"
              label="Customer filters"
            >
              <UiFilterChip
                v-for="c in STATUS_CHIPS"
                :key="c.status"
                :label="STATUS_LABEL[c.status]"
                :count="countOf(c.status)"
                :tone="c.tone"
                :pressed="status === c.status"
                @toggled="status = $event ? c.status : null"
              />
            </UiFilterBar>
            <UiSegmented v-model="plan" size="sm" aria-label="Plan" :options="PLAN_OPTIONS" />
          </UiStack>
        </template>

        <UiStack :gap="0">
          <UiBulkBar
            v-if="selected.size"
            :count="selected.size"
            :noun="['account selected', 'accounts selected']"
            :question="askDelete ? `Delete ${selected.size} for good?` : ''"
            confirm-label="Delete"
            cancel-label="Keep them"
            @confirmed="deleteSelected"
            @cancelled="askDelete = false"
          >
            <template #actions>
              <UiButton size="sm" variant="secondary" @clicked="suspendSelected">Suspend</UiButton>
              <UiButton size="sm" variant="danger" @clicked="askDelete = true">Delete</UiButton>
            </template>
          </UiBulkBar>

          <UiDataTable
            v-if="rows.length"
            v-model:selected="selected"
            :columns="columns"
            :rows="rows"
            row-key="id"
            caption="Customers"
            selectable="multiple"
            activatable
            @row-activated="openEdit"
          >
            <template #cell-name="{ row }">
              <UiStack direction="horizontal" align="center" :gap="2" class="crud__who">
                <UiAvatar :name="row.name" size="sm" />
                <span class="crud__who-text">
                  <span class="crud__who-name">{{ row.name }}</span>
                  <span class="crud__who-mail">{{ row.email }}</span>
                </span>
              </UiStack>
            </template>
            <template #cell-plan="{ row }">
              <UiTag :variant="row.plan === 'enterprise' ? 'info' : 'neutral'" appearance="outline">
                {{ PLAN_LABEL[row.plan] }}
              </UiTag>
            </template>
            <template #cell-status="{ row }">
              <UiBadge :variant="BADGE[row.status]">{{ STATUS_LABEL[row.status] }}</UiBadge>
            </template>
            <template #cell-mrr="{ row }">€{{ row.mrr.toLocaleString("en") }}</template>
            <template #cell-signedUp="{ row }">
              <UiRelativeTime :date="row.signedUp" :now="NOW" :stale-after-days="3650" />
            </template>
          </UiDataTable>

          <UiEmptyState v-else aria-label="No customers" @primary-clicked="clearFilters">
            <template #title>No customer matches</template>
            <template #description>Try another plan or status, or clear the search.</template>
            <template #primaryAction>Clear filters</template>
          </UiEmptyState>
        </UiStack>
      </UiPanel>
    </UiStack>

    <UiDrawer
      v-model:open="drawerOpen"
      :heading="editing ? editing.name : 'New customer'"
      :subheading="editing ? editing.email : 'Starts on a 14-day trial'"
    >
      <UiStack :gap="5">
        <UiDescriptionList v-if="editing" :items="facts" dense />

        <UiStack as="form" :gap="3" novalidate @submit.prevent="save">
          <UiFormField label="Name" required :error="errors.name">
            <UiInput v-model="draft.name" />
          </UiFormField>
          <UiFormField label="Email" help="Invoices go here." required :error="errors.email">
            <UiInput v-model="draft.email" type="email" />
          </UiFormField>
          <UiFormField label="Plan">
            <UiSelect v-model="draft.plan" :options="PLAN_SELECT" />
          </UiFormField>
          <UiFormField label="Renewal" help="The next invoice is issued on this day.">
            <UiDateInput v-model="draft.renewal" />
          </UiFormField>
          <UiSwitch v-model="draft.newsletter" label="Sends them the product newsletter" />
          <UiFormField label="Notes">
            <UiTextarea v-model="draft.notes" :rows="3" />
          </UiFormField>
        </UiStack>
      </UiStack>

      <template #footer>
        <UiStack direction="horizontal" justify="between" align="center" :gap="2" wrap class="crud__footer">
          <UiConfirmButton v-if="editing" label="Delete customer" confirm-label="Delete for good?" @confirmed="deleteOne" />
          <span v-else />
          <UiStack direction="horizontal" :gap="2">
            <UiButton variant="secondary" @clicked="drawerOpen = false">Cancel</UiButton>
            <UiButton @clicked="save">{{ editing ? "Save" : "Add customer" }}</UiButton>
          </UiStack>
        </UiStack>
      </template>
    </UiDrawer>

    <UiToastHost />
  </div>
</template>

<style scoped>
.crud__body {
  padding: 16px;
}
.crud__who {
  min-width: 0;
}
.crud__who-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.crud__who-name,
.crud__who-mail {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.crud__who-mail {
  font-size: 0.8125rem;
  color: var(--ui-color-text-muted);
}
.crud__footer {
  width: 100%;
}
</style>
