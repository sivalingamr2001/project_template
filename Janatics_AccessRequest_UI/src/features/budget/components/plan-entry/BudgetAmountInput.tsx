import { useEffect, useState } from "react";
import { sanitizeAmountInput } from "./utils/budgetTableUtils";

interface BudgetAmountInputProps {
  onValueChange?: (value: number) => void;
  value: number;
  readOnly?: boolean;
}

export function BudgetAmountInput({
  onValueChange,
  value,
  readOnly = false,
}: BudgetAmountInputProps) {
  const [draftValue, setDraftValue] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    setDraftValue(value === 0 ? "" : String(value));
  }, [value]);

  return (
    <div
      className={`ml-auto flex w-37.5 items-center rounded-xl border px-3 ${
        readOnly ? "border-muted bg-muted/50" : "border-input bg-background/70"
      }`}
    >
      <span className="mr-2 text-sm text-muted-foreground">Rs.</span>
      <input
        className="h-10 w-full bg-transparent text-right text-sm text-foreground outline-none"
        inputMode="numeric"
        disabled={readOnly}
        onChange={(event) => {
          if (readOnly || !onValueChange) return;
          const sanitized = sanitizeAmountInput(event.target.value);
          setDraftValue(sanitized);
          onValueChange(sanitized ? Number(sanitized) : 0);
        }}
        placeholder="0"
        value={draftValue}
      />
    </div>
  );
}
