import { useData } from '../../context/DataContext';

export const useEmployeeLookup = (empId: number) => {
  const { requests } = useData();

  if (!empId.toString().trim()) {
    return { data: undefined, isLoading: false };
  }

  const employeeRequests = requests.filter((request) =>
    request.requesterId.toString().includes(empId.toString())
  );

  if (employeeRequests.length === 0) {
    return { data: undefined, isLoading: false };
  }

  const first = employeeRequests[0];
  const accesses = employeeRequests.flatMap((request, index) =>
    request.items.map((item, itemIndex) => ({
      id: Number(`${index}${itemIndex}`),
      requestId: request.id,
      employeeName: request.requesterName,
      empId: request.requesterId,
      folderName: item.system,
      accessType: item.accessType,
      status: item.status,
    }))
  );

  return {
    data: {
      empId: first.requesterId,
      empName: first.requesterName,
      department: first.requesterDept,
      active: accesses.filter((item) => item.status === 'Approved').length,
      pending: accesses.filter((item) => item.status === 'PendingHOD' || item.status === 'PendingIT').length,
      expired: accesses.filter((item) => item.status === 'Expired').length,
      accesses,
    },
    isLoading: false,
  };
};
