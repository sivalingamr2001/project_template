import type { BudgetItem } from "./types";
import { BudgetAmountInput } from "./BudgetAmountInput";
import { formatINR, formatPercent } from "./utils/format";
import { varianceClassName } from "./utils/ui";

interface Props {
  categoryIndex: number;
  item: BudgetItem;
  itemIndex: number;
  onUpdate: (params: { categoryIndex: number; itemIndex: number; field: "planned" | "actual"; value: number }) => void;
}

export function BudgetItemRow({ categoryIndex, item, itemIndex, onUpdate }: Props) {
  const variance = item.planned - item.actual;
  const variancePercent = item.planned > 0 ? (variance / item.planned) * 100 : 0;
  const tone = varianceClassName(variance);

  function handlePlannedChange(value: number) {
    onUpdate({ categoryIndex, itemIndex, field: "planned", value });
  }

  function handleActualChange(value: number) {
    onUpdate({ categoryIndex, itemIndex, field: "actual", value });
  }

  return (
    <tr className="border-t border-border/60 hover:bg-accent/40">
      <td className="px-4 py-3 text-muted-foreground">{item.itemName}</td>
      <td className="px-4 py-3">
        <BudgetAmountInput onValueChange={handlePlannedChange} value={item.planned} />
      </td>
      <td className="px-4 py-3">
        <BudgetAmountInput onValueChange={handleActualChange} value={item.actual} />
      </td>
      <td className={`px-4 py-3 text-right ${tone}`}>{formatINR(variance)}</td>
      <td className={`px-4 py-3 text-right ${tone}`}>{formatPercent(variancePercent)}</td>
    </tr>
  );
}

