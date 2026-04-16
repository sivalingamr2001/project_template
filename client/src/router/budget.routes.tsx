import { createRoute } from "@tanstack/react-router";
import { appRoute } from "@/router/base.routes";
import BudgetPage from "@/features/budget/BudgetPage";
import DashboardPage from "@/features/Dashboard";

export const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "budget/dashboard",
  component: DashboardPage,
});

export const budgetRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "budget",
  component: BudgetPage,
});

export const budgetSearchRoute = createRoute({
  getParentRoute: () => budgetRoute,
  path: "search",
});

export const budgetPlanEntryRoute = createRoute({
  getParentRoute: () => budgetRoute,
  path: "plan-entry",
});

export const budgetPerformanceReportRoute = createRoute({
  getParentRoute: () => budgetRoute,
  path: "performance-report",
});
