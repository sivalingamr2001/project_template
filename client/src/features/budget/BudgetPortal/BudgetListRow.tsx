import { Eye } from "lucide-react";

import type { BudgetRecordSummary } from "./types";
import { Button } from "@/shared/components/ui/button";
import { formatDate } from "./utils/format";

interface Props {
  record: BudgetRecordSummary;
  onOpen: (budgetId: number) => void;
}

export function BudgetListRow({ record, onOpen }: Props) {
  function handleOpen() {
    onOpen(record.budgetId);
  }

  return (
    <tr className="border-t border-border/60 hover:bg-accent/40">
      <td className="px-4 py-4 text-left font-medium">{record.projectCode}</td>
      <td className="px-4 py-4 text-left">{record.productNo}</td>
      <td className="px-4 py-4 text-left text-muted-foreground">{record.projectTitle}</td>
      <td className="px-4 py-4 text-left text-muted-foreground">{formatDate(record.modifiedOn)}</td>
      <td className="px-4 py-4 text-center">
        <Button size="sm" variant="outline" onClick={handleOpen}>
          <Eye className="mr-2 h-4 w-4" />
          Open
        </Button>
      </td>
    </tr>
  );
}

