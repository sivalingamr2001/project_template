import { useEffect, useMemo, useState } from "react";

const DRAFT_VERSION = 1;
const DRAFT_TTL_MS = 1000 * 60 * 60 * 24 * 7;

interface DraftData {
  productName: string;
  projectCode: string;
  productNo: string;
}

interface UseDraftStorageReturn {
  formData: DraftData;
  setFormData: (data: DraftData) => void;
  hasStoredDraft: boolean;
  shouldPromptResume: boolean;
  resumeStoredDraft: () => void;
  discardStoredDraft: () => void;
}

export function useDraftStorage(
  draftKey: string,
  initialData?: DraftData,
  isOpen?: boolean
): UseDraftStorageReturn {
  const [formData, setFormData] = useState<DraftData>({
    productName: "",
    projectCode: "",
    productNo: "",
  });
  const [hasStoredDraft, setHasStoredDraft] = useState(false);
  const [shouldPromptResume, setShouldPromptResume] = useState(false);

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        productNo: initialData.productNo || "",
        projectCode: initialData.projectCode || "",
        productName: initialData.productName || "",
      });
      setShouldPromptResume(false);
    }
  }, [isOpen, initialData]);

  // Check for stored drafts on mount/open
  useEffect(() => {
    if (!isOpen || initialData) return;

    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const hasAnyDraftValue = Boolean(
        parsed.data.productName.trim() ||
          parsed.data.projectCode.trim() ||
          parsed.data.productNo.trim()
      );

      if (hasAnyDraftValue && !formData.productName && !formData.productNo) {
        setShouldPromptResume(true);
        setHasStoredDraft(true);
      }
    } catch {
      setHasStoredDraft(false);
    }
  }, [isOpen, draftKey, initialData]);

  // Validate and restore draft on modal open
  useEffect(() => {
    if (!isOpen) {
      setShouldPromptResume(false);
      return;
    }

    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) {
        setHasStoredDraft(false);
        return;
      }

      const parsed = JSON.parse(raw) as {
        version: number;
        updatedAt: number;
        data: DraftData;
      };

      const isValid =
        parsed?.version === DRAFT_VERSION &&
        typeof parsed.updatedAt === "number" &&
        Date.now() - parsed.updatedAt <= DRAFT_TTL_MS &&
        parsed.data &&
        typeof parsed.data.productName === "string" &&
        typeof parsed.data.projectCode === "string" &&
        typeof parsed.data.productNo === "string";

      if (!isValid) {
        setHasStoredDraft(false);
        return;
      }

      const hasAnyDraftValue = Boolean(
        parsed.data.productName.trim() ||
          parsed.data.projectCode.trim() ||
          parsed.data.productNo.trim()
      );

      setHasStoredDraft(hasAnyDraftValue);
      setShouldPromptResume(
        hasAnyDraftValue &&
          !formData.productName &&
          !formData.projectCode &&
          !formData.productNo
      );
    } catch {
      setHasStoredDraft(false);
    }
  }, [draftKey, formData.productName, formData.projectCode, formData.productNo, isOpen]);

  // Auto-save draft to localStorage with debounce
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const hasAnyValue = Boolean(
        formData.productName.trim() ||
          formData.projectCode.trim() ||
          formData.productNo.trim()
      );

      if (!hasAnyValue) {
        window.localStorage.removeItem(draftKey);
        setHasStoredDraft(false);
        return;
      }

      window.localStorage.setItem(
        draftKey,
        JSON.stringify({
          version: DRAFT_VERSION,
          updatedAt: Date.now(),
          data: formData,
        })
      );

      setHasStoredDraft(true);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [draftKey, formData, isOpen]);

  const resumeStoredDraft = () => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        version: number;
        updatedAt: number;
        data: DraftData;
      };

      if (
        parsed?.version !== DRAFT_VERSION ||
        typeof parsed.updatedAt !== "number" ||
        Date.now() - parsed.updatedAt > DRAFT_TTL_MS
      ) {
        return;
      }

      setFormData(parsed.data);
      setShouldPromptResume(false);
    } catch {
      // ignore
    }
  };

  const discardStoredDraft = () => {
    window.localStorage.removeItem(draftKey);
    setHasStoredDraft(false);
    setShouldPromptResume(false);
  };

  return {
    formData,
    setFormData,
    hasStoredDraft,
    shouldPromptResume,
    resumeStoredDraft,
    discardStoredDraft,
  };
}
