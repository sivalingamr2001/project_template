import { useCallback, useEffect, useState } from "react";

import { toast } from "@/shared/components/ui/sonner";

import type { BudgetRecord, BudgetRecordSummary, CreateBudgetInput } from "../types";
import { getApiErrorMessage } from "../utils/errors";
import { buildBudgetDataFromTemplate } from "../utils/template";
import { createBudget, getBudgetById, getBudgetByProjectAndProduct, getBudgetByProjectCode, getBudgets, updateBudget } from "../utils/budgetsApi";
import { useBudgetDraft } from "./useBudgetDraft";

export function useBudgetsStore(employeeId: number) {
  const [budgets, setBudgets] = useState<BudgetRecordSummary[]>([]);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
  const [activeBudgetId, setActiveBudgetId] = useState<number | null>(null);
  const [activeBudget, setActiveBudget] = useState<BudgetRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { budgetDraft, setBudgetDraft, updateBudgetItem } = useBudgetDraft(activeBudget);

  const refreshBudgets = useCallback(async () => {
    setIsLoadingBudgets(true);
    try {
      const data = await getBudgets();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setIsLoadingBudgets(false);
    }
  }, []);

  const setSelectedBudget = useCallback((record: BudgetRecord) => {
    setActiveBudget(record);
    setActiveBudgetId(record.header.budgetId);
  }, []);

  useEffect(() => { void refreshBudgets(); }, [refreshBudgets]);

  useEffect(() => {
    if (activeBudgetId == null) { setActiveBudget(null); return; }
    getBudgetById(activeBudgetId).then(setActiveBudget).catch((e) => toast.error(getApiErrorMessage(e)));
  }, [activeBudgetId]);

  const searchBudgets = useCallback(async (input: { projectCode?: string; productNo?: string }) => {
    const projectCode = input.projectCode?.trim() ?? "";
    const productNo = input.productNo?.trim() ?? "";
    if (!projectCode) { toast.info("Enter a project code (or both project & product)."); return; }
    const record = projectCode && productNo ? await getBudgetByProjectAndProduct(projectCode, productNo) : await getBudgetByProjectCode(projectCode);
    setSelectedBudget(record);
  }, [setSelectedBudget]);

  const createNewBudget = useCallback(async (input: CreateBudgetInput) => {
    setIsSaving(true);
    try {
      const record = await createBudget({ employeeId, projectCode: input.projectCode, productNo: input.productNo, productName: input.productName, budgetData: buildBudgetDataFromTemplate() });
      setSelectedBudget(record);
      await refreshBudgets();
      toast.success(`Budget ${record.header.projectCode} created.`);
    } catch (e) { toast.error(getApiErrorMessage(e)); } finally { setIsSaving(false); }
  }, [employeeId, refreshBudgets, setSelectedBudget]);

  const saveDraft = useCallback(async () => {
    if (!budgetDraft) { toast.info("No budget loaded."); return; }
    if (budgetDraft.header.budgetId === 0) {
      toast.info("Dummy data cannot be saved. Please search or create a real project.");
      return;
    }
    setIsSaving(true);
    try {
      const items = budgetDraft.categories.flatMap((c) => c.items.map((i) => ({ itemId: i.itemId, planned: i.planned, actual: i.actual })));
      const updated = await updateBudget(budgetDraft.header.budgetId, { projectCode: budgetDraft.header.projectCode, productNo: budgetDraft.header.productNo, projectTitle: budgetDraft.header.projectTitle, items });
      setBudgetDraft(updated);
      setSelectedBudget(updated);
      await refreshBudgets();
      toast.success("Budget saved.");
    } catch (e) { toast.error(getApiErrorMessage(e)); } finally { setIsSaving(false); }
  }, [budgetDraft, refreshBudgets, setBudgetDraft, setSelectedBudget]);

  return { activeBudget, budgetDraft, budgets, createBudget: createNewBudget, isLoadingBudgets, isSaving, loadBudgetById: setActiveBudgetId, saveBudgetDraft: saveDraft, searchBudgets, updateBudgetItem };
}
