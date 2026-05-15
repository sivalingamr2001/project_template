import { PageLoader } from "@/components/LoadingSpinner/LoadingSpinner";
import { RouteErrorBoundary } from "@/core/error/RouteErrorBoundary";
import { AppLayout } from "@/layouts/AppLayout";
import { BlankLayout } from "@/layouts/BlankLayout";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

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
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      errorElement: <RouteErrorBoundary />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "/dashboard", element: withSuspense(DashboardPage) },
        { path: "/form-details/:recordId?", element: withSuspense(FormDetailsPage) },
        { path: "/login", element: <Navigate to="/dashboard" replace /> },
      ],
    },
    // Catch-all
    {
      element: <BlankLayout />,
      children: [{ path: "*", element: withSuspense(NotFoundPage) }],
    },
  ],
  { basename: "/portal" },
);

export const Router = () => <RouterProvider router={router} />;
