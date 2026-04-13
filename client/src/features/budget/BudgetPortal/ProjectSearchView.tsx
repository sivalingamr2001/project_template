import { useMemo, useState } from "react";

import { Card } from "@/shared/components/ui/card";
import { toast } from "@/shared/components/ui/sonner";

import { BudgetsTable } from "./BudgetsTable";
import { ProjectSearchInputs } from "./ProjectSearchInputs";
import { useBudget } from "./hooks/useBudgetContext";

export function ProjectSearchView() {
  const { budgets, createBudget, isLoadingBudgets, loadBudgetById, searchBudgets, setActiveView } = useBudget();
  const [projectCode, setProjectCode] = useState("");
  const [productNo, setProductNo] = useState("");
  const [productName, setProductName] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const filtered = useMemo(() => {
    if (!hasSearched) {
      return [];
    }

    const p = projectCode.trim().toLowerCase();
    const n = productNo.trim().toLowerCase();

    return (Array.isArray(budgets) ? budgets : []).filter((r) => {
      const matchesProject = !p || r.projectCode.toLowerCase().includes(p);
      const matchesProduct = !n || r.productNo.toLowerCase().includes(n) || r.projectTitle.toLowerCase().includes(n);
      return matchesProject && matchesProduct;
    });
  }, [budgets, hasSearched, productNo, projectCode]);

  const canCreate = Boolean(hasSearched && projectCode.trim() && productNo.trim() && productName.trim());

  function handleSearchListSubmit(event: React.FormEvent) {
    event.preventDefault();
    setHasSearched(true);

    if (!projectCode.trim() && !productNo.trim()) {
      toast.info("Enter a project code or product number to search.");
      return;
    }
  }

  async function handleQuickOpen() {
    if (!projectCode.trim()) {
      toast.info("Enter a project code (and optionally product number).");
      return;
    }

    await searchBudgets({ projectCode, productNo });
  }

  async function handleCreate() {
    if (!canCreate) {
      toast.info("Enter project code, product number, and product name.");
      return;
    }

    await createBudget({ projectCode: projectCode.trim(), productNo: productNo.trim(), productName: productName.trim() });
  }

  function handleOpenBudget(budgetId: number) {
    loadBudgetById(budgetId);
    setActiveView("plan-entry");
  }

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-300/30">
      <div className="shrink-0 space-y-6 p-5">
        <div>
          <h2 className="font-display text-3xl text-foreground">Project Search</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Search budgets, open an existing record, or create a new budget from the standard template.
          </p>
        </div>

        <ProjectSearchInputs
          canCreate={canCreate}
          isLoading={isLoadingBudgets}
          onCreate={handleCreate}
          onOpenViaApi={handleQuickOpen}
          onSearchListSubmit={handleSearchListSubmit}
          productName={productName}
          productNo={productNo}
          projectCode={projectCode}
          setProductName={setProductName}
          setProductNo={setProductNo}
          setProjectCode={setProjectCode}
        />
      </div>

      <div className="min-h-0 flex-1 px-5 pb-5">
        <BudgetsTable hasSearched={hasSearched} records={filtered} onOpenBudget={handleOpenBudget} />
      </div>
    </Card>
  );
}
