import { createRoute } from "@tanstack/react-router";
import { appRoute } from "@/router/base.routes";
import EmployeesPage from "@/features/employees/EmployeesPage";

export const adminEmployeesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "admin/employees",
  component: EmployeesPage,
});
