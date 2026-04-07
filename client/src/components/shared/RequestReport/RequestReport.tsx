import { useCallback, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RequestReportTabs } from "./components/RequestReportTabs"
import { RequestReportSummaryCard } from "./components/RequestReportSummaryCard"
import { DetailsTab } from "./tabs/DetailsTab"
import { PolicyTab } from "./tabs/PolicyTab"
import { ITDeptTab } from "./tabs/ITDeptTab"
import type { RequestReportProps, RequestReportTabId } from "./types"

export function RequestReport(props: RequestReportProps) {
  const { request, open, onOpenChange, onResubmit, isResubmitting } = props

  const [tab, setTab] = useState<RequestReportTabId>("details")

  const handleTabChange = useCallback((next: RequestReportTabId) => {
    setTab(next)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden border-none p-0 pt-4 pb-4 pl-4 shadow-2xl sm:max-w-5xl">
        <ScrollArea
          type="hover"
          className="h-[90vh] w-full **:data-[orientation=vertical]:w-1.5 **:data-[orientation=vertical]:bg-transparent **:data-[state=visible]:rounded-full **:data-[state=visible]:bg-transparent **:data-[state=visible]:transition-colors hover:**:data-[state=visible]:bg-muted-foreground/40"
        >
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Access Request #{request.id} Report
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Review the request details and resubmit if required.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 p-5">
            <RequestReportSummaryCard
              request={request}
              onResubmit={onResubmit}
              isResubmitting={isResubmitting}
            />

            <div className="mb-10 flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
              <RequestReportTabs tab={tab} onTabChange={handleTabChange} />
              {tab === "details" && <DetailsTab request={request} />}
              {tab === "policy" && <PolicyTab />}
              {tab === "itdept" && <ITDeptTab request={request} />}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default RequestReport

