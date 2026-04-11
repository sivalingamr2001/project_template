import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";

import { useBudget } from "./hooks/useBudgetContext";
import { formatDate } from "./utils/format";

export function ProjectHeaderCard() {
  const { budgetDraft } = useBudget();

  if (!budgetDraft) {
    return null;
  }

  const header = budgetDraft.header;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border/70 bg-muted/30 px-5 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-display text-2xl text-foreground">{header.projectTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Project: {header.projectCode} | Product No: {header.productNo}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Last saved
            <div className="font-semibold text-foreground">{formatDate(header.modifiedOn)}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">Budget ID: {header.budgetId}</Badge>
          <Badge variant="secondary">FY 2025-26</Badge>
        </div>
      </div>
    </Card>
  );
}

