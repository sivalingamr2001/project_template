import { useState, useEffect } from "react";
import { useDebounce } from "./use-debounce";
import { useSearchApi, type SearchPartResult, type SearchProjectResult } from "@/core/api/useSearch";

export interface UseSearchResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to search projects with automatic debouncing
 * @param query Search query string
 * @param page Page number (default: 1)
 * @param pageSize Page size (default: 10)
 * @param debounceDelay Debounce delay in milliseconds (default: 500)
 * @returns Search results with loading and error states
 */
export function useSearchProjects(
  query: string,
  page: number = 1,
  pageSize: number = 10,
  debounceDelay: number = 500
): UseSearchResult<SearchProjectResult> {
  const [data, setData] = useState<SearchProjectResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, debounceDelay);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setData([]);
      setError(null);
      return;
    }

    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await useSearchApi.searchProjects(
          debouncedQuery,
          page,
          pageSize
        );
        setData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search projects");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [debouncedQuery, page, pageSize]);

  return { data, isLoading, error };
}

/**
 * Hook to search parts with automatic debouncing
 * @param query Search query string
 * @param page Page number (default: 1)
 * @param pageSize Page size (default: 10)
 * @param debounceDelay Debounce delay in milliseconds (default: 500)
 * @returns Search results with loading and error states
 */
export function useSearchParts(
  query: string,
  page: number = 1,
  pageSize: number = 10,
  debounceDelay: number = 500
): UseSearchResult<SearchPartResult> {
  const [data, setData] = useState<SearchPartResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, debounceDelay);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setData([]);
      setError(null);
      return;
    }

    const fetchParts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await useSearchApi.searchParts(
          debouncedQuery,
          page,
          pageSize
        );
        setData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search parts");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParts();
  }, [debouncedQuery, page, pageSize]);

  return { data, isLoading, error };
}
