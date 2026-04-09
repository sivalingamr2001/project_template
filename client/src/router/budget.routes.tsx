import { createRoute } from "@tanstack/react-router";

import { BudgetPage } from "@/features/budget";
import { appRoute } from "@/router/base.routes";

export const budgetRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/budget",
  component: BudgetPage,
});
