import { useMemo, useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";

import { useBudget } from "@/features/budget/budget-context";
import { formatDate, formatINR } from "@/features/budget/budget-format";
import type { BudgetRecord } from "@/features/budget/budget.types";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export function ProjectSearchPage({
  onOpenPlanEntry,
}: {
  onOpenPlanEntry: () => void;
}) {
  const { createRecord, deleteRecord, getRecordTotals, loadRecord, state } =
    useBudget();
  const [productNoQuery, setProductNoQuery] = useState("");
  const [projectCodeQuery, setProjectCodeQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState({
    productNo: "",
    projectCode: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const normalizedProductQuery = searchCriteria.productNo.trim().toLowerCase();
  const normalizedProjectQuery = searchCriteria.projectCode
    .trim()
    .toLowerCase();

  const records = useMemo(() => {
    if (!hasSearched) {
      return [];
    }

    return state.records.filter((record) => {
      const matchesProduct =
        !normalizedProductQuery ||
        record.projectHeader.productNo
          .toLowerCase()
          .includes(normalizedProductQuery) ||
        record.projectHeader.productName
          .toLowerCase()
          .includes(normalizedProductQuery);
      const matchesProject =
        !normalizedProjectQuery ||
        record.projectHeader.projectCode
          .toLowerCase()
          .includes(normalizedProjectQuery);

      return matchesProduct && matchesProject;
    });
  }, [
    hasSearched,
    normalizedProductQuery,
    normalizedProjectQuery,
    state.records,
  ]);

  const hasExactMatch = records.some(
    (record) =>
      record.projectHeader.productNo.toLowerCase() === normalizedProductQuery &&
      record.projectHeader.projectCode.toLowerCase() === normalizedProjectQuery,
  );
  const canCreate = Boolean(
    hasSearched &&
    normalizedProductQuery &&
    normalizedProjectQuery &&
    !hasExactMatch,
  );

  function handleProductNumberChange(value: string) {
    setProductNoQuery(value);

    const normalizedValue = value.trim().toLowerCase();

    if (!normalizedValue) {
      return;
    }

    const matchingRecord = state.records.find(
      (record) =>
        record.projectHeader.productNo.toLowerCase() === normalizedValue ||
        record.projectHeader.productNo
          .toLowerCase()
          .includes(normalizedValue) ||
        record.projectHeader.productName
          .toLowerCase()
          .includes(normalizedValue),
    );

    if (matchingRecord) {
      setProjectCodeQuery(matchingRecord.projectHeader.projectCode);
    }
  }

  function handleSearch() {
    if (!productNoQuery.trim() && !projectCodeQuery.trim()) {
      toast.info("Enter a product number or project number to search.");
      return;
    }

    setSearchCriteria({
      productNo: productNoQuery,
      projectCode: projectCodeQuery,
    });
    setHasSearched(true);
  }

  function handleCreateRecord() {
    const record = createRecord({
      productName: projectCodeQuery.trim(),
      productNo: productNoQuery.trim(),
      projectCode: projectCodeQuery.trim(),
    });

    toast.success(
      `New budget record ${record.projectHeader.projectCode} created.`,
    );

    setIsModalOpen(false);
  }

  function handleOpenRecord(recordId: string) {
    loadRecord(recordId);
    toast.success("Existing project record loaded into the budget portal.");
    onOpenPlanEntry();
  }

  function handleDeleteRecord(recordId: string, projectCode: string) {
    deleteRecord(recordId);
    toast.info(`Project record ${projectCode} removed from the local list.`);
  }

  return (
    <div className="flex                     flex-col bg-background text-foreground overflow-auto">
      {/* Main Content Area */}
      <main className="flex flex-1 flex-col gap-6 overflow-hidden py-2">
        {/* Search & Actions Bar */}
        <section className="space-y-4">
          <form
            className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="flex-1 min-w-[240px]">
              <SearchField
                label="Product Number *"
                onChange={handleProductNumberChange}
                placeholder="Ex: PROD-100"
                value={productNoQuery}
              />
            </div>
            <div className="flex-1 min-w-[240px]">
              <SearchField
                label="Project Number *"
                onChange={setProjectCodeQuery}
                placeholder="Ex: PRJ-2024"
                value={projectCodeQuery}
              />
            </div>
            <Button type="submit">Search</Button>
            {canCreate && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
              >
                + Create New Budget
              </Button>
            )}
          </form>
        </section>

        {/* Table Container - This fills the remaining height */}
        <section className="flex-1 min-h-0 rounded-xl border bg-card shadow-sm">
          <div className="h-full overflow-auto">
            <div className="flex flex-1 flex-col gap-4 p-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Plan Entry</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Form for {projectCodeQuery} goes here...</p>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => handleCreateRecord()}>Submit</Button>
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SearchField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-8 rounded-md pl-10 text-sm"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      </div>
    </label>
  );
}

function ProjectRecordRow({
  onDelete,
  onView,
  record,
  totals,
}: {
  onDelete: () => void;
  onView: () => void;
  record: BudgetRecord;
  totals: { totalPlanned: number; totalActual: number; variance: number };
}) {
  return (
    <tr className="border-t border-border/60 bg-primary/5">
      <td className="px-4 py-5 font-semibold text-foreground">
        {record.projectHeader.projectCode}{" "}
        <span className="text-primary">(Current)</span>
      </td>
      <td className="px-4 py-5 text-foreground">
        {record.projectHeader.productName}
      </td>
      <td className="px-4 py-5 text-right text-foreground">
        {formatINR(totals.totalPlanned)}
      </td>
      <td className="px-4 py-5 text-right text-foreground">
        {formatINR(totals.totalActual)}
      </td>
      <td className="px-4 py-5 text-right font-semibold text-foreground">
        {formatINR(totals.variance)}
      </td>
      <td className="px-4 py-5 text-muted-foreground">
        {formatDate(record.projectHeader.lastUpdated)}
      </td>
      <td className="px-4 py-5">
        <div className="flex items-center justify-center gap-2">
          <button className="text-primary" onClick={onView} type="button">
            <Eye className="h-5 w-5" />
          </button>
          <button className="text-red-400" onClick={onDelete} type="button">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
