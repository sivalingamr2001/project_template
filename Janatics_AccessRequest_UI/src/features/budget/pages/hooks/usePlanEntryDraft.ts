import { useEffect, useMemo, useState } from "react"
import type { BudgetRecord } from "@/features/budget/types"
import { useAuth } from "@/providers/auth-provider"
import {
  getStorageItem,
  isStorageAvailable,
  removeStorageItem,
  setStorageItem,
} from "@/shared/lib/storage"

const DRAFT_KEY_PREFIX = "budget-plan-entry-draft"
const DRAFT_TTL_MINUTES = 60 * 2

interface UsePlanEntryDraftReturn {
  localRecord: BudgetRecord | null
  setLocalRecord: (record: BudgetRecord | null) => void
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (changed: boolean) => void
  saveDraft: () => Promise<void>
  discardDraft: () => void
  loadDraft: () => BudgetRecord | null
}

export function usePlanEntryDraft(): UsePlanEntryDraftReturn {
  const { user } = useAuth()
  const [localRecord, setLocalRecord] = useState<BudgetRecord | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const draftKey = useMemo(
    () => `${DRAFT_KEY_PREFIX}:${user?.employeeId ?? "guest"}`,
    [user?.employeeId]
  )

  useEffect(() => {
    const stored = loadDraft()
    if (stored) {
      setLocalRecord(stored)
    }
  }, [draftKey])

  useEffect(() => {
    if (!hasUnsavedChanges || !localRecord || !isStorageAvailable("local"))
      return

    const timeout = setTimeout(async () => {
      try {
        setStorageItem(
          draftKey,
          {
            timestamp: Date.now(),
            record: localRecord,
          },
          {
            namespace: "budget",
            area: "local",
            expiresInMinutes: DRAFT_TTL_MINUTES,
          }
        )
      } catch (err) {
        console.error("Failed to save draft:", err)
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [hasUnsavedChanges, localRecord, draftKey])

  const saveDraft = async () => {
    if (!localRecord || !isStorageAvailable("local")) return

    try {
      setStorageItem(
        draftKey,
        {
          timestamp: Date.now(),
          record: localRecord,
        },
        {
          namespace: "budget",
          area: "local",
          expiresInMinutes: DRAFT_TTL_MINUTES,
        }
      )
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error("Failed to save draft:", err)
    }
  }

  const loadDraft = (): BudgetRecord | null => {
    if (!isStorageAvailable("local")) {
      return null
    }

    try {
      const parsed = getStorageItem<{
        timestamp: number
        record: BudgetRecord
      }>(draftKey, {
        namespace: "budget",
        area: "local",
      })
      return parsed?.record ?? null
    } catch (err) {
      console.error("Failed to load draft:", err)
      return null
    }
  }

  const discardDraft = () => {
    try {
      removeStorageItem(draftKey, {
        namespace: "budget",
        area: "local",
      })
      setLocalRecord(null)
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error("Failed to discard draft:", err)
    }
  }

  return {
    localRecord,
    setLocalRecord,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveDraft,
    discardDraft,
    loadDraft,
  }
}
