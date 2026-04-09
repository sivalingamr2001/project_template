import { redirect, type ParsedLocation } from "@tanstack/react-router";

import type { RouterAppContext } from "@/router/router.types";

export function requireAuth({
  context,
  location,
}: {
  context: RouterAppContext;
  location: ParsedLocation;
}) {
  if (!context.auth.isLoggedIn) {
    throw redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
    });
  }
}
