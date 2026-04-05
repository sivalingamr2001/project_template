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
  detailId,
  approvalId,
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
  detailId: number;
  approvalId: number;
  employeeName: string;
  empId: number;
  folderName: string;
  accessType: string;
  status: string;
  mode: 'HOD' | 'IT';
  onApprove: (args: { requestId: number; detailId: number; approvalId: number; accessType: string; comment?: string }) => void;
  onReject: (args: { requestId: number; detailId: number; approvalId: number; reason: string }) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [confirmedAccessType, setConfirmedAccessType] = useState(accessType);

  const isIT = mode === 'IT';
  const title = mode === 'HOD' ? 'HOD Review' : 'IT Review';

  const closeModal = () => {
    setOpen(false);
    setComment('');
    setConfirmedAccessType(accessType);
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
              Review requested access details and {isIT ? 'add comments before approving or rejecting.' : 'confirm the requested access type and add comments if needed.'}
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

            <div>
              <Label htmlFor={`status-${requestId}`}>Current Status</Label>
              <Input id={`status-${requestId}`} value={status} disabled />
            </div>

            <div>
              <Label htmlFor={`comments-${requestId}`}>Comments</Label>
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
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              className="mr-2"
              disabled={isPending}
              onClick={() => {
                onApprove({ requestId, detailId, approvalId, accessType: confirmedAccessType, comment: comment.trim() });
                closeModal();
              }}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || !comment.trim()}
              onClick={() => {
                onReject({ requestId, detailId, approvalId, reason: comment.trim() });
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
