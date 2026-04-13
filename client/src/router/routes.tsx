import { createRouter } from "@tanstack/react-router";

import { loginRoute } from "@/router/auth.routes";
import { appRoute, rootRoute } from "@/router/base.routes";
import { budgetRoute, dashboardRoute } from "@/router/budget.routes";

export type { RouterAppContext } from "@/router/router.types";

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([dashboardRoute, budgetRoute]),
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
