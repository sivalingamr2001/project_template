import { useEffect, useState } from "react";

import { sanitizeAmountInput } from "./utils/ui";

interface Props {
  onValueChange: (value: number) => void;
  value: number;
}

export function BudgetAmountInput({ onValueChange, value }: Props) {
  const [draftValue, setDraftValue] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    setDraftValue(value === 0 ? "" : String(value));
  }, [value]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizeAmountInput(event.target.value);
    setDraftValue(sanitized);
    onValueChange(sanitized ? Number(sanitized) : 0);
  }

  return (
    <div className="ml-auto flex w-[150px] items-center rounded-xl border border-input bg-background/70 px-3">
      <span className="mr-2 text-sm text-muted-foreground">Rs.</span>
      <input
        className="h-10 w-full bg-transparent text-right text-sm text-foreground outline-none"
        inputMode="numeric"
        onChange={handleChange}
        placeholder="0"
        value={draftValue}
      />
    </div>
  );
}

