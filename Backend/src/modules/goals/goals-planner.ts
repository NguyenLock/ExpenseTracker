export type PlanScenarioKind =
  | 'on_track'
  | 'stretch'
  | 'defer_deadline'
  | 'blocked'
  | 'completed'
  | 'no_deadline';

export type PlanInput = {
  targetAmount: number;
  savedAmount: number;
  deadline: string | null;
  today: string; // YYYY-MM-DD
  monthlyIncome: number;
  committedDebts: number;
  committedFixed: number;
  extraFixed?: number;
};

export type PlanScenario = {
  kind: PlanScenarioKind;
  label: string;
  requiredMonthly: number | null;
  availableMonthly: number;
  monthsLeft: number | null;
  monthsNeeded: number | null;
  suggestedDeadline: string | null;
  message: string;
};

export type PlanResult = {
  remaining: number;
  monthsLeft: number | null;
  requiredMonthly: number | null;
  committedDebts: number;
  committedFixed: number;
  committedTotal: number;
  availableMonthly: number;
  scenarios: PlanScenario[];
};

/** Ceil calendar months from today → deadline (min 1 if deadline is still ahead). */
export function monthsLeftUntil(deadline: string, today: string): number {
  const end = parseLocalDate(deadline);
  const start = parseLocalDate(today);
  if (end.getTime() <= start.getTime()) return 1;

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(1, months);
}

export function addMonthsIso(dateIso: string, months: number): string {
  const d = parseLocalDate(dateIso);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Clamp overflow (Jan 31 + 1m → Mar 3 etc.) back to last day of target month
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return toIsoDate(d);
}

export function buildPlan(input: PlanInput): PlanResult {
  const remaining = Math.max(
    0,
    round2(input.targetAmount - input.savedAmount),
  );
  const committedFixed = round2(
    input.committedFixed + (input.extraFixed ?? 0),
  );
  const committedDebts = round2(input.committedDebts);
  const committedTotal = round2(committedDebts + committedFixed);
  const availableMonthly = round2(input.monthlyIncome - committedTotal);

  if (remaining <= 0) {
    return {
      remaining: 0,
      monthsLeft: null,
      requiredMonthly: null,
      committedDebts,
      committedFixed,
      committedTotal,
      availableMonthly,
      scenarios: [
        {
          kind: 'completed',
          label: 'Completed',
          requiredMonthly: null,
          availableMonthly,
          monthsLeft: null,
          monthsNeeded: null,
          suggestedDeadline: null,
          message: 'Goal already reached — nothing left to save.',
        },
      ],
    };
  }

  const monthsLeft = input.deadline
    ? monthsLeftUntil(input.deadline, input.today)
    : null;
  const requiredMonthly =
    monthsLeft != null ? round2(remaining / monthsLeft) : null;

  const scenarios: PlanScenario[] = [];

  if (!input.deadline) {
    scenarios.push({
      kind: 'no_deadline',
      label: 'No deadline',
      requiredMonthly: null,
      availableMonthly,
      monthsLeft: null,
      monthsNeeded:
        availableMonthly > 0
          ? Math.ceil(remaining / availableMonthly)
          : null,
      suggestedDeadline:
        availableMonthly > 0
          ? addMonthsIso(
              input.today,
              Math.ceil(remaining / availableMonthly),
            )
          : null,
      message:
        availableMonthly > 0
          ? `No deadline set. At ~${fmt(availableMonthly)}/mo after commitments, you’d finish in about ${Math.ceil(remaining / availableMonthly)} month(s).`
          : 'No deadline set, and monthly available after commitments is ≤ 0.',
    });
  } else if (availableMonthly >= (requiredMonthly ?? Infinity)) {
    scenarios.push({
      kind: 'on_track',
      label: 'On track',
      requiredMonthly,
      availableMonthly,
      monthsLeft,
      monthsNeeded: monthsLeft,
      suggestedDeadline: null,
      message: `Need ~${fmt(requiredMonthly!)}/mo for ${monthsLeft} month(s). You have ~${fmt(availableMonthly)} available after commitments.`,
    });
  } else if (availableMonthly > 0) {
    const monthsNeeded = Math.ceil(remaining / availableMonthly);
    const suggestedDeadline = addMonthsIso(input.today, monthsNeeded);
    scenarios.push({
      kind: 'stretch',
      label: 'Max this month',
      requiredMonthly,
      availableMonthly,
      monthsLeft,
      monthsNeeded: null,
      suggestedDeadline: null,
      message: `Need ~${fmt(requiredMonthly!)}/mo but only ~${fmt(availableMonthly)} free. Contribute up to ${fmt(availableMonthly)} this month.`,
    });
    scenarios.push({
      kind: 'defer_deadline',
      label: 'Defer deadline',
      requiredMonthly,
      availableMonthly,
      monthsLeft,
      monthsNeeded,
      suggestedDeadline,
      message: `At ~${fmt(availableMonthly)}/mo, finish in ~${monthsNeeded} month(s) — new deadline around ${suggestedDeadline}.`,
    });
  } else {
    scenarios.push({
      kind: 'blocked',
      label: 'Blocked',
      requiredMonthly,
      availableMonthly,
      monthsLeft,
      monthsNeeded: null,
      suggestedDeadline: null,
      message: `After debts + fixed costs (${fmt(committedTotal)}), nothing left to put toward this goal. Lower commitments or raise income.`,
    });
  }

  return {
    remaining,
    monthsLeft,
    requiredMonthly,
    committedDebts,
    committedFixed,
    committedTotal,
    availableMonthly,
    scenarios,
  };
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function fmt(n: number): string {
  return String(round2(n));
}

// ponytail: assert-based self-check — run: npx tsx src/modules/goals/goals-planner.ts
if (process.argv[1]?.includes('goals-planner')) {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(msg);
  };
  assert(monthsLeftUntil('2026-12-31', '2026-09-24') === 3, 'Sep→Dec = 3');
  assert(monthsLeftUntil('2026-10-01', '2026-09-24') === 1, 'Sep→Oct1 = 1');
  const plan = buildPlan({
    targetAmount: 18_000_000,
    savedAmount: 5_000_000,
    deadline: '2026-12-31',
    today: '2026-09-24',
    monthlyIncome: 15_000_000,
    committedDebts: 1_600_000,
    committedFixed: 3_000_000,
  });
  assert(plan.remaining === 13_000_000, 'remaining');
  assert(plan.requiredMonthly === round2(13_000_000 / 3), 'required');
  assert(plan.availableMonthly === 10_400_000, 'available');
  assert(plan.scenarios[0]?.kind === 'on_track', 'on_track');
  const tight = buildPlan({
    ...{
      targetAmount: 18_000_000,
      savedAmount: 5_000_000,
      deadline: '2026-12-31',
      today: '2026-09-24',
      monthlyIncome: 6_000_000,
      committedDebts: 1_600_000,
      committedFixed: 3_000_000,
    },
  });
  assert(
    tight.scenarios.some((s) => s.kind === 'defer_deadline'),
    'defer',
  );
  console.log('goals-planner ok');
}
