"use client"

import { Outlet, useLocation } from "react-router-dom"
import { useState } from "react"

import AppSidebar from "./AppSidebar"
import AppHeader from "./AppHeader"
import { cn } from "@/shared/lib/utils"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/plan-entry": "Plan Entry",
  "/reports": "Reports",
  "/budget-template": "Budget Template",
}

export default function AppLayout() {
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    // 1. Force the outer container to be exactly the viewport height
    <div className="flex h-auto w-full overflow-hidden bg-background">
      <AppSidebar isCollapsed={isSidebarCollapsed} />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-all duration-300",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <AppHeader
          title={pageTitles[location.pathname] ?? "Portal"}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        {/* 2. flex-1 allows main to take only the REMAINING space */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
