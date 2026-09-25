/** Display / parse money with `.` thousand separators (e.g. 1.200.000). */

export function formatMoneyDots(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value === 0) return "";
  const neg = value < 0;
  const digits = String(Math.round(Math.abs(value)));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return neg ? `-${grouped}` : grouped;
}

export function parseMoneyDots(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}
