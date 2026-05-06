import type { BudgetRecord } from "@/features/budget/types"
import type { TemplateOption } from "@/features/budget/utils/budgetTemplates"
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
import {
  ChevronDown,
  ExternalLink,
  FileDown,
  Info,
  Save,
  Settings2,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import ApproveModal from "./ApproveModal"
import { Badge } from "@/shared/components/ui/badge"
import { useAuth } from "@/providers/auth-provider"

interface ProjectHeaderProps {
  record: BudgetRecord
  onSaveRecord?: () => Promise<void>
  onDiscardChanges: () => void
  onExportCsv: () => void | Promise<void>
  isExporting?: boolean
  selectedTemplateId: string
  onTemplateChange: (value: string) => void
  templateOptions: TemplateOption[]
}

export function ProjectHeader({
  record,
  onSaveRecord,
  onDiscardChanges,
  onExportCsv,
  isExporting = false,
  selectedTemplateId,
  onTemplateChange,
  templateOptions,
}: ProjectHeaderProps) {
  const [isRefreshConfirmOpen, setIsRefreshConfirmOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const navigate = useNavigate()
  const isApproved = record.projectHeader.approvalStatus === "Approved"
  const { user } = useAuth()

  const isFormValid = Boolean(
    record.projectHeader.projectNumber && record.projectHeader.productNo
  )

  const { projectHeader } = record
  const selectedTemplateName =
    templateOptions.find((t) => t.id === selectedTemplateId)?.name ||
    "Select template"

  // Dynamic background based on active/inactive status
  const bgGradient = projectHeader.isActive
    ? "bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-transparent dark:from-emerald-950/30 dark:via-emerald-950/15 dark:to-transparent"
    : "bg-gradient-to-r from-red-50 via-red-50/50 to-transparent dark:from-red-900/30 dark:via-red-900/15 dark:to-transparent"

  const borderColor = projectHeader.isActive
    ? "border-emerald-200 dark:border-emerald-800"
    : "border-red-200 dark:border-red-800"

  function confirmRefresh() {
    onDiscardChanges()
    setIsRefreshConfirmOpen(false)
    toast.success("Changes cleared. Returning to the project search view.")
  }

  return (
    <div
      className={`relative rounded-xs border-2 ${borderColor} ${bgGradient} px-4 py-4 shadow-sm transition-all duration-300`}
    >
      {/* Background decoration for active state */}
      {projectHeader.isActive && (
        <div className="absolute inset-0 rounded-xs opacity-[0.02] pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl -z-10" />
        </div>
      )}

      <div className="flex flex-col md:gap-0">
        {/* TOP SECTION: Project Info + Status */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Project Information */}
          <div className="flex-1">
            {/* TOP: Primary Title */}
            <div className="flex gap-4 mb-4">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {projectHeader.productName}
              </h1>
              <div className="h-6 mt-1 w-px rounded-full bg-muted-foreground/40" />
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                {/* Active/Inactive Badge */}
                <Badge
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold border transition-all ${projectHeader.isActive
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    }`}
                >
                  {projectHeader.isActive ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  {projectHeader.isActive ? "Active" : "Inactive"}
                </Badge>

                {/* Approval Status Badge */}
                {projectHeader.approvalStatus && (
                  <Badge
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold border ${projectHeader.approvalStatus === "Pending"
                      ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                      : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                      }`}
                  >
                    {projectHeader.approvalStatus}
                  </Badge>
                )}
              </div>
            </div>

            {/* BOTTOM: Metadata Row */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-muted-foreground">Project ID:</span>
                <span className="font-medium text-foreground">{projectHeader.projectNumber}</span>
              </div>

              {/* Small Dot Separator */}
              <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-muted-foreground">Product No:</span>
                <span className="font-medium text-foreground">{projectHeader.productNo}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />


              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground font-medium">Updated:</span>
                <span className="font-semibold text-foreground">
                  {formatDate(projectHeader.lastUpdated)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Status Badges */}
          < div className="flex flex-col items-end gap-0">
            <div className="flex items-center mb-2.5 gap-1.5 h-7.5 rounded-full border border-border/60 bg-card/50 backdrop-blur-sm p-1.5 pr-2.5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1.5 pl-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:inline">
                  Template
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 rounded-full px-3 text-xs font-semibold hover:bg-accent"
                  >
                    {selectedTemplateName}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="text-sm font-semibold">
                    Budget Layouts
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {templateOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => onTemplateChange(option.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      {option.name}
                      {selectedTemplateId === option.id && (
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/budget-template"
                      className="flex w-full cursor-pointer items-center gap-2 font-medium text-emerald-600 hover:text-emerald-700 focus:bg-emerald-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Manage Templates
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Info Tooltip */}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button className="flex h-7 w-7 cursor-help items-center justify-center rounded-full hover:bg-muted/60 transition-colors">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-72 p-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-tight">
                        Template Information
                      </p>
                      <p className="text-xs leading-relaxed">
                        Switch between different budget layouts to customize
                        calculation logic, column visibility, and formatting
                        options.
                      </p>
                      <Link
                        to="/budget-template"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline pt-1"
                      >
                        View Template Manager
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-px w-full rounded-full bg-muted-foreground/0" />

            <div className="flex items-end">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                {/* Right: Action Controls */}
                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  {/* Approve button */}
                  {projectHeader.approvalStatus === "Pending" && (
                    <Button
                      size="sm"
                      onClick={() => setIsApproveModalOpen(true)}
                      className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
                    >
                      Review & Approve
                    </Button>
                  )}
                  {/* Export Button */}
                  {user?.role === 'User' && (
                    <Button
                      disabled={isExporting}
                      onClick={onExportCsv}
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <FileDown className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {isExporting ? "Exporting..." : "Export"}
                      </span>
                      <span className="sm:hidden">
                        {isExporting ? "..." : "Export"}
                      </span>
                    </Button>
                  )}

                  {onSaveRecord && isApproved === false && user?.role === 'User' && (
                    <Button
                      disabled={!isFormValid}
                      onClick={onSaveRecord}
                      size="sm"
                      className={`rounded-full gap-2 font-semibold transition-all ${isFormValid
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                    >
                      <Save className="h-4 w-4" />
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Last Updated + Actions */}

      </div>

      {/* Approve Modal */}
      {projectHeader?.id && (
        <ApproveModal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          budgetId={projectHeader.id}
          onSuccess={() => {
            navigate("/plan-entry")
            toast.success("Budget status updated")
          }}
        />
      )}

      {/* Refresh Confirmation Dialog */}
      <AlertDialog
        open={isRefreshConfirmOpen}
        onOpenChange={setIsRefreshConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Leaving now will clear the unsaved changes and return you to the
              project search view. This action cannot be undone.
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
                Discard Changes
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
