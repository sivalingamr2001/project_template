import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/core/store/uiStore";

import { Header } from "./Header";

export const AppLayout = () => {
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateBreakpoint = (event?: MediaQueryListEvent) => {
      const matches = event?.matches ?? mediaQuery.matches;

      setIsDesktop(matches);

      if (matches) {
        setSidebarOpen(false);
      }
    };

    updateBreakpoint();
    mediaQuery.addEventListener("change", updateBreakpoint);

    return () => mediaQuery.removeEventListener("change", updateBreakpoint);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop, location.pathname, setSidebarOpen]);

  return (
    <div className="bg-background text-foreground h-screen overflow-hidden transition-colors duration-300">
      <div className="relative flex h-screen gap-2 overflow-hidden p-2">
        <div className="border-border bg-card relative z-10 flex h-[calc(100vh-1rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-[30px] border shadow-sm transition-colors duration-300">
          <Header />
          <div className="px-4">
            <Separator className="opacity-50 dark:opacity-20" />
          </div>

          <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth bg-gray-50 dark:bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
