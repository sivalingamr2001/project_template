import { useData } from '../../context/DataContext';

export const useEmployeeLookup = (empId: string) => {
  const { requests } = useData();

  if (!empId.trim()) {
    return { data: undefined, isLoading: false };
  }

  const employeeRequests = requests.filter((request) =>
    request.requesterId.toLowerCase().includes(empId.toLowerCase())
  );

  if (employeeRequests.length === 0) {
    return { data: undefined, isLoading: false };
  }

  const first = employeeRequests[0];
  const accesses = employeeRequests.flatMap((request, index) =>
    request.items.map((item, itemIndex) => ({
      id: Number(`${index}${itemIndex}`),
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
      active: accesses.filter((item) => item.status === 'ACTIVE').length,
      pending: accesses.filter((item) => item.status === 'PENDING').length,
      expired: accesses.filter((item) => item.status === 'EXPIRED').length,
      accesses,
    },
    isLoading: false,
  };
};
