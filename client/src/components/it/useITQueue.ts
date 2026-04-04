import { useData } from '../../context/DataContext';

export const useITQueue = () => {
  const { requests } = useData();

  const data = requests
    .flatMap((request) =>
      request.items
        .filter((item) => item.status === 'APPROVED_HOD')
        .map((item, index) => ({
          id: request.id * 100 + index,
          requestId: request.id,
          employeeName: request.requesterName,
          empId: request.requesterId,
          folderName: item.system,
          accessType: item.accessType,
          status: item.status,
        }))
    );

  return { data, isLoading: false };
};
