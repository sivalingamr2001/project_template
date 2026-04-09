import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { Boxes, LogOut, TrendingUp, WalletCards } from "lucide-react";

import { useAuthContext } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { ActiveView } from "@/features/budget/budget-page.types";
import { useBudget } from "@/features/budget/budget-context";
import { useState } from "react";

export default function AppLayout() {
  const auth = useAuthContext();
  const router = useRouter();
  const [activeView, setActiveView] = useState<ActiveView>("project-search");
  const { activeRecord } = useBudget();

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
                onClick={() => setActiveView("project-search")}
              />
              <TopTabButton
                active={activeView === "plan-entry"}
                disabled={!activeRecord}
                label="Plan Entry"
                onClick={() => setActiveView("plan-entry")}
              />
              <TopTabButton
                active={activeView === "performance-report"}
                disabled={!activeRecord}
                label="Performance Report"
                onClick={() => setActiveView("performance-report")}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                auth.logout();
                void router.navigate({ to: "/login" });
              }}
            >
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

function TopTabButton({
  active,
  disabled = false,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-xl px-4 py-1 text-sm font-medium transition ${
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-blue-950/20"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      } ${disabled ? "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted-foreground" : ""}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
