import { useMemo, useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";

import { useBudget } from "@/features/budget/budget-context";
import { formatDate, formatINR } from "@/features/budget/budget-format";
import type { BudgetRecord } from "@/features/budget/budget.types";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { toast } from "@/shared/components/ui/sonner";

export function ProjectSearchPage({
  onOpenPlanEntry,
}: {
  onOpenPlanEntry: () => void;
}) {
  const { createRecord, deleteRecord, getRecordTotals, loadRecord, state } = useBudget();
  const [productNoQuery, setProductNoQuery] = useState("");
  const [projectCodeQuery, setProjectCodeQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState({
    productNo: "",
    projectCode: "",
  });
  const [hasSearched, setHasSearched] = useState(false);

  const normalizedProductQuery = searchCriteria.productNo.trim().toLowerCase();
  const normalizedProjectQuery = searchCriteria.projectCode.trim().toLowerCase();

  const records = useMemo(() => {
    if (!hasSearched) {
      return [];
    }

    return state.records.filter((record) => {
      const matchesProduct =
        !normalizedProductQuery ||
        record.projectHeader.productNo.toLowerCase().includes(normalizedProductQuery) ||
        record.projectHeader.productName.toLowerCase().includes(normalizedProductQuery);
      const matchesProject =
        !normalizedProjectQuery ||
        record.projectHeader.projectCode.toLowerCase().includes(normalizedProjectQuery);

      return matchesProduct && matchesProject;
    });
  }, [hasSearched, normalizedProductQuery, normalizedProjectQuery, state.records]);

  const hasExactMatch = records.some(
    (record) =>
      record.projectHeader.productNo.toLowerCase() === normalizedProductQuery &&
      record.projectHeader.projectCode.toLowerCase() === normalizedProjectQuery,
  );
  const canCreate = Boolean(
    hasSearched && normalizedProductQuery && normalizedProjectQuery && !hasExactMatch,
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
        record.projectHeader.productNo.toLowerCase().includes(normalizedValue) ||
        record.projectHeader.productName.toLowerCase().includes(normalizedValue),
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
      productNo: productNoQuery.trim(),
      projectCode: projectCodeQuery.trim(),
    });

    toast.success(`New budget record ${record.projectHeader.projectCode} created.`);
    onOpenPlanEntry();
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
    <Card className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-300/30">
      <div className="shrink-0 space-y-6 p-5">
        <div>
          <h2 className="font-display text-3xl text-foreground">Project Information</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a product number or project number, then click search. If a product already
            exists, the related project number is mapped automatically.
          </p>
        </div>

        <form
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <SearchField
            label="Product Number *"
            onChange={handleProductNumberChange}
            placeholder="Enter product number"
            value={productNoQuery}
          />
          <SearchField
            label="Project Number *"
            onChange={setProjectCodeQuery}
            placeholder="Enter project number"
            value={projectCodeQuery}
          />
          <Button className="h-8 px-4 lg:min-w-24" type="submit">
            Search
          </Button>
        </form>

        {canCreate ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-4">
            <p className="text-sm text-muted-foreground">
              No exact record found for this project and product combination.
            </p>
            <Button onClick={handleCreateRecord} size="sm" className="h-8 px-4 lg:min-w-24">
              Create New Budget Record
            </Button>
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 px-5 pb-5">
        <div className="h-full overflow-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-245 text-sm">
            <thead>
              <tr className="sticky top-0 z-10 bg-muted/40 text-muted-foreground backdrop-blur">
                <th className="px-4 py-4 text-left font-medium">PROJECT #</th>
                <th className="px-4 py-4 text-left font-medium">PRODUCT #</th>
                <th className="px-4 py-4 text-right font-medium">TOTAL PLANNED</th>
                <th className="px-4 py-4 text-right font-medium">TOTAL ACTUAL</th>
                <th className="px-4 py-4 text-right font-medium">VARIANCE</th>
                <th className="px-4 py-4 text-left font-medium">SAVED ON</th>
                <th className="px-4 py-4 text-center font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {records.length ? (
                records.map((record) => (
                  <ProjectRecordRow
                    key={record.id}
                    onDelete={() =>
                      handleDeleteRecord(record.id, record.projectHeader.projectCode)
                    }
                    onView={() => handleOpenRecord(record.id)}
                    record={record}
                    totals={getRecordTotals(record)}
                  />
                ))
              ) : hasSearched ? (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={7}>
                    No matching project information found yet.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={7}>
                    Click Search to load matching project records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
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
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
        {record.projectHeader.projectCode} <span className="text-primary">(Current)</span>
      </td>
      <td className="px-4 py-5 text-foreground">{record.projectHeader.productName}</td>
      <td className="px-4 py-5 text-right text-foreground">{formatINR(totals.totalPlanned)}</td>
      <td className="px-4 py-5 text-right text-foreground">{formatINR(totals.totalActual)}</td>
      <td className="px-4 py-5 text-right font-semibold text-foreground">{formatINR(totals.variance)}</td>
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
