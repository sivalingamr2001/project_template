import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import type { NotificationItem } from "@/features/access-workspace/types"

type NotificationSheetProps = {
  isOpen: boolean
  notifications: NotificationItem[]
  onOpenChange: (isOpen: boolean) => void
}

function NotificationSheet({
  isOpen,
  notifications,
  onOpenChange,
}: NotificationSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:max-w-[420px]">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Recent request activity for your workspace.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-3 overflow-y-auto px-4 pb-4">
          {notifications.map((item) => (
            <NotificationCard key={item.auditId} item={item} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function NotificationCard({ item }: { item: NotificationItem }) {
  return (
    <article className="rounded-[1rem] border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{item.eventType}</p>
        <span className="text-xs text-muted-foreground">{item.createdOn}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        {item.recipientRole} • Request #{item.accessReqId}
      </p>
    </article>
  )
}

export default NotificationSheet
