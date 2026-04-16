import {
  createRootRouteWithContext,
  createRoute,
  redirect,
} from "@tanstack/react-router";

import { AppLayout, RootLayout } from "@/layouts";
import { requireAuth } from "@/router/routeGuards";
import type { RouterAppContext } from "@/router/router.types";

export const rootRoute = createRootRouteWithContext<RouterAppContext>()({
  component: RootLayout,
});

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: ({ context }) => {
    if (context.auth.isLoggedIn) {
      throw redirect({ to: "/budget/dashboard" });
    }

    throw redirect({ to: "/login" });
  },
});

export const appRoute = createRoute({
  id: "appRoute",
  getParentRoute: () => rootRoute,
  beforeLoad: requireAuth,
  component: AppLayout,
});
