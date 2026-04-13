import {
  createRootRouteWithContext,
  createRoute,
} from "@tanstack/react-router";

import { AppLayout, RootLayout } from "@/layouts";
import { requireAuth } from "@/router/routeGuards";
import type { RouterAppContext } from "@/router/router.types";

export const rootRoute = createRootRouteWithContext<RouterAppContext>()({
  component: RootLayout,
});

export const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  beforeLoad: requireAuth,
  component: AppLayout,
});
