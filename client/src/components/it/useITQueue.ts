import { useEffect, useState } from 'react';
import { useApp } from '@/hooks/useApp';
import { fetchItPendingApprovals } from '@/lib/access-request-api';
import type { ITQueueItem } from './it.types';

export const useITQueue = () => {
  const { currentUser } = useApp();
  const [data, setData] = useState<ITQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    if (!currentUser?.employeeId && !currentUser?.id) return;

    try {
      setIsLoading(true);
      const infraId = currentUser.employeeId ?? currentUser.id;
      const rows = await fetchItPendingApprovals(infraId);
      setData(rows);
    } catch (error) {
      console.error('Failed to load IT queue', error);
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
