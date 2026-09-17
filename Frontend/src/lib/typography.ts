/**
 * Typography tokens — map to CSS utility classes in globals.css
 *
 * Rules:
 * - Default app text is body-md (14px)
 * - Use h1 once per page
 * - Dashboard max size: 30px (h1); display-* for landing only
 * - Prefer weight for hierarchy before bumping size
 * - Weights: 400 / 500 / 600 / 700 only (no 800/900)
 */
export const typography = {
  displayLg: "text-display-lg",
  displayMd: "text-display-md",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  bodyLg: "text-body-lg",
  bodyMd: "text-body-md",
  bodySm: "text-body-sm",
  caption: "text-caption",
  labelLg: "text-label-lg",
  labelMd: "text-label-md",
  labelSm: "text-label-sm",
  buttonLg: "text-button-lg h-button-lg",
  buttonMd: "text-button-md h-button-md",
  buttonSm: "text-button-sm h-button-sm",
  metricLabel: "text-metric-label",
  metricValue: "text-metric-value",
  metricChange: "text-metric-change",
  sidebarItem: "text-sidebar-item",
  sidebarSection: "text-sidebar-section",
  tableHeader: "text-table-header",
  tableCell: "text-table-cell",
  tableAmount: "text-table-amount",
  inputValue: "text-input-value",
  inputPlaceholder: "text-input-placeholder",
  helper: "text-helper",
  error: "text-error",
} as const;
