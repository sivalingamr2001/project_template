import { useData } from '../../context/DataContext';

export const useActiveAccess = () => {
  const { requests } = useData();

  const data = requests
    .flatMap((request) =>
      request.items
        .filter((item) => item.status === 'ACTIVE')
        .map((item, index) => ({
          id: Number(`${request.id.replace(/\D/g, '') || '0'}${index}`),
          employeeName: request.requesterName,
          empId: request.requesterId,
          folderName: item.system,
          accessType: item.accessType,
          status: item.status,
          expiresAt: item.expiresAt,
        }))
    );

  return { data, isLoading: false };
};
