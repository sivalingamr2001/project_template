import type { PlanTab } from "./types";

interface Props {
  activeTab: PlanTab;
  onTabChange: (tab: PlanTab) => void;
}

export function PlanTabs({ activeTab, onTabChange }: Props) {
  function handleBudgetTable() {
    onTabChange("budget-table");
  }

  function handlePhaseTimeline() {
    onTabChange("phase-timeline");
  }

  function handleDocuments() {
    onTabChange("documents");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <PlanTabButton active={activeTab === "budget-table"} label="Budget Table" onClick={handleBudgetTable} />
      <PlanTabButton active={activeTab === "phase-timeline"} label="Phase Timeline" onClick={handlePhaseTimeline} />
      <PlanTabButton active={activeTab === "documents"} label="Documents" onClick={handleDocuments} />
    </div>
  );
}

function PlanTabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  const className = active
    ? "bg-primary/12 text-primary"
    : "text-muted-foreground hover:bg-accent hover:text-foreground";

  return (
    <button className={`rounded-xl px-3 py-2 text-sm transition ${className}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}
