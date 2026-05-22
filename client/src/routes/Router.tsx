import { PageLoader } from "@/components/LoadingSpinner/LoadingSpinner";
import { RouteErrorBoundary } from "@/core/error/RouteErrorBoundary";
import { AppLayout } from "@/layouts/AppLayout";
import { BlankLayout } from "@/layouts/BlankLayout";
import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useAuth } from "@/core/auth";

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const FormDetailsPage = lazy(() =>
  import("@/pages/FormDetailPage").then((m) => ({
    default: m.FormDetailPage,
  })),
);
const ComponentRequisitionForm = lazy(() =>
  import("@/components/DocumentViewer/ComponentRequisitionForm").then((m) => ({
    default: m.ComponentRequisitionForm,
  })),
);

const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      errorElement: <RouteErrorBoundary />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "/dashboard", element: <RequireAuth>{withSuspense(DashboardPage)}</RequireAuth> },
        { path: "/form-details/:recordId?", element: <RequireAuth>{withSuspense(FormDetailsPage)}</RequireAuth> },
        {path: "/requisitions/new", element: <RequireAuth>{withSuspense(ComponentRequisitionForm)}</RequireAuth>},
      ],
    },
    // Catch-all
    {
      element: <BlankLayout />,
      children: [
        { path: "/login", element: withSuspense(LoginPage) },
        { path: "/register", element: withSuspense(RegisterPage) },
        { path: "*", element: withSuspense(NotFoundPage) },
      ],
    },
  ],
  { basename: "/portal" },
);

export const Router = () => <RouterProvider router={router} />;
