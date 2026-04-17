import { createRouter } from "@tanstack/react-router";

import { loginRoute } from "@/router/auth.routes";
import { appRoute, homeRoute, rootRoute } from "@/router/base.routes";
import {
  budgetRoute,
  dashboardRoute,
  budgetSearchRoute,
  budgetPlanEntryRoute,
  budgetPerformanceReportRoute,
} from "@/router/budget.routes";
import { adminEmployeesRoute } from "@/router/admin.routes";

export type { RouterAppContext } from "@/router/router.types";

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  appRoute.addChildren([
    dashboardRoute,
    adminEmployeesRoute,
    budgetRoute.addChildren([
      budgetSearchRoute,
      budgetPlanEntryRoute,
      budgetPerformanceReportRoute,
    ]),
  ]),
]);

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient: undefined!,
  },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
