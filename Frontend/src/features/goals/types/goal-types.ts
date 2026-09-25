export type GoalStatusEnum = "active" | "completed" | "cancelled";

export type GoalType = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  remaining: number;
  percentSaved: number;
  deadline: string | null;
  suggestedMonthly: number | null;
  walletId: string | null;
  walletName?: string;
  status: GoalStatusEnum;
  createdAt: string;
  updatedAt: string;
};

export type FixedCostType = {
  id: string;
  userId: string;
  label: string;
  amount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlanScenarioKindEnum =
  | "on_track"
  | "stretch"
  | "defer_deadline"
  | "blocked"
  | "completed"
  | "no_deadline";

export type PlanScenarioType = {
  kind: PlanScenarioKindEnum;
  label: string;
  requiredMonthly: number | null;
  availableMonthly: number;
  monthsLeft: number | null;
  monthsNeeded: number | null;
  suggestedDeadline: string | null;
  message: string;
};

export type GoalPlanType = {
  goal: GoalType;
  fixedCosts: FixedCostType[];
  remaining: number;
  monthsLeft: number | null;
  requiredMonthly: number | null;
  committedDebts: number;
  committedFixed: number;
  committedTotal: number;
  availableMonthly: number;
  scenarios: PlanScenarioType[];
};
