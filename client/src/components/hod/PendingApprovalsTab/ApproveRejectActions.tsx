import { useState } from 'react';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';

export function ApproveRejectActions({
  requestId,
  onApprove,
  onReject,
  isPending,
}: {
  requestId: number;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" disabled={isPending} onClick={() => onApprove(requestId)}>Approve</Button>
        <Button size="sm" variant="destructive" disabled={isPending} onClick={() => setOpen(true)}>Reject</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject request</DialogTitle>
            <DialogDescription>Provide a short reason before rejecting this request.</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={isPending || !reason.trim()}
              onClick={() => {
                onReject(requestId, reason.trim());
                setReason('');
                setOpen(false);
              }}
            >
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
