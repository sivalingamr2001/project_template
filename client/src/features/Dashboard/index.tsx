import { useMemo } from "react";
import { BadgeCheck, Briefcase, Search, PlusCircle } from "lucide-react";
import { Button } from "../../shared/components/ui/button";
// 1. Import useNavigate from TanStack
import { useNavigate } from "@tanstack/react-router";

const portalStats = [
  { label: "Total active projects", value: "38", icon: Briefcase },
  { label: "Approved budget items", value: "26", icon: BadgeCheck },
  { label: "Search ready", value: "Instant", icon: Search },
];

const actions = [
  {
    label: "Create Project",
    description: "Start a new budget entry and capture project details.",
    to: "/app/budget",
    search: { view: "plan-entry" },
    icon: PlusCircle,
    variant: "default",
  },
  {
    label: "Search Project",
    description: "Find an existing project by code or number.",
    to: "/app/budget",
    search: { view: "project-search" },
    icon: Search,
    variant: "secondary",
  },
] as const;

export default function DashboardPage() {
  // 3. Initialize TanStack navigate
  const navigate = useNavigate();

  const summaryText = useMemo(
    () =>
      "Welcome to the Janatics Budget Portal. Use the dashboard to review your active R&D projects, then create or search for project records using the quick actions below.",
    [],
  );

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col gap-8 p-6 md:p-8">
      <header className="rounded-[2rem] border border-border bg-background/80 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Portal overview
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Budget management for R&D projects made simple.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {summaryText}
            </p>
          </div>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold">Portal details</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This dashboard is designed to help you keep project budgets organized.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {portalStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-3xl bg-background p-5 shadow-sm">
                  <div className="flex items-center gap-3 text-primary">
                    <Icon className="h-5 w-5" />
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className="mt-4 text-3xl font-semibold">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Quick actions</h2>
          <div className="mt-6 space-y-4">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate({ to: action.to, search: action.search })}
                className="flex w-full items-start justify-between rounded-3xl border border-border bg-background px-5 py-4 text-left transition hover:border-primary/60 hover:bg-primary/5"
              >
                <div>
                  <p className="text-base font-semibold">{action.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                </div>
                <action.icon className="h-5 w-5 text-primary" />
              </button>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
