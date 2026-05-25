export interface SearchProjectResult {
  productNo: string;
  revision: string;
  projectNumber: string;
  projectName: string;
}

export interface SearchPartResult {
  partNumber: string;
  partName: string;
  partType?: string;
  rev?: string;
}

interface ApiListEnvelope<T> {
  data: T[];
}

import { axiosInstance } from "./axiosInstance";

const unwrapSearchList = <T>(response: T[] | ApiListEnvelope<T>): T[] => {
  if (Array.isArray(response)) return response;
  return Array.isArray(response?.data) ? response.data : [];
};

export const useSearchApi = {
  /**
   * Performs a paginated search for project headers across product numbers and titles.
   */
  searchProjects: async (
    query: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<SearchProjectResult[]> => {
    const response = await axiosInstance.get<SearchProjectResult[] | ApiListEnvelope<SearchProjectResult>>(
      "/requisitions/projects",
      {
        params: { query, page, pageSize },
      }
    );

    return unwrapSearchList(response.data);
  },

  /**
   * Performs a paginated search for individual parts across component inventories.
   */
  searchParts: async (
    query: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<SearchPartResult[]> => {
    const response = await axiosInstance.get<SearchPartResult[] | ApiListEnvelope<SearchPartResult>>(
      "/requisitions/parts",
      {
        params: { query, page, pageSize },
      }
    );

    return unwrapSearchList(response.data);
  },
};
