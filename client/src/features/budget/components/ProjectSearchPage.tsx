import axios from "axios";
import { Check, ChevronsUpDown, Command, Eye, Loader2, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { useBudget } from "@/features/budget/budget-context";
import { formatDate, formatINR } from "@/features/budget/budget-format";
import type { BudgetRecord } from "@/features/budget/budget.types";
import {
  getBudgetByProjectCodeAndProductNo,
  mapBudgetApiToUi,
} from "@/features/budget/budgetApi";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useLoader } from "@/shared/hooks/useLoader";
import type { ApiError } from "@/shared/lib/axios";
import { toast } from "sonner";
import CreateBudgetModal from "./CreateBudgetModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/shared/components/ui/command";
import { PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { Label, Popover } from "radix-ui";
import React from "react";

function getErrorStatusCode(error: unknown): number | null {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null;
  }

  if (error && typeof error === "object") {
    const maybeApiError = error as Partial<ApiError> & { status?: unknown };

    if (typeof maybeApiError.statusCode === "number") {
      return maybeApiError.statusCode;
    }

    if (typeof maybeApiError.status === "number") {
      return maybeApiError.status;
    }
  }

  return null;
}

function getErrorDetailMessage(error: unknown): string | null {
  if (error && typeof error === "object") {
    const details = (error as Partial<ApiError>).details as unknown;
    if (details && typeof details === "object" && "detail" in details) {
      const detail = (details as { detail?: unknown }).detail;
      if (typeof detail === "string" && detail.trim()) {
        return detail;
      }
    }
  }

  return null;
}

export function ProjectSearchPage({
  onOpenPlanEntry,
}: {
  onOpenPlanEntry: () => void;
}) {
  const {
    createRecord,
    deleteRecord,
    getRecordTotals,
    importRecord,
    loadRecord,
    state,
  } = useBudget();
  const { wrap } = useLoader();
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
    const [open, setOpen] = React.useState(false)
  const [productNumber, setProductNumber] = React.useState("")
  const [projectNumber, setProjectNumber] = React.useState("")
  const [projects, setProjects] = React.useState<ProjectSearchResult[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [isFetchingDetails, setIsFetchingDetails] = React.useState(false)

  const debouncedProduct = useDebounce(productNumber, 500)

  React.useEffect(() => {
    const fetchProjects = async () => {
      if (debouncedProduct.length <= 3) return
      setIsSearching(true)

      try {
        const res = await fetch(
          `https://localhost:5000/api/budgets/search?projectnumber=${debouncedProduct}`
        )
        const data = await res.json()
        setProjects(Array.isArray(data) ? data : [])
      } catch {
        setProjects([])
      } finally {
        setIsSearching(false)
      }
    }

    fetchProjects()
  }, [debouncedProduct])

  const handleFetchDetails = async () => {
    if (!productNumber || !projectNumber) return
    setIsFetchingDetails(true)

    const searchParams = { productNumber, projectNumber }

    try {
      const data = await getBudgetByProjectCodeAndProductNo(
        projectNumber,
        productNumber
      )
      onDataReceived(data, searchParams)
    } catch {
      onDataReceived({ status: 404 }, searchParams)
    } finally {
      setIsFetchingDetails(false)
    }
  }

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
    if (!searchInputs.productNo.trim() || !searchInputs.projectCode.trim()) {
      toast.info("Enter both product number and project number to search.");
      return;
    }

    setSearchCriteria(searchInputs);
    setHasSearched(true);

    const projectCode = searchInputs.projectCode.trim();
    const productNo = searchInputs.productNo.trim();

    try {
      const recordResponse = await wrap(() =>
        getBudgetByProjectCodeAndProductNo(projectCode, productNo),
      );
      importRecord(mapBudgetApiToUi(recordResponse));
    } catch (error) {
      const statusCode = getErrorStatusCode(error);

      if (statusCode === 404) {
        toast.info(
          getErrorDetailMessage(error) ?? "No matching project record found.",
        );
      } else {
        console.error(error);
        toast.error("Unable to search the budget record.");
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
      toast.success(`Project record ${projectCode} archived.`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to archive the selected budget record.");
    }
  }

  async function handleCreateBudget(input: {
    productName: string;
    projectCode: string;
    productNo: string;
  }) {
    const created = await createRecord(input, true);
    if (created) {
      toast.success(
        "Draft budget record created. Complete the plan entry to save it.",
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
          {/* Replaced form with the Card-based Project Search structure */}
          <Card className="overflow-hidden rounded-sm border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold tracking-wider uppercase">
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid items-end gap-3 md:grid-cols-[44%_44%_10%]">
                {/* 1. Product Number Input (Triggers Debounce) */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">
                    Product Number *
                  </Label>
                  <Input
                    value={searchInputs.product_no}
                    onChange={(e) => {
                      handleSearchFieldChange("product_no", e.target.value);
                      handleSearchFieldChange("projectnumber", ""); // Reset dependent field
                    }}
                    placeholder="e.g. 2022"
                    className="font-mono"
                  />
                </div>

                {/* 2. Project Number Dropdown (Results from Search) */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">
                    Project Number *
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={searchInputs.product_no.length <= 3}
                        className="w-full justify-between font-normal"
                      >
                        <span className="truncate">
                          {searchInputs.projectnumber || "Select Project..."}
                        </span>
                        {isSearching ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-(--radix-popover-trigger-width) p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Filter projects..." />
                        <CommandList className="max-h-50">
                          {isSearching && (
                            <div className="p-4 text-center text-xs">
                              Searching...
                            </div>
                          )}
                          <CommandEmpty>No projects found.</CommandEmpty>
                          <CommandGroup>
                            {projects.map((p, index) => {
                              const projectKey =
                                p.projectCode ?? p.productNo ?? String(index);
                              return (
                                <CommandItem
                                  key={projectKey}
                                  value={projectKey}
                                  onSelect={(val) => {
                                    handleSearchFieldChange(
                                      "projectnumber",
                                      val,
                                    );
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      searchInputs.projectnumber === projectKey
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {p.projectCode}{" "}
                                  {p.productNo ? `— ${p.productNo}` : ""}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 3. Action Button */}
                <Button
                  onClick={handleSearch}
                  disabled={!searchInputs.projectnumber || isFetchingDetails}
                  className="w-full gap-2"
                >
                  {isFetchingDetails ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 shrink-0" />
                  )}
                  <span className="hidden xl:inline">Search</span>
                </Button>
              </div>
            </CardContent>
          </Card>
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
          <button
            className="text-red-400"
            onClick={onDelete}
            title="Archive"
            type="button"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
