import { createRoute } from "@tanstack/react-router";
import { z } from "zod";

import LoginPage from "@/features/auth/LoginPage";
import { rootRoute } from "@/router/base.routes";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search) =>
    z
      .object({
        redirect: z.string().optional(),
      })
      .parse(search),
  component: LoginPage,
});
