import { useCallback, useState, type MouseEvent } from 'react';
import { Bell } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useApp } from "@/context/AppContext"
import { formatDateTime } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, markNotificationAsRead } = useData();
  const { currentRole } = useApp();

  const roleNotifications = notifications.filter(n => n.role === currentRole);
  const unreadCount = roleNotifications.filter(n => !n.read).length;

  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleNotificationClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const notificationId = Number(event.currentTarget.value)
      markNotificationAsRead(notificationId)
      setOpen(false)
    },
    [markNotificationAsRead]
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={handleOpen}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Review the latest request updates and alerts.
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto">
          {roleNotifications.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No notifications available.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {roleNotifications.map(notif => (
                <button
                  key={notif.id}
                  type="button"
                  value={notif.id}
                  onClick={handleNotificationClick}
                  className="w-full text-left p-4 hover:bg-secondary/60 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
