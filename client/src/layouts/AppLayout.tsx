import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, TrendingUp } from "lucide-react";

import { useAuthContext } from "@/features/auth";
import { useBudget } from "@/features/budget";
import { Button } from "@/shared/components/ui/button";
import { TopTabButton } from "@/layouts/TopTabButton";

export default function AppLayout() {
  const auth = useAuthContext();
  const navigate = useNavigate();
  const { activeBudget, activeView, setActiveView } = useBudget();
  const hasActiveBudget = Boolean(activeBudget);

  function handleLogout() {
    auth.logout();
    navigate("/login", { replace: true });
  }

  function handleProjectSearch() {
    setActiveView("project-search");
  }

  function handlePlanEntry() {
    setActiveView("plan-entry");
  }

  function handlePerformanceReport() {
    setActiveView("performance-report");
  }

  return (
    <div className="shell-grid min-h-screen">
      <main className="flex-1">
        <header className="flex flex-col gap-4 border-b border-border/80 px-3 py-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a4fa3] text-white shadow-lg shadow-blue-950/25">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">
                Janatics India Pvt. Ltd.
              </div>
              <div className="text-sm text-muted-foreground">
                R&D Budget Management Portal
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-2xl border border-border/80 bg-background/70 p-1">
              <TopTabButton
                active={activeView === "project-search"}
                label="Project Search"
                onClick={handleProjectSearch}
              />
              <TopTabButton
                active={activeView === "plan-entry"}
                disabled={!hasActiveBudget}
                label="Plan Entry"
                onClick={handlePlanEntry}
              />
              <TopTabButton
                active={activeView === "performance-report"}
                disabled={!hasActiveBudget}
                label="Performance Report"
                onClick={handlePerformanceReport}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <div className="p-5 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
