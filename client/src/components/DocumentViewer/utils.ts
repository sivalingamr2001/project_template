import type { RequisitionFormData } from "./types";

export const fetchMockRequisitionData = (): Promise<RequisitionFormData> => {
  return Promise.reject(
    new Error("Mock requisition data has been removed. Use API data instead."),
  );
};
