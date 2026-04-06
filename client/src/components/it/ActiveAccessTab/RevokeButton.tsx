import { Button } from '../../ui/button';

export function RevokeButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Button variant="destructive" size="sm" onClick={onConfirm}>
      Revoke
    </Button>
  );
}
