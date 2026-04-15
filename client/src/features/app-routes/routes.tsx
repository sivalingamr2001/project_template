import { createBrowserRouter } from "react-router-dom"

import {
  AuditLogPage,
  DashboardPage,
  DepartmentsPage,
  EmployeePage,
  ProfilePage,
  RequestCreatePage,
  RequestDetailsPage,
  RequestListPage,
  ReviewQueuePage,
} from "@/features/access-workspace"
import {
  HomeRedirect,
  LoginPage,
  ProtectedRoute,
  RoleRoute,
} from "@/features/auth"
import { AppLayout } from "@/layouts"

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomeRedirect /> },
          { path: "profile", element: <ProfilePage /> },
          {
            element: <RoleRoute allowedRoles={["User"]} />,
            children: [
              { path: "dashboard", element: <DashboardPage /> },
              { path: "requests/new", element: <RequestCreatePage /> },
            ],
          },
          {
            element: <RoleRoute allowedRoles={["Hod"]} />,
            children: [
              {
                path: "hod/pending-approvals",
                element: (
                  <ReviewQueuePage
                    title="Pending Approvals"
                    description="Requests currently waiting on HOD approval."
                    mode="hodPending"
                  />
                ),
              },
              {
                path: "hod/approval-history",
                element: (
                  <ReviewQueuePage
                    title="Approval History"
                    description="Completed HOD decisions across reviewed requests."
                    mode="hodHistory"
                  />
                ),
              },
              {
                path: "hod/all-requests",
                element: (
                  <RequestListPage
                    title="All Requests"
                    description="All request details visible to the HOD workspace."
                    mode="hodAll"
                  />
                ),
              },
            ],
          },
          {
            element: <RoleRoute allowedRoles={["Admin"]} />,
            children: [
              {
                path: "it/approval-queue",
                element: (
                  <ReviewQueuePage
                    title="Approval Queue"
                    description="Requests waiting for IT review and provisioning."
                    mode="itQueue"
                  />
                ),
              },
              {
                path: "it/active-access",
                element: (
                  <ReviewQueuePage
                    title="Active Access"
                    description="Provisioned and approved access currently active."
                    mode="itActive"
                  />
                ),
              },
              {
                path: "it/all-requests",
                element: (
                  <RequestListPage
                    title="All Requests"
                    description="All request details available to the IT workspace."
                    mode="itAll"
                  />
                ),
              },
              { path: "it/employees", element: <EmployeePage /> },
              { path: "it/departments", element: <DepartmentsPage /> },
              { path: "it/audit-log", element: <AuditLogPage /> },
            ],
          },
          { path: "requests/:requestId", element: <RequestDetailsPage /> },
          {
            path: "requests/:requestId/items/:itemId",
            element: <RequestDetailsPage />,
          },
        ],
      },
    ],
  },
])
