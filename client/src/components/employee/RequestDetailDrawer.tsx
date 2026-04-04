import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { RequestTimeline } from './RequestTimeline';
import type { AccessRequest } from '../../lib/types';

export function RequestDetailDrawer({
  open,
  request,
  onClose,
}: {
  open: boolean;
  request?: AccessRequest;
  onClose: () => void;
}) {
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
  );
}