import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { NewRequestForm } from './NewRequestForm';

interface CreateRequestPayload {
  folderName: string;
  accessType: string;
  reason: string;
  durationDays: number;
}

export function NewRequestModal({
  open,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateRequestPayload) => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Access Request</DialogTitle>
        </DialogHeader>
        <NewRequestForm onSubmit={onSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  );
}