import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useData } from '@/context/DataContext';
import { useApp } from '@/hooks/useApp';

export const useHODApprove = () => {
  const { approveItem, refreshData } = useData();
  const { currentUser } = useApp();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (
      requestId: number,
      itemId: number,
      options?: { accessType?: string; comment?: string; durationDays?: number }
    ) => {
      try {
        setIsPending(true);
        const result = await approveItem(
          requestId,
          itemId,
          options?.comment,
          options?.accessType as any,
          options?.accessType as any,
          options?.durationDays || 365
        );

        if (result) {
          toast.success(`Request approved by ${currentUser?.name || 'HOD'}. Duration: ${options?.durationDays || 365} days`);
          await refreshData();
        } else {
          toast.error('Failed to approve request');
        }
      } catch (error) {
        toast.error(`Error approving request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('HOD approve error:', error);
      } finally {
        setIsPending(false);
      }
    },
    [approveItem, refreshData, currentUser]
  );

  return {
    mutate,
    isPending,
  };
};
