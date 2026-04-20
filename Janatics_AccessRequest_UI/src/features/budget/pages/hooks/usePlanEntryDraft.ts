import { useEffect, useMemo, useState } from "react";
import type { BudgetRecord } from "@/features/budget/types";
import { useAuth } from "@/providers/auth-provider";

const DRAFT_KEY_PREFIX = "budget-plan-entry-draft";

interface UsePlanEntryDraftReturn {
  localRecord: BudgetRecord | null;
  setLocalRecord: (record: BudgetRecord | null) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (changed: boolean) => void;
  saveDraft: () => Promise<void>;
  discardDraft: () => void;
  loadDraft: () => BudgetRecord | null;
}

export function usePlanEntryDraft(): UsePlanEntryDraftReturn {
  const { user } = useAuth();
  const [localRecord, setLocalRecord] = useState<BudgetRecord | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const draftKey = useMemo(
    () => `${DRAFT_KEY_PREFIX}:${user?.employeeId ?? "guest"}`,
    [user?.employeeId]
  );

  // Load draft on mount
  useEffect(() => {
    const stored = loadDraft();
    if (stored) {
      setLocalRecord(stored);
    }
  }, []);

  // Auto-save draft when changes occur
  useEffect(() => {
    if (!hasUnsavedChanges || !localRecord) return;

    const timeout = setTimeout(async () => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            timestamp: Date.now(),
            record: localRecord,
          })
        );
      } catch (err) {
        console.error("Failed to save draft:", err);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [hasUnsavedChanges, localRecord, draftKey]);

  const saveDraft = async () => {
    if (!localRecord) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          timestamp: Date.now(),
          record: localRecord,
        })
      );
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  const loadDraft = (): BudgetRecord | null => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed.record as BudgetRecord;
    } catch (err) {
      console.error("Failed to load draft:", err);
      return null;
    }
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftKey);
      setLocalRecord(null);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to discard draft:", err);
    }
  };

  return {
    localRecord,
    setLocalRecord,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveDraft,
    discardDraft,
    loadDraft,
  };
}
