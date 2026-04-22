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
    "/settings": "Budget Template",
}

export default function AppLayout() {
    const location = useLocation()
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    return (
        <div className="bg-background lg:h-svh lg:overflow-hidden">
            <AppSidebar isCollapsed={isSidebarCollapsed} />

            <div
                className={cn(
                    "transition-all duration-300 lg:h-svh",
                    isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
                )}
            >
                <AppHeader
                    title={pageTitles[location.pathname] ?? "Portal"}
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
                />
                <main className="flex min-h-svh flex-col p-4 md:p-6 lg:h-svh lg:overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
