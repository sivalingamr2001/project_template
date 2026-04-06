import { useData } from "../../context/DataContext";

export function useITAllRequests() {
  const { requests } = useData();

  // For IT users, return all requests from the dashboard data
  // In a real implementation, this might require a separate API call with admin permissions
  return {
    requests,
    isLoading: false,
    error: null,
    refetch: () => {
      // In a real implementation, this would refetch data
      console.log("Refetch not implemented for IT All Requests");
    },
  };
}