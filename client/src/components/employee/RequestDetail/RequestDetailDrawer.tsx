import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { RequestTimeline } from "./RequestTimeline"
import type { AccessRequest } from "@/lib/types"

interface RequestDetailDrawerProps {
  open: boolean
  request?: AccessRequest
  onClose: () => void
}

export function RequestDetailDrawer({ open, request, onClose }: RequestDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Request #{request?.id}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <RequestTimeline request={request} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
