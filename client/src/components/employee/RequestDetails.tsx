import { useState } from "react"
import { toast } from "sonner"
import { useApp } from "@/context/AppContext"
import { useData } from "@/context/DataContext"
import DialogPage from "./DialogPage"
import RequestReport from "../shared/Report"
import { DetailsHeader } from "./RequestDetails/DetailsHeader"
import { NoSelectedItemState } from "./RequestDetails/NoSelectedItemState"
import { HeroCard } from "./RequestDetails/HeroCard"
import { LeftColumn } from "./RequestDetails/LeftColumn"
import { RightColumn } from "./RequestDetails/RightColumn"
import { buildResubmitPayload, getBackPage, getWorkflowSteps } from "./RequestDetails/utils"
import type { DialogActionType } from "./RequestDetails/types"
import { useLegacyNavigation } from "@/routes/useLegacyNavigation"

export function RequestDetails() {
  const { requests, addRequest } = useData()
  const { currentUser, currentRole, selectedRequestId, selectedAccessItemId, setSelectedAccessItemId } = useApp()
  const { goTo } = useLegacyNavigation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogActionType, setDialogActionType] = useState<DialogActionType>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [isResubmitting, setIsResubmitting] = useState(false)
  const request = requests.find((item) => item.id === selectedRequestId)
  const selectedItem = selectedAccessItemId ? request?.items.find((item) => item.id === selectedAccessItemId) : undefined
  const backPage = getBackPage(currentRole)
  const handleBack = () => goTo(backPage)
  const handleOpenReport = () => setReportOpen(true)
  const handleApprove = () => { if (selectedItem) { setSelectedAccessItemId(selectedItem.id); setDialogActionType("APPROVE"); setIsDialogOpen(true) } }
  const handleReject = () => { if (selectedItem) { setSelectedAccessItemId(selectedItem.id); setDialogActionType("REJECT"); setIsDialogOpen(true) } }
  const handleResubmit = async () => {
    if (!request) return
    setIsResubmitting(true)
    try { await addRequest(buildResubmitPayload(request)); toast.success("Request resubmitted successfully"); setReportOpen(false) }
    catch (error) { console.error("Resubmit failed", error); toast.error("Unable to resubmit the request") }
    finally { setIsResubmitting(false) }
  }
  if (!request) return <div className="py-8 text-center"><p className="text-muted-foreground">Request not found</p></div>
  if (!selectedItem) return <NoSelectedItemState onBack={handleBack} />
  const selectedItemTimeline = request.approvalTimeline.filter((record) => record.accessItemId === selectedItem.id)
  const itemsMap = new Map(request.items.map((item) => [item.id, item.system]))
  const canReview = (currentRole === "HOD" && selectedItem.status === "PendingHOD") || (currentRole === "IT" && selectedItem.status === "PendingIT")
  const stepCards = getWorkflowSteps(selectedItem)
  return (
    <div className="space-y-6">
      <DetailsHeader onBack={handleBack} onOpenReport={handleOpenReport} />
      <RequestReport request={request} open={reportOpen} onOpenChange={setReportOpen} onResubmit={request.requesterId === currentUser?.id && request.status === "Rejected" ? handleResubmit : undefined} isResubmitting={isResubmitting} />
      <HeroCard request={request} selectedItem={selectedItem} stepCards={stepCards} />
      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
        <LeftColumn request={request} selectedItem={selectedItem} onSelectItem={setSelectedAccessItemId} />
        <RightColumn request={request} selectedItem={selectedItem} selectedItemTimeline={selectedItemTimeline} itemsMap={itemsMap} canReview={canReview} onApprove={handleApprove} onReject={handleReject} />
      </div>
      <DialogPage open={isDialogOpen} onOpenChange={setIsDialogOpen} actionType={dialogActionType} onActionTypeChange={setDialogActionType} />
      {request.rejectionReason ? <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-6 text-destructive shadow-sm"><p className="mb-2 font-semibold">Rejection Reason</p><p className="text-sm">{request.rejectionReason}</p></div> : null}
    </div>
  )
}
