// Choices for the workspace sign-up. Prices in euros per seat and month.

export const REGIONS = [
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "us-east-1", label: "United States (Virginia)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
];

export const TEAM_SIZES = [
  { value: "1", label: "Just me" },
  { value: "2-10", label: "2–10" },
  { value: "11-50", label: "11–50" },
  { value: "50+", label: "50+" },
];

export type PlanId = "starter" | "team" | "business";

export const PLANS: { id: PlanId; name: string; seat: number; blurb: string }[] = [
  { id: "starter", name: "Starter", seat: 0, blurb: "3 projects, community support" },
  { id: "team", name: "Team", seat: 12, blurb: "Unlimited projects, SSO" },
  { id: "business", name: "Business", seat: 29, blurb: "Audit log, 99.9% SLA, priority support" },
];

/** Yearly billing pays ten months for twelve. */
export const YEARLY_FACTOR = 10 / 12;
