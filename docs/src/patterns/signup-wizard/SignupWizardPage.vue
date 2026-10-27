<script setup lang="ts">
import { computed, nextTick, reactive, ref } from "vue";
import {
  UiAlert,
  UiButton,
  UiCard,
  UiCheckbox,
  UiDescriptionList,
  UiFormField,
  UiInput,
  UiRadioGroup,
  UiSegmented,
  UiSelect,
  UiSlider,
  UiStack,
  UiStepper,
  UiSwitch,
  type DescriptionItem,
  type Step,
} from "@onyx/vue";
import { PLANS, REGIONS, TEAM_SIZES, YEARLY_FACTOR, type PlanId } from "./fixtures";

/**
 * Sign up for a workspace in four steps. Each step checks its own fields on
 * Next; focus moves to the step's heading when it changes, or to the first
 * field that needs fixing, so a keyboard or screen-reader user is never left
 * on a button that no longer exists.
 */

const STEPS = ["Account", "Workspace", "Plan", "Review"] as const;
const current = ref(0);
const done = ref(false);

const form = reactive({
  name: "",
  email: "",
  password: "",
  terms: false,
  workspace: "",
  region: "eu-west-1",
  teamSize: "2-10",
  plan: "team" as PlanId,
  billing: "monthly",
  seats: 5,
  newsletter: true,
});

const errors = reactive<Record<string, string>>({});

const slug = computed(() =>
  form.workspace
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, ""),
);

const plan = computed(() => PLANS.find((p) => p.id === form.plan) ?? PLANS[0]);
const monthly = computed(() => {
  const base = plan.value.seat * form.seats;
  return form.billing === "yearly" ? Math.round(base * YEARLY_FACTOR) : base;
});

const PLAN_OPTIONS = PLANS.map((p) => ({
  value: p.id,
  label: `${p.name} — ${p.seat ? `€${p.seat} a seat a month` : "free"} · ${p.blurb}`,
}));

const steps = computed<Step[]>(() =>
  STEPS.map((label, i) => ({
    label,
    state: done.value || i < current.value ? "done" : i === current.value ? "active" : "pending",
  })),
);

const summary = computed<DescriptionItem[]>(() => [
  { term: "Name", value: form.name },
  { term: "Email", value: form.email },
  { term: "Workspace", value: `${form.workspace} (${slug.value}.acme.cloud)` },
  { term: "Region", value: REGIONS.find((r) => r.value === form.region)?.label ?? form.region },
  { term: "Team", value: TEAM_SIZES.find((t) => t.value === form.teamSize)?.label ?? form.teamSize },
  { term: "Plan", value: `${plan.value.name}, ${form.seats} seats, billed ${form.billing}` },
  { term: "Per month", value: monthly.value ? `€${monthly.value}` : "Free", tone: "success" },
]);

/** Each step's checks: field -> message, empty when fine. */
function check(step: number): Record<string, string> {
  if (step === 0) {
    return {
      name: form.name.trim() ? "" : "Tell us your name.",
      email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) ? "" : "That is not an email address.",
      password: form.password.length >= 12 ? "" : "Use at least 12 characters.",
      terms: form.terms ? "" : "Accept the terms to continue.",
    };
  }
  if (step === 1) {
    return {
      workspace: slug.value.length >= 3 ? "" : "Give it a name of at least 3 letters or digits.",
    };
  }
  return {};
}

const heading = ref<HTMLElement | null>(null);
const root = ref<HTMLElement | null>(null);

async function focusHeading(): Promise<void> {
  await nextTick();
  heading.value?.focus();
}

async function next(): Promise<void> {
  const found = check(current.value);
  for (const key of Object.keys(errors)) delete errors[key];
  Object.assign(errors, Object.fromEntries(Object.entries(found).filter(([, msg]) => msg)));
  if (Object.keys(errors).length) {
    await nextTick();
    root.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return;
  }
  current.value++;
  await focusHeading();
}

async function back(): Promise<void> {
  if (current.value === 0) return;
  current.value--;
  await focusHeading();
}

async function goTo(step: number): Promise<void> {
  current.value = step;
  await focusHeading();
}

async function submit(): Promise<void> {
  done.value = true;
  await focusHeading();
}
</script>

<template>
  <main ref="root" class="wizard">
    <UiStack :gap="5" class="wizard__inner">
      <UiStack :gap="1">
        <p class="wizard__eyebrow">Acme Cloud</p>
        <h1 class="wizard__title">Create your workspace</h1>
      </UiStack>

      <UiStepper :steps="steps" label="Sign-up steps" />

      <UiCard variant="outlined">
        <template v-if="done">
          <UiStack :gap="3">
            <h2 ref="heading" tabindex="-1" class="wizard__step">Your workspace is ready</h2>
            <UiAlert variant="success" title="Welcome aboard">
              {{ form.workspace }} lives at {{ slug }}.acme.cloud. We sent a confirmation to {{ form.email }}.
            </UiAlert>
          </UiStack>
        </template>

        <template v-else>
          <h2 ref="heading" tabindex="-1" class="wizard__step">
            Step {{ current + 1 }} of {{ STEPS.length }}: {{ STEPS[current] }}
          </h2>

          <UiStack v-if="current === 0" :gap="3">
            <UiFormField label="Full name" required :error="errors.name">
              <UiInput v-model="form.name" autocomplete="name" />
            </UiFormField>
            <UiFormField label="Work email" required :error="errors.email">
              <UiInput v-model="form.email" type="email" autocomplete="email" />
            </UiFormField>
            <UiFormField label="Password" help="At least 12 characters." required :error="errors.password">
              <UiInput v-model="form.password" type="password" autocomplete="new-password" />
            </UiFormField>
            <UiFormField label="Terms of service" :error="errors.terms">
              <UiCheckbox v-model="form.terms" label="I accept them" />
            </UiFormField>
          </UiStack>

          <UiStack v-else-if="current === 1" :gap="3">
            <UiFormField
              label="Workspace name"
              :help="slug ? `Your address: ${slug}.acme.cloud` : 'It becomes your address.'"
              required
              :error="errors.workspace"
            >
              <UiInput v-model="form.workspace" autocomplete="organization" />
            </UiFormField>
            <UiFormField label="Data region" help="Where your data is stored. It cannot be changed later.">
              <UiSelect v-model="form.region" :options="REGIONS" />
            </UiFormField>
            <UiStack :gap="1">
              <span class="wizard__label">Team size</span>
              <UiSegmented v-model="form.teamSize" aria-label="Team size" :options="TEAM_SIZES" />
            </UiStack>
          </UiStack>

          <UiStack v-else-if="current === 2" :gap="4">
            <UiRadioGroup v-model="form.plan" label="Plan" :options="PLAN_OPTIONS" />
            <UiStack :gap="1">
              <span class="wizard__label">Billing</span>
              <UiSegmented
                v-model="form.billing"
                aria-label="Billing"
                :options="[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly (2 months free)' },
                ]"
              />
            </UiStack>
            <UiSlider
              v-model="form.seats"
              :min="1"
              :max="50"
              label="Seats"
              show-value
              :value-text="(n: number) => `${n} ${n === 1 ? 'seat' : 'seats'}`"
            />
            <UiSwitch v-model="form.newsletter" label="Send me the monthly product notes" />
            <p class="wizard__total" aria-live="polite">
              {{ monthly ? `€${monthly} a month` : "Free" }}
            </p>
          </UiStack>

          <UiStack v-else :gap="3">
            <UiDescriptionList :items="summary" />
            <UiStack direction="horizontal" :gap="2" wrap>
              <UiButton variant="text" size="sm" @clicked="goTo(0)">Edit account</UiButton>
              <UiButton variant="text" size="sm" @clicked="goTo(1)">Edit workspace</UiButton>
              <UiButton variant="text" size="sm" @clicked="goTo(2)">Edit plan</UiButton>
            </UiStack>
          </UiStack>
        </template>

        <template v-if="!done" #footer>
          <UiStack direction="horizontal" justify="between" :gap="2">
            <UiButton variant="secondary" :disabled="current === 0" @clicked="back">Back</UiButton>
            <UiButton v-if="current < STEPS.length - 1" @clicked="next">Next</UiButton>
            <UiButton v-else @clicked="submit">Create workspace</UiButton>
          </UiStack>
        </template>
      </UiCard>
    </UiStack>
  </main>
</template>

<style scoped>
.wizard {
  display: flex;
  justify-content: center;
  padding: 24px 16px;
}
.wizard__inner {
  width: 100%;
  max-width: 36rem;
}
.wizard__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ui-color-text-muted);
}
.wizard__title {
  margin: 0;
  font-size: 1.5rem;
}
.wizard__step {
  margin: 0 0 16px;
  font-size: 1.1rem;
}
.wizard__label {
  font-size: var(--ui-font-size-sm);
  font-weight: var(--ui-font-weight-medium);
}
.wizard__total {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}
</style>
