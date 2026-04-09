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
  onSelectNotification: (notification: NotificationItem) => void | Promise<void>
}

function NotificationSheet({
  isOpen,
  notifications,
  onOpenChange,
  onSelectNotification,
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
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <NotificationCard
                key={item.auditId}
                item={item}
                onSelect={onSelectNotification}
              />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notifications available.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function NotificationCard({
  item,
  onSelect,
}: {
  item: NotificationItem
  onSelect: (notification: NotificationItem) => void | Promise<void>
}) {
  return (
    <button
      className="block w-full rounded-[1rem] border border-border bg-card p-4 text-left transition-colors hover:bg-accent/40"
      onClick={() => void onSelect(item)}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!item.isRead ? (
            <span className="size-2 rounded-full bg-primary" />
          ) : null}
          <p className="font-semibold">{item.eventType}</p>
        </div>
        <span className="text-xs text-muted-foreground">{item.createdOn}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        {item.recipientRole} • Request #{item.accessReqId}
      </p>
    </button>
  )
}

export default NotificationSheet
