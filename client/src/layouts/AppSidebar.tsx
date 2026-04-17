"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/shared/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { Layers, TrendingUp, Users } from "lucide-react";
import { useAuthContext } from "@/features/auth";
import * as React from "react";

const data = {
  navMain: [
    {
      title: "Dashboard",
      to: "/budget/dashboard",
      icon: TrendingUp,
    },
    {
      title: "Employees",
      to: "/admin/employees",
      icon: Users,
    },
    {
      title: "Budget",
      to: "/budget",
      icon: Layers,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { setOpen } = useSidebar();
  const { user } = useAuthContext();
  const pathname = location.pathname;
  const isAdmin = user?.role === "Admin";

  const menuItems = data.navMain.filter((item) => {
    if (item.to === "/admin/employees") {
      return isAdmin;
    }

    return true;
  });

  const isDashboardActive = pathname === "/budget/dashboard";
  const isBudgetActive = pathname.startsWith("/budget") && !isDashboardActive;
  const isEmployeesActive = pathname.startsWith("/admin");

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={
                        item.to === "/budget/dashboard"
                          ? isDashboardActive
                          : item.to === "/budget"
                            ? isBudgetActive
                            : item.to === "/admin/employees"
                              ? isEmployeesActive
                              : pathname === item.to
                      }
                      className="px-2.5 md:px-2"
                    >
                      <Link
                        to={item.to}
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
