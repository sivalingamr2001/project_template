import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';

export const useITReject = () => {
  const { rejectItem, refreshData } = useData();
  const { currentUser } = useApp();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (requestId: number, itemId: number, reason: string) => {
      try {
        setIsPending(true);
        const result = await rejectItem(requestId, itemId, reason);

        if (result) {
          toast.success(`Request rejected by ${currentUser?.name || 'IT'}`);
          await refreshData();
        } else {
          toast.error('Failed to reject request');
        }
      } catch (error) {
        toast.error(`Error rejecting request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('IT reject error:', error);
      } finally {
        setIsPending(false);
      }
    },
    [rejectItem, refreshData, currentUser]
  );

  return {
    mutate,
    isPending,
  };
};
