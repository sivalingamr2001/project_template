import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/features/auth";
import { getBudgetByProductNo } from "@/features/budget/budgetApi";
import type { BudgetRecordResponse } from "@/features/budget/budgetApi";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

const DRAFT_VERSION = 1;
const DRAFT_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

type CreateBudgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (
    input: {
      productName: string;
      projectCode: string;
      productNo: string;
    },
  ) => Promise<void>;
};

export default function CreateBudgetModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateBudgetModalProps) {
  const { user } = useAuthContext();
  const draftKey = useMemo(
    () => `draft:create-budget:${user?.employeeId ?? "guest"}`,
    [user?.employeeId],
  );

  const [formData, setFormData] = useState({
    productName: "",
    projectCode: "",
    productNo: "",
  });
  const [searchResult, setSearchResult] = useState<BudgetRecordResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasStoredDraft, setHasStoredDraft] = useState(false);
  const [shouldPromptResume, setShouldPromptResume] = useState(false);

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
        data: typeof formData;
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
          parsed.data.productNo.trim(),
      );

      setHasStoredDraft(hasAnyDraftValue);
      setShouldPromptResume(
        hasAnyDraftValue &&
          !formData.productName &&
          !formData.projectCode &&
          !formData.productNo,
      );
    } catch {
      setHasStoredDraft(false);
    }
  }, [
    draftKey,
    formData.productName,
    formData.projectCode,
    formData.productNo,
    isOpen,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const hasAnyValue = Boolean(
        formData.productName.trim() ||
          formData.projectCode.trim() ||
          formData.productNo.trim(),
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
        }),
      );

      setHasStoredDraft(true);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [draftKey, formData, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const productNo = formData.productNo.trim();
    if (!productNo) {
      setSearchResult(null);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const result = await getBudgetByProductNo(productNo);
        setSearchResult(result);
        setFormData((prev) => ({
          ...prev,
          projectCode: prev.projectCode || result.header.projectCode,
          productName: prev.productName || result.header.projectTitle,
        }));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setSearchResult(null);
        setSearchError(
          error instanceof Error ? error.message : "Unable to fetch budget info.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [draftKey, formData.productNo, isOpen]);

  function resumeStoredDraft() {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        version: number;
        updatedAt: number;
        data: typeof formData;
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
  }

  function discardStoredDraft() {
    window.localStorage.removeItem(draftKey);
    setHasStoredDraft(false);
    setShouldPromptResume(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) {
      await onSubmit({
        productName: formData.productName,
        projectCode: formData.projectCode,
        productNo: formData.productNo,
      });
    }

    setFormData({
      productName: "",
      projectCode: "",
      productNo: "",
    });
    discardStoredDraft();

    if (!onSubmit) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-120 rounded-[2rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Project Plan Entry
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Fill in the details to initialize the project budget.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-6">
          {shouldPromptResume && hasStoredDraft && (
            <div className="rounded-2xl border border-border/80 bg-muted px-4 py-3 text-sm">
              <div className="font-semibold text-foreground">
                Resume your draft?
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                A saved draft was found for your session.
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={resumeStoredDraft}
                >
                  Resume
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={discardStoredDraft}
                >
                  Discard
                </Button>
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              name="productName"
              placeholder="e.g., Smart Control System"
              value={formData.productName}
              onChange={handleChange}
              required
              className="rounded-xl h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="productNo">Product Number</Label>
              <Input
                id="productNo"
                name="productNo"
                placeholder="NPD-2025-07"
                value={formData.productNo}
                onChange={handleChange}
                required
                className="rounded-xl h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projectCode">Project Code</Label>
              <Input
                id="projectCode"
                name="projectCode"
                placeholder="RD-001"
                value={formData.projectCode}
                onChange={handleChange}
                required
                className="rounded-xl h-11"
              />
            </div>
          </div>

          {searchError && (
            <div className="rounded-2xl border border-destructive/70 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {searchError}
            </div>
          )}

          {isSearching && (
            <div className="rounded-2xl border border-border/80 bg-muted px-4 py-3 text-sm text-muted-foreground">
              Looking up product number...
            </div>
          )}

          {searchResult && (
            <div className="rounded-2xl border border-border/80 bg-muted px-4 py-4 text-sm">
              <div className="mb-3 text-base font-semibold text-foreground">
                Budget lookup result
              </div>
              <div className="grid gap-1 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">Product No:</span>{" "}
                  {searchResult.header.productNo}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Project Code:</span>{" "}
                  {searchResult.header.projectCode}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Project Title:</span>{" "}
                  {searchResult.header.projectTitle}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {searchResult.categories.map((category) => (
                  <div key={category.categoryId}>
                    <div className="text-sm font-semibold text-foreground">
                      {category.categoryName}
                    </div>
                    <div className="mt-2 space-y-2">
                      {category.items.map((item) => (
                        <div
                          className="grid grid-cols-[1fr_auto_auto] gap-2 rounded-2xl border border-border/80 bg-background px-3 py-2 text-sm"
                          key={item.itemId}
                        >
                          <span>{item.itemName}</span>
                          <span className="text-right text-muted-foreground">
                            {item.planned}
                          </span>
                          <span className="text-right text-muted-foreground">
                            {item.actual}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-3 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFormData({
                  productName: "",
                  projectCode: "",
                  productNo: "",
                });
                discardStoredDraft();
                onClose();
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl px-8 shadow-md">
              Go To Plan Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
