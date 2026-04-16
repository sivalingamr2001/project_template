import axios from "axios";
import { useMemo, useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";

import { useBudget } from "@/features/budget/budget-context";
import {
  getBudgetByProjectCode,
  getBudgetByProjectCodeAndProductNo,
  mapBudgetApiToUi,
} from "@/features/budget/budgetApi";
import { formatDate, formatINR } from "@/features/budget/budget-format";
import type { BudgetRecord } from "@/features/budget/budget.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import CreateBudgetModal from "./CreateBudgetModal";

export function ProjectSearchPage({
  onOpenPlanEntry,
}: {
  onOpenPlanEntry: () => void;
}) {
  const { createRecord, deleteRecord, getRecordTotals, importRecord, loadRecord, state } =
    useBudget();
  const [searchInputs, setSearchInputs] = useState({
    productNo: "",
    projectCode: "",
  });
  const [searchCriteria, setSearchCriteria] = useState({
    productNo: "",
    projectCode: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const normalizedProductQuery = useMemo(
    () => searchCriteria.productNo.trim().toLowerCase(),
    [searchCriteria.productNo],
  );

  const normalizedProjectQuery = useMemo(
    () => searchCriteria.projectCode.trim().toLowerCase(),
    [searchCriteria.projectCode],
  );

  const records = useMemo(() => {
    if (!hasSearched) {
      return [];
    }

    return state.records.filter((record) => {
      const normalizedProductNo = record.projectHeader.productNo.toLowerCase();
      const normalizedProductName =
        record.projectHeader.productName.toLowerCase();
      const normalizedProjectCode =
        record.projectHeader.projectCode.toLowerCase();

      const matchesProduct =
        !normalizedProductQuery ||
        normalizedProductNo.includes(normalizedProductQuery) ||
        normalizedProductName.includes(normalizedProductQuery);
      const matchesProject =
        !normalizedProjectQuery ||
        normalizedProjectCode.includes(normalizedProjectQuery);

      return matchesProduct && matchesProject;
    });
  }, [
    hasSearched,
    normalizedProductQuery,
    normalizedProjectQuery,
    state.records,
  ]);

  const hasExactMatch = useMemo(
    () =>
      records.some(
        (record) =>
          record.projectHeader.productNo.toLowerCase() ===
            normalizedProductQuery &&
          record.projectHeader.projectCode.toLowerCase() ===
            normalizedProjectQuery,
      ),
    [normalizedProductQuery, normalizedProjectQuery, records],
  );

  const canCreate = Boolean(
    hasSearched &&
    normalizedProductQuery &&
    normalizedProjectQuery &&
    !hasExactMatch,
  );

  function handleSearchFieldChange(
    field: "productNo" | "projectCode",
    value: string,
  ) {
    setSearchInputs((current) => ({ ...current, [field]: value }));

    if (field !== "productNo") {
      return;
    }

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
      setSearchInputs((current) => ({
        ...current,
        projectCode: matchingRecord.projectHeader.projectCode,
      }));
    }
  }

  async function handleSearch() {
    if (!searchInputs.productNo.trim() && !searchInputs.projectCode.trim()) {
      toast.info("Enter a product number or project number to search.");
      return;
    }

    setSearchCriteria(searchInputs);
    setHasSearched(true);

    const projectCode = searchInputs.projectCode.trim();
    const productNo = searchInputs.productNo.trim();

    if (projectCode && productNo) {
      try {
        const recordResponse = await getBudgetByProjectCodeAndProductNo(
          projectCode,
          productNo,
        );
        importRecord(mapBudgetApiToUi(recordResponse));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          toast.info("No matching project record found.");
        } else {
          console.error(error);
          toast.error("Unable to search the budget record.");
        }
      }

      return;
    }

    if (projectCode) {
      try {
        const recordResponse = await getBudgetByProjectCode(projectCode);
        importRecord(mapBudgetApiToUi(recordResponse));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          toast.info("No matching project record found.");
        } else {
          console.error(error);
          toast.error("Unable to search the budget record.");
        }
      }
    }
  }

  function handleOpenRecord(recordId: string) {
    loadRecord(recordId);
    toast.success("Existing project record loaded into the budget portal.");
    onOpenPlanEntry();
  }

  async function handleDeleteRecord(recordId: string, projectCode: string) {
    try {
      await deleteRecord(recordId);
      toast.success(`Project record ${projectCode} removed from the server.`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete the selected budget record.");
    }
  }

  async function handleCreateBudget(
    input: {
      productName: string;
      projectCode: string;
      productNo: string;
    },
    saveAsDraft: boolean,
  ) {
    const created = await createRecord(input, saveAsDraft);
    if (created) {
      toast.success(
        saveAsDraft
          ? "Draft budget record created. Complete the plan entry to save it."
          : "Budget record created and saved successfully.",
      );
      setIsModalOpen(false);
      onOpenPlanEntry();
    } else {
      toast.error("Failed to create a new budget record.");
    }
  }

  const searchResultsContent = !hasSearched ? (
    <div className="flex min-h-70 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
      <div className="text-lg font-semibold text-foreground">
        Search for a project
      </div>
      <p>
        Enter a product number and project number to find an existing record.
      </p>
    </div>
  ) : records.length === 0 ? (
    <div className="flex min-h-70 flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="text-xl font-semibold text-foreground">
        No project found
      </div>
      <p className="max-w-xl text-sm text-muted-foreground">
        No budget record matches your search. Create a new record to start a
        project budget.
      </p>
      {canCreate ? (
        <Button onClick={() => setIsModalOpen(true)} variant="outline">
          Create new budget
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          Make sure both product and project number values are entered.
        </p>
      )}
    </div>
  ) : (
    <div className="overflow-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead className="bg-muted/75 text-sm uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Project code</th>
            <th className="px-4 py-3">Product name</th>
            <th className="px-4 py-3 text-right">Planned</th>
            <th className="px-4 py-3 text-right">Actual</th>
            <th className="px-4 py-3 text-right">Variance</th>
            <th className="px-4 py-3">Last updated</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <ProjectRecordRow
              key={record.id}
              record={record}
              totals={getRecordTotals(record)}
              onDelete={() =>
                handleDeleteRecord(record.id, record.projectHeader.projectCode)
              }
              onView={() => handleOpenRecord(record.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col bg-background text-foreground overflow-auto">
      <main className="flex flex-1 flex-col gap-6 overflow-hidden py-2">
        <section className="space-y-4">
          <form
            className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="flex-1 min-w-60">
              <SearchField
                label="Product Number *"
                onChange={(value) =>
                  handleSearchFieldChange("productNo", value)
                }
                placeholder="Ex: PROD-100"
                value={searchInputs.productNo}
              />
            </div>
            <div className="flex-1 min-w-60">
              <SearchField
                label="Project Number *"
                onChange={(value) =>
                  handleSearchFieldChange("projectCode", value)
                }
                placeholder="Ex: PRJ-2024"
                value={searchInputs.projectCode}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </section>

        <section className="flex-1 min-h-0 rounded-xl border bg-card shadow-sm">
          {searchResultsContent}
        </section>
      </main>

      <CreateBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBudget}
      />
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
