import { axiosInstance } from "./axiosInstance";
import type { RequisitionDocument } from "@/types";

interface ApiEnvelope<T> {
  data: T;
}

interface ApiListEnvelope<T> {
  data: T[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

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
  status: string;
  parts: ApiRequisitionPart[];
  preparedBy?: string | null;
  preparedDate?: string | null;
  checkedBy?: string | null;
  checkedDate?: string | null;
  approvedBy?: string | null;
  approvedDate?: string | null;
  receivedBy?: string | null;
  receivedDate?: string | null;
}

export interface RequisitionSignaturePayload {
  name: string;
  date: string;
}

export interface RequisitionPartPayload {
  partNo: string;
  rev: string;
  partName: string;
  qty: number;
  requiredDate: string | null;
  committedDate: string | null;
  actualCompletionDate: string | null;
}

export interface RequisitionPayload {
  date: string;
  pageNo: string;
  fromTeam: string;
  toTeam: string;
  productNo: string;
  productRev: string;
  projectNo: string;
  productName: string;
  purpose: string;
  monthlyQty: string;
  parts: RequisitionPartPayload[];
  prepared: RequisitionSignaturePayload;
  checked: RequisitionSignaturePayload;
  moqWarningAccepted?: boolean;
}

const toDate = (value?: string | null): Date | undefined => {
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

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
  purpose: item.purpose,
  monthlyQty: item.monthlyQty,
  status: item.status,
  parts: (item.parts ?? []).map((part) => ({
    ...part,
    requiredDate: toDate(part.requiredDate) ?? null,
    committedDate: toDate(part.committedDate) ?? null,
    actualCompletionDate: toDate(part.actualCompletionDate) ?? null,
  })),
  preparedBy: item.preparedBy ?? undefined,
  preparedDate: toDate(item.preparedDate),
  checkedBy: item.checkedBy ?? undefined,
  checkedDate: toDate(item.checkedDate),
  approvedBy: item.approvedBy ?? undefined,
  approvedDate: toDate(item.approvedDate),
  receivedBy: item.receivedBy ?? undefined,
  receivedDate: toDate(item.receivedDate),
});

const unwrapList = (response: ApiRequisition[] | ApiListEnvelope<ApiRequisition>): ApiRequisition[] => {
  if (Array.isArray(response)) return response;
  return Array.isArray(response?.data) ? response.data : [];
};

const unwrapItem = (response: ApiRequisition | ApiEnvelope<ApiRequisition>): ApiRequisition => {
  if ("data" in response) {
    return response.data;
  }

  return response;
};

export const useRequestionApi = {
  fetchRequisitions: async (): Promise<RequisitionDocument[]> => {
    const response = await axiosInstance.get<ApiRequisition[] | ApiListEnvelope<ApiRequisition>>(
      "/requisitions",
    );

    return unwrapList(response.data).map(mapRequisition);
  },

  fetchRequisition: async (recNo: string): Promise<RequisitionDocument> => {
    const response = await axiosInstance.get<ApiRequisition | ApiEnvelope<ApiRequisition>>(
      `/requisitions/${encodeURIComponent(recNo)}`,
    );

    return mapRequisition(unwrapItem(response.data));
  },

  createRequisition: async (payload: RequisitionPayload): Promise<RequisitionDocument> => {
    const response = await axiosInstance.post<ApiEnvelope<ApiRequisition>>(
      "/requisitions",
      payload,
    );

    return mapRequisition(response.data.data);
  },

  updateRequisition: async (
    recNo: string,
    payload: RequisitionPayload,
  ): Promise<RequisitionDocument> => {
    const response = await axiosInstance.put<ApiEnvelope<ApiRequisition>>(
      `/requisitions/${encodeURIComponent(recNo)}`,
      payload,
    );

    return mapRequisition(response.data.data);
  },

  deleteRequisition: async (recNo: string): Promise<void> => {
    await axiosInstance.delete(`/requisitions/${encodeURIComponent(recNo)}`);
  },

  submitRequisition: async (
    recNo: string,
    payload: { checkedBy: string; checkDate: string },
  ): Promise<RequisitionDocument> => {
    const response = await axiosInstance.post<ApiEnvelope<ApiRequisition>>(
      `/requisitions/${encodeURIComponent(recNo)}/submit`,
      payload,
    );

    return mapRequisition(response.data.data);
  },

  approveRequisition: async (
    recNo: string,
    payload: { approvedBy: string; approvalDate: string; comments: string },
  ): Promise<RequisitionDocument> => {
    const response = await axiosInstance.post<ApiEnvelope<ApiRequisition>>(
      `/requisitions/${encodeURIComponent(recNo)}/approve`,
      payload,
    );

    return mapRequisition(response.data.data);
  },
};
