import { useEffect, useState } from "react"
import {
  getStorageItem,
  isStorageAvailable,
  removeStorageItem,
  setStorageItem,
} from "@/shared/lib/storage"

const DRAFT_VERSION = 1
const DRAFT_TTL_MINUTES = 60 * 24 * 7

interface DraftData {
  productName: string
  projectNumber: string
  productNo: string
}

interface UseDraftStorageReturn {
  formData: DraftData
  setFormData: (data: DraftData) => void
  hasStoredDraft: boolean
  shouldPromptResume: boolean
  resumeStoredDraft: () => void
  discardStoredDraft: () => void
}

const STORAGE_OPTIONS = {
  namespace: "budget",
  area: "local" as const,
}

export function useDraftStorage(
  draftKey: string,
  initialData?: DraftData,
  isOpen?: boolean
): UseDraftStorageReturn {
  const [formData, setFormData] = useState<DraftData>({
    productName: "",
    projectNumber: "",
    productNo: "",
  })
  const [hasStoredDraft, setHasStoredDraft] = useState(false)
  const [shouldPromptResume, setShouldPromptResume] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        productName: initialData.productName || "",
        projectNumber: initialData.projectNumber || "",
        productNo: initialData.productNo || "",
      })
      setShouldPromptResume(false)
    }
  }, [isOpen, initialData])

  useEffect(() => {
    if (!isOpen || initialData) return
    if (!isStorageAvailable(STORAGE_OPTIONS.area)) return

    try {
      const parsed = getStorageItem<{
        version: number
        updatedAt: number
        data: DraftData
      }>(draftKey, STORAGE_OPTIONS)

      if (!parsed) {
        setHasStoredDraft(false)
        return
      }

      const hasAnyDraftValue = Boolean(
        parsed.data.productName.trim() ||
        parsed.data.projectNumber.trim() ||
        parsed.data.productNo.trim()
      )

      if (hasAnyDraftValue && !formData.productName && !formData.productNo) {
        setShouldPromptResume(true)
        setHasStoredDraft(true)
      }
    } catch {
      setHasStoredDraft(false)
    }
  }, [isOpen, draftKey, initialData, formData.productName, formData.productNo])

  useEffect(() => {
    if (!isOpen) {
      setShouldPromptResume(false)
      return
    }
    if (!isStorageAvailable(STORAGE_OPTIONS.area)) {
      setHasStoredDraft(false)
      return
    }

    const timeout = window.setTimeout(() => {
      const hasAnyValue = Boolean(
        formData.productName.trim() ||
        formData.projectNumber.trim() ||
        formData.productNo.trim()
      )

      if (!hasAnyValue) {
        removeStorageItem(draftKey, STORAGE_OPTIONS)
        setHasStoredDraft(false)
        return
      }

      setStorageItem(
        draftKey,
        {
          version: DRAFT_VERSION,
          updatedAt: Date.now(),
          data: formData,
        },
        {
          ...STORAGE_OPTIONS,
          expiresInMinutes: DRAFT_TTL_MINUTES,
        }
      )

      setHasStoredDraft(true)
    }, 500)

    return () => window.clearTimeout(timeout)
  }, [draftKey, formData, isOpen])

  const resumeStoredDraft = () => {
    if (!isStorageAvailable(STORAGE_OPTIONS.area)) {
      return
    }

    try {
      const parsed = getStorageItem<{
        version: number
        updatedAt: number
        data: DraftData
      }>(draftKey, STORAGE_OPTIONS)

      if (
        !parsed ||
        parsed.version !== DRAFT_VERSION ||
        typeof parsed.updatedAt !== "number" ||
        Date.now() - parsed.updatedAt > DRAFT_TTL_MINUTES * 60_000
      ) {
        return
      }

      setFormData(parsed.data)
      setShouldPromptResume(false)
    } catch {
      // ignore
    }
  }

  const discardStoredDraft = () => {
    removeStorageItem(draftKey, STORAGE_OPTIONS)
    setHasStoredDraft(false)
    setShouldPromptResume(false)
  }

  return {
    formData,
    setFormData,
    hasStoredDraft,
    shouldPromptResume,
    resumeStoredDraft,
    discardStoredDraft,
  }
}
