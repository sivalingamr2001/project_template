import type { ChartConfig } from "@/shared/components/ui/chart";

export const trendConfig = {
  planned: {
    label: "Planned",
    color: "var(--chart-1)",
  },
  actual: {
    label: "Actual",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const categoryConfig = {
  planned: {
    label: "Planned",
    color: "var(--chart-1)",
  },
  actual: {
    label: "Actual",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const donutConfig = {
  "Engineering Labour": {
    label: "Engineering Labour",
    color: "#1a56db",
  },
  "Material & Components": {
    label: "Material & Components",
    color: "#10b981",
  },
  "Machining & Fabrication": {
    label: "Machining & Fabrication",
    color: "#f59e0b",
  },
  "Testing & Validation": {
    label: "Testing & Validation",
    color: "#6366f1",
  },
  "Miscellaneous": {
    label: "Miscellaneous",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export const scatterConfig = {
  actual: {
    label: "Actual",
    color: "var(--chart-2)",
  },
  utilization: {
    label: "Utilization",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const sampleBudgetData = [
  { category: "Material & Components", planned: 465000, actual: 452000 },
  { category: "Machining & Fabrication", planned: 380000, actual: 343000 },
  { category: "Testing & Validation", planned: 205000, actual: 139000 },
  { category: "Engineering Labour", planned: 700000, actual: 499000 },
  { category: "Miscellaneous & Overheads", planned: 100000, actual: 100000 },
] as const;

export const sampleTotals = {
  totalPlanned: sampleBudgetData.reduce((sum, item) => sum + item.planned, 0),
  totalActual: sampleBudgetData.reduce((sum, item) => sum + item.actual, 0),
  variance: sampleBudgetData.reduce((sum, item) => sum + item.planned - item.actual, 0),
};