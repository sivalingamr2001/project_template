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
    <div className="bg-background">
      <AppSidebar isCollapsed={isSidebarCollapsed} />

      <div
        className={cn(
          "flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <header
          className={cn(
            "fixed top-0 right-0 z-30 border-b bg-background/95 backdrop-blur transition-all duration-300 supports-backdrop-filter:bg-background/80",
            isSidebarCollapsed ? "left-0 lg:left-20" : "left-0 lg:left-64"
          )}
        >
          <AppHeader
            title={pageTitles[location.pathname] ?? "Portal"}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
          />
        </header>

        <main className="mt-16 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
