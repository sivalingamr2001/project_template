import { useState } from 'react';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const accessOptions = ['View Only', 'Read Only', 'Read and Write'];

export function ApproveRejectActions({
  requestId,
  itemId,
  employeeName,
  empId,
  folderName,
  accessType,
  status,
  mode,
  onApprove,
  onReject,
  isPending,
}: {
  requestId: number;
  itemId?: number;
  employeeName: string;
  empId: number;
  folderName: string;
  accessType: string;
  status: string;
  mode: 'HOD' | 'IT';
  onApprove: (id: number, itemId: number, options: { accessType?: string; comment?: string; durationDays?: number }) => void;
  onReject: (id: number, itemId: number, reason: string) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [confirmedAccessType, setConfirmedAccessType] = useState(accessType);
  const [durationDays, setDurationDays] = useState(365);

  const isIT = mode === 'IT';
  const title = mode === 'HOD' ? 'HOD Review' : 'IT Review';
  const actualItemId = itemId || requestId;

  const closeModal = () => {
    setOpen(false);
    setComment('');
    setConfirmedAccessType(accessType);
    setDurationDays(365);
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        View
      </Button>

      <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : closeModal())}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Review requested access details and {isIT ? 'add comments before approving or rejecting.' : 'confirm the requested access type, duration and add comments if needed.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`employee-${requestId}`}>Employee</Label>
                <Input id={`employee-${requestId}`} value={employeeName} disabled />
              </div>
              <div>
                <Label htmlFor={`empId-${requestId}`}>Employee ID</Label>
                <Input id={`empId-${requestId}`} value={empId} disabled />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`folder-${requestId}`}>Folder Path</Label>
                <Input id={`folder-${requestId}`} value={folderName} disabled />
              </div>
              <div>
                <Label htmlFor={`accessType-${requestId}`}>Access Type</Label>
                <Select
                  value={confirmedAccessType}
                  onValueChange={(value) => setConfirmedAccessType(value)}
                  disabled={isIT}
                >
                  <SelectTrigger id={`accessType-${requestId}`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accessOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`status-${requestId}`}>Current Status</Label>
                <Input id={`status-${requestId}`} value={status} disabled />
              </div>
              <div>
                <Label htmlFor={`duration-${requestId}`}>Duration (Days)</Label>
                <Input
                  id={`duration-${requestId}`}
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 365)}
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`comments-${requestId}`}>Comments/Notes</Label>
              <Textarea
                id={`comments-${requestId}`}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                placeholder={isIT ? 'Add comments for IT approval or rejection...' : 'Add comments for HOD review or rejection...'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={isPending}>
              Cancel
            </Button>
            <Button
              className="mr-2"
              disabled={isPending}
              onClick={() => {
                onApprove(requestId, actualItemId, { 
                  accessType: confirmedAccessType, 
                  comment: comment.trim(),
                  durationDays 
                });
                closeModal();
              }}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || !comment.trim()}
              onClick={() => {
                onReject(requestId, actualItemId, comment.trim());
                closeModal();
              }}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
