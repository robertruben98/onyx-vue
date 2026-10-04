// Sample data for the customers page: one billing account list with a fixed
// clock. The page edits a copy, so every visit starts from these rows.

export const NOW = new Date("2026-10-04T13:00:00Z");

export type Plan = "free" | "pro" | "enterprise";
export type Status = "active" | "trial" | "suspended";

export interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
  plan: Plan;
  status: Status;
  /** Monthly recurring revenue, in euros. */
  mrr: number;
  country: string;
  signedUp: string;
  /** Next renewal, ISO date. */
  renewal: string;
  newsletter: boolean;
  notes: string;
}

type Row = [string, string, Plan, Status, number, string, string, string];

// name, company, plan, status, mrr, country, signed up, renewal
const ROWS: Row[] = [
  ["Ada Lovelace", "Analytical Engines", "enterprise", "active", 2400, "UK", "2025-03-14", "2027-03-14"],
  ["Grace Hopper", "Cobol Works", "enterprise", "active", 1800, "US", "2025-06-02", "2026-12-02"],
  ["Alan Turing", "Bletchley Labs", "pro", "active", 290, "UK", "2025-09-21", "2026-10-21"],
  ["Katherine Johnson", "Orbit Math", "pro", "active", 290, "US", "2025-11-03", "2026-11-03"],
  ["Linus Torvalds", "Kernel & Co", "free", "active", 0, "FI", "2026-01-12", "2027-01-12"],
  ["Margaret Hamilton", "Apollo Software", "enterprise", "active", 3100, "US", "2024-12-09", "2026-12-09"],
  ["Dennis Ritchie", "C Systems", "pro", "suspended", 290, "US", "2025-02-17", "2026-10-17"],
  ["Barbara Liskov", "Substitution Inc", "pro", "active", 580, "US", "2025-07-30", "2026-10-30"],
  ["Tim Berners-Lee", "Hypertext Ltd", "pro", "trial", 0, "UK", "2026-09-28", "2026-10-12"],
  ["Hedy Lamarr", "Spread Spectrum", "free", "active", 0, "AT", "2026-04-05", "2027-04-05"],
  ["Donald Knuth", "TeX Press", "enterprise", "active", 1500, "US", "2024-10-01", "2026-10-01"],
  ["Radia Perlman", "Spanning Trees", "pro", "active", 290, "US", "2025-05-19", "2026-11-19"],
  ["Ken Thompson", "Unix Tools", "free", "suspended", 0, "US", "2025-08-08", "2026-08-08"],
  ["Frances Allen", "Optimising Compilers", "pro", "trial", 0, "US", "2026-09-30", "2026-10-14"],
  ["Edsger Dijkstra", "Shortest Paths", "pro", "active", 290, "NL", "2025-12-11", "2026-12-11"],
  ["Sophie Wilson", "ARM Designs", "enterprise", "active", 2700, "UK", "2025-01-23", "2027-01-23"],
  ["John McCarthy", "Lisp Machines", "free", "trial", 0, "US", "2026-10-01", "2026-10-15"],
  ["Shafi Goldwasser", "Zero Knowledge", "pro", "active", 580, "IL", "2025-10-07", "2026-10-07"],
  ["Guido van Rossum", "Readable Code", "pro", "active", 290, "NL", "2026-02-14", "2027-02-14"],
  ["Adele Goldberg", "Smalltalk Studio", "free", "active", 0, "US", "2026-03-03", "2027-03-03"],
  ["Bjarne Stroustrup", "Classes Plus", "pro", "suspended", 290, "DK", "2025-04-29", "2026-09-29"],
  ["Lynn Conway", "VLSI Partners", "enterprise", "trial", 0, "US", "2026-09-25", "2026-10-09"],
  ["Niklaus Wirth", "Pascal Systems", "pro", "active", 290, "CH", "2025-06-16", "2026-12-16"],
  ["Jean Bartik", "ENIAC Ops", "free", "active", 0, "US", "2026-05-20", "2027-05-20"],
];

export const CUSTOMERS: Customer[] = ROWS.map(([name, company, plan, status, mrr, country, signedUp, renewal], i) => ({
  id: i + 1,
  name,
  email: `${name.split(" ")[0].toLowerCase()}@${company.toLowerCase().replace(/[^a-z]+/g, "")}.com`,
  company,
  plan,
  status,
  mrr,
  country,
  signedUp: `${signedUp}T09:00:00Z`,
  renewal,
  newsletter: i % 3 !== 0,
  notes: "",
}));

export const PLAN_LABEL: Record<Plan, string> = { free: "Free", pro: "Pro", enterprise: "Enterprise" };
export const STATUS_LABEL: Record<Status, string> = { active: "Active", trial: "Trial", suspended: "Suspended" };
