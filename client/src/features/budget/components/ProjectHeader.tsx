import { useBudget } from "@/features/budget/budget-context";
import { formatDate } from "@/features/budget/budget-format";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";

export function ProjectHeader() {
  const { activeRecord } = useBudget();

  if (!activeRecord) {
    return null;
  }

  const { projectHeader } = activeRecord;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border/70 bg-muted/30 px-5 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-display text-2xl text-foreground">{projectHeader.productName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Project: {projectHeader.projectCode} | Product No: {projectHeader.productNo}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Last saved
            <div className="font-semibold text-foreground">{formatDate(projectHeader.lastUpdated)}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">Phase: {projectHeader.phase}</Badge>
          <Badge variant="secondary">Department: {projectHeader.department}</Badge>
          <Badge variant="secondary">FY 2025-26</Badge>
        </div>
      </div>
    </Card>
  );
}
