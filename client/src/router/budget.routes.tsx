import { createRoute } from "@tanstack/react-router";
import { z } from "zod";
import { appRoute } from "@/router/base.routes";
import BudgetPage from "@/features/budget/BudgetPage";
import DashboardPage from "@/features/Dashboard";

export const budgetRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "budget",
  validateSearch: (search) =>
    z
      .object({
        view: z
          .enum(["project-search", "plan-entry", "performance-report"])
          .optional(),
      })
      .parse(search),
  component: BudgetPage,
});

export const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "dashboard",
  component: DashboardPage,
});
