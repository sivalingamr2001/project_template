import type { BudgetRecord } from "@/features/budget/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  FileDown,
  Save,
  Info,
  ExternalLink,
  Settings2,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import type { TemplateOption } from "@/features/budget/utils/budgetTemplates"
import { Link } from "react-router-dom"

interface ProjectHeaderProps {
  record: BudgetRecord
  onSaveRecord?: () => Promise<void>
  onDiscardDraft: () => void
  onExportCsv: () => void | Promise<void>
  selectedTemplateId: string
  onTemplateChange: (value: string) => void
  templateOptions: TemplateOption[]
}

export function ProjectHeader({
  record,
  onSaveRecord,
  onDiscardDraft,
  onExportCsv,
  selectedTemplateId,
  onTemplateChange,
  templateOptions,
}: ProjectHeaderProps) {
  const [isRefreshConfirmOpen, setIsRefreshConfirmOpen] = useState(false)

  const isFormValid = Boolean(
    record.projectHeader.projectCode && record.projectHeader.productNo
  )

  function confirmRefresh() {
    onDiscardDraft()
    setIsRefreshConfirmOpen(false)
    toast.success(
      "Draft session cleared. Returning to the project search view."
    )
  }

  const { projectHeader } = record
  const selectedTemplateName =
    templateOptions.find((t) => t.id === selectedTemplateId)?.name ||
    "Select template"

  return (
    <div className="rounded-sm border-b border-border/70 bg-muted px-5 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Budget Name:</span>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {projectHeader.productName}
            </h1>
          </div>
          <p className="mt-1 text-sm text-foreground">
            <span className="font-medium text-muted-foreground">Project:</span>{" "}
            {projectHeader.projectCode} |{" "}
            <span className="font-medium text-muted-foreground">
              Product No:
            </span>{" "}
            {projectHeader.productNo}
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Last Updated:
            <span className="text-foreground">
              {formatDate(projectHeader.lastUpdated)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 🧩 SLEEK TEMPLATE SELECTOR PILL */}
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card p-1 pr-2 shadow-sm">
              <div className="mr-1 flex items-center gap-2 pl-3">
                <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase">
                  Template
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-2 rounded-full px-3 text-xs font-semibold hover:bg-accent"
                  >
                    {selectedTemplateName}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Budget Layouts</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {templateOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => onTemplateChange(option.id)}
                      className="flex items-center justify-between"
                    >
                      {option.name}
                      {selectedTemplateId === option.id && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="text-primary focus:bg-primary/10 focus:text-primary"
                  >
                    <Link
                      to="/budget-template"
                      className="flex w-full cursor-pointer items-center gap-2 font-medium"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Manage Templates
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ℹ️ INFO TOOLTIP */}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="flex h-6 w-6 cursor-help items-center justify-center rounded-full hover:bg-muted">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-72 p-4 shadow-xl">
                    <div className="space-y-2">
                      <p className="text-xs font-bold tracking-tight uppercase">
                        Template Guidance
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        This budget plan uses a default entry layout. To change
                        calculation logic, column visibility, or formatting,
                        navigate to the template manager.
                      </p>
                      <Link
                        to="/budget-template"
                        className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        Go to Budget Template Page{" "}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button
              onClick={onExportCsv}
              size="sm"
              variant="outline"
              className="rounded-full"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>

            {onSaveRecord && (
              <Button
                disabled={!isFormValid}
                onClick={onSaveRecord}
                size="sm"
                variant="default"
                className="rounded-full px-5"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        open={isRefreshConfirmOpen}
        onOpenChange={setIsRefreshConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard draft changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Refreshing now will clear your current draft session and return
              you to the project search view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button size="sm" variant="outline">
                Keep Editing
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button size="sm" onClick={confirmRefresh}>
                Reload Drafts
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}
