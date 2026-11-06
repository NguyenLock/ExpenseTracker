export type Period = { from: string; to: string; key: string };

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** ISO-8601 week key of the week starting on `monday`, e.g. 2026-W39. */
function isoWeekKey(monday: string): string {
  const thursday = parseIsoDate(addDays(monday, 3));
  const year = thursday.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const dayOfYear =
    Math.round((thursday.getTime() - jan1.getTime()) / 86_400_000) + 1;
  const week = Math.ceil(dayOfYear / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Monday → Sunday of the week before the one containing `today`. */
export function lastCompletedWeek(today: string): Period {
  const d = parseIsoDate(today);
  const thisMonday = addDays(today, -((d.getDay() + 6) % 7));
  const from = addDays(thisMonday, -7);
  return { from, to: addDays(thisMonday, -1), key: isoWeekKey(from) };
}

function monthPeriod(year: number, monthIndex: number): Period {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const key = `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}`;
  return { from: toIsoDate(first), to: toIsoDate(last), key };
}

/** First → last day of the month before the one containing `today`. */
export function lastCompletedMonth(today: string): Period {
  const d = parseIsoDate(today);
  return monthPeriod(d.getFullYear(), d.getMonth() - 1);
}

export function previousWeek(period: Period): Period {
  const from = addDays(period.from, -7);
  return { from, to: addDays(period.to, -7), key: isoWeekKey(from) };
}

export function previousMonth(period: Period): Period {
  const d = parseIsoDate(period.from);
  return monthPeriod(d.getFullYear(), d.getMonth() - 1);
}

/** Every ISO date from `period.from` to `period.to`, inclusive. */
export function datesOf(period: Period): string[] {
  const dates: string[] = [];
  for (let d = period.from; d <= period.to; d = addDays(d, 1)) dates.push(d);
  return dates;
}

/** null = previous was 0 and current > 0 (show "New"). */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// ponytail: assert-based self-check — run: npx tsx src/modules/notifications/notification-periods.ts
if (process.argv[1]?.includes('notification-periods')) {
  const eq = (actual: unknown, expected: unknown, msg: string) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${msg}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
    }
  };
  // Wed 30/09/2026 → last week Mon 21 – Sun 27
  eq(lastCompletedWeek('2026-09-30'), { from: '2026-09-21', to: '2026-09-27', key: '2026-W39' }, 'week from wed');
  // Monday itself → the week that just ended
  eq(lastCompletedWeek('2026-09-28'), { from: '2026-09-21', to: '2026-09-27', key: '2026-W39' }, 'week from mon');
  // Sunday is still inside the current week
  eq(lastCompletedWeek('2026-09-27').from, '2026-09-14', 'week from sun');
  // Week crossing a year boundary: Mon 28/12/2026 → ISO week 2026-W53
  eq(lastCompletedWeek('2027-01-04').key, '2026-W53', 'iso year boundary');
  eq(previousWeek(lastCompletedWeek('2026-09-30')), { from: '2026-09-14', to: '2026-09-20', key: '2026-W38' }, 'prev week');
  eq(lastCompletedMonth('2026-10-01'), { from: '2026-09-01', to: '2026-09-30', key: '2026-09' }, 'month');
  eq(lastCompletedMonth('2026-01-15'), { from: '2025-12-01', to: '2025-12-31', key: '2025-12' }, 'month across year');
  eq(previousMonth(lastCompletedMonth('2028-03-10')), { from: '2028-01-01', to: '2028-01-31', key: '2028-01' }, 'prev month');
  eq(lastCompletedMonth('2028-03-10').to, '2028-02-29', 'leap february');
  eq(datesOf(lastCompletedWeek('2026-09-30')).length, 7, 'week has 7 days');
  eq(datesOf(lastCompletedMonth('2028-03-10')).at(-1), '2028-02-29', 'month dates end');
  eq(percentChange(1_000_000, 800_000), 25, '+25%');
  eq(percentChange(600_000, 800_000), -25, '-25%');
  eq(percentChange(500_000, 0), null, 'new');
  eq(percentChange(0, 0), 0, 'both zero');
  console.log('notification-periods ok');
}
