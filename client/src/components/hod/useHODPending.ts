import { useEffect, useState } from 'react';
import { useApp } from '@/hooks/useApp';
import { fetchHodPendingApprovals } from '@/lib/access-request-api';
import type { ApprovalItem } from './hod.types';

export const useHODPending = () => {
  const { currentUser } = useApp();
  const [data, setData] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    if (!currentUser?.employeeId && !currentUser?.id) return;

    try {
      setIsLoading(true);
      const hodId = currentUser.employeeId ?? currentUser.id;
      const rows = await fetchHodPendingApprovals(hodId);
      setData(rows);
    } catch (error) {
      console.error('Failed to load HOD pending approvals', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const guardedLoad = async () => {
      if (cancelled) return;
      await load();
    };

    guardedLoad();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  return { data, isLoading, reload: load };
};
