import { axiosInstance } from "./axiosInstance";
import type { AuthResponse, LoginPayload } from "@/types/common.types";
import type { RequisitionDocument } from "@/types";

interface ApiRequisitionPart {
  sNo: number;
  partNo: string;
  rev: string;
  partName: string;
  qty: number;
  requiredDate: string | null;
  committedDate: string | null;
  actualCompletionDate?: string | null;
}

interface ApiRequisition {
  recNo: string;
  date: string;
  pageNo: string;
  fromTeam: string;
  toTeam: string;
  productNo: string;
  productRev: string;
  projectNo: string;
  productName: string;
  purpose: string;
  monthlyQty: number;
  parts: ApiRequisitionPart[];
  preparedBy?: string;
  preparedDate?: string;
  checkedBy?: string;
  checkedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  receivedBy?: string;
  receivedDate?: string;
}

const mapRequisition = (item: ApiRequisition): RequisitionDocument => ({
  recNo: item.recNo,
  date: new Date(item.date),
  pageNo: item.pageNo,
  fromTeam: item.fromTeam,
  toTeam: item.toTeam,
  productNo: item.productNo,
  productRev: item.productRev,
  projectNo: item.projectNo,
  productName: item.productName,
  purpose: item.purpose as RequisitionDocument["purpose"],
  monthlyQty: item.monthlyQty,
  parts: item.parts.map((part) => ({
    ...part,
    requiredDate: part.requiredDate ? new Date(part.requiredDate) : null,
    committedDate: part.committedDate ? new Date(part.committedDate) : null,
    actualCompletionDate: part.actualCompletionDate ? new Date(part.actualCompletionDate) : null,
  })),
  preparedBy: item.preparedBy,
  preparedDate: item.preparedDate ? new Date(item.preparedDate) : undefined,
  checkedBy: item.checkedBy,
  checkedDate: item.checkedDate ? new Date(item.checkedDate) : undefined,
  approvedBy: item.approvedBy,
  approvedDate: item.approvedDate ? new Date(item.approvedDate) : undefined,
  receivedBy: item.receivedBy,
  receivedDate: item.receivedDate ? new Date(item.receivedDate) : undefined,
});

const normalizeList = (response: unknown): ApiRequisition[] => {
  if (Array.isArray(response)) return response as ApiRequisition[];
  if (response && typeof response === "object") {
    const value = (response as Record<string, unknown>).data ?? response;
    if (Array.isArray(value)) return value as ApiRequisition[];
  }
  return [];
};

export const useRequestionApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },

  fetchRequisitions: async (): Promise<RequisitionDocument[]> => {
    const response = await axiosInstance.get<unknown>("/requisitions");
    return normalizeList(response.data).map(mapRequisition);
  },

  fetchRequisition: async (recNo: string): Promise<RequisitionDocument> => {
    const response = await axiosInstance.get<ApiRequisition>(`/requisitions/${encodeURIComponent(recNo)}`);
    return mapRequisition(response.data);
  },

  createRequisition: async (payload: unknown): Promise<void> => {
    await axiosInstance.post("/requisitions", payload);
  },

  updateRequisition: async (recNo: string, payload: unknown): Promise<void> => {
    await axiosInstance.put(`/requisitions/${encodeURIComponent(recNo)}`, payload);
  },

  deleteRequisition: async (recNo: string): Promise<void> => {
    await axiosInstance.delete(`/requisitions/${encodeURIComponent(recNo)}`);
  },

  submitRequisition: async (recNo: string, payload: unknown): Promise<void> => {
    await axiosInstance.post(`/requisitions/${encodeURIComponent(recNo)}/submit`, payload);
  },

  approveRequisition: async (recNo: string, payload: unknown): Promise<void> => {
    await axiosInstance.post(`/requisitions/${encodeURIComponent(recNo)}/approve`, payload);
  },
};
