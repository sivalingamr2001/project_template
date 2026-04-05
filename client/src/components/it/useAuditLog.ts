import { useData } from '../../context/DataContext';

export const useAuditLog = (filter: string) => {
  const { requests } = useData();

  const data = requests.flatMap((request, requestIndex) =>
    request.approvalTimeline.map((entry, entryIndex) => ({
      id: requestIndex * 100 + entryIndex,
      action: entry.action,
      actor: entry.approverName,
      createdOn: entry.timestamp,
    }))
  ).filter((item) => filter === 'All' || item.action === filter);

  return { data, isLoading: false };
};
