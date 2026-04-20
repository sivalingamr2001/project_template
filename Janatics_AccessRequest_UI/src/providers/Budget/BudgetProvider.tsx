import { useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { BudgetContext, type BudgetContextType } from './BudgetContext';
import type { BudgetRecord } from '@/features/budget/types';
import { apiService, type ApiError } from '@/shared/lib/api-client';
import { toast } from 'sonner';

interface BudgetProviderProps {
  children: ReactNode;
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'statusCode' in error;
}

function BudgetProvider({ children }: BudgetProviderProps) {
  const [budgetRecords, setBudgetRecords] = useState<BudgetRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<BudgetRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNotFound = useCallback((message: string) => {
    setError(null);
    toast(message);
  }, []);

  const fetchBudgetRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get<BudgetRecord[]>('/budget/records');
      setBudgetRecords(response.data);
    } catch (err: unknown) {
      if (isApiError(err) && err.statusCode === 404) {
        setBudgetRecords([]);
        handleNotFound('No budget records found.');
      } else {  
        setError(isApiError(err) ? err.message : 'Failed to fetch budget records');
      }
    } finally {
      setLoading(false);
    }
  }, [handleNotFound]);

  const fetchBudgetRecord = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get<BudgetRecord>(`/budget/records/${id}`);
      setActiveRecord(response.data);
    } catch (err: unknown) {
      if (isApiError(err) && err.statusCode === 404) {
        setActiveRecord(null);
        handleNotFound('Budget record not found.');
      } else {
        setError(isApiError(err) ? err.message : 'Failed to fetch budget record');
      }
    } finally {
      setLoading(false);
    }
  }, [handleNotFound]);

  const createBudgetRecord = useCallback(async (record: Omit<BudgetRecord, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.post<BudgetRecord>('/budget/records', record);
      setBudgetRecords(prev => [...prev, response.data]);
      setActiveRecord(response.data);
    } catch (err: unknown) {
      if (isApiError(err) && err.statusCode === 404) {
        handleNotFound('Budget record endpoint not found.');
      } else {
        setError(isApiError(err) ? err.message : 'Failed to create budget record');
      }
    } finally {
      setLoading(false);
    }
  }, [handleNotFound]);

  const updateBudgetRecord = useCallback(async (id: string, updates: Partial<BudgetRecord>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.put<BudgetRecord>(`/budget/records/${id}`, updates);
      setBudgetRecords(prev =>
        prev.map(record => record.id === id ? response.data : record)
      );
      if (activeRecord?.id === id) {
        setActiveRecord(response.data);
      }
    } catch (err: unknown) {
      if (isApiError(err) && err.statusCode === 404) {
        setActiveRecord(current => current?.id === id ? null : current);
        setBudgetRecords(prev => prev.filter(record => record.id !== id));
        handleNotFound('Budget record not found.');
      } else {
        setError(isApiError(err) ? err.message : 'Failed to update budget record');
      }
    } finally {
      setLoading(false);
    }
  }, [activeRecord, handleNotFound]);

  const deleteBudgetRecord = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.delete(`/budget/records/${id}`);
      setBudgetRecords(prev => prev.filter(record => record.id !== id));
      if (activeRecord?.id === id) {
        setActiveRecord(null);
      }
    } catch (err: unknown) {
      if (isApiError(err) && err.statusCode === 404) {
        setBudgetRecords(prev => prev.filter(record => record.id !== id));
        if (activeRecord?.id === id) {
          setActiveRecord(null);
        }
        handleNotFound('Budget record not found.');
      } else {
        setError(isApiError(err) ? err.message : 'Failed to delete budget record');
      }
    } finally {
      setLoading(false);
    }
  }, [activeRecord, handleNotFound]);

  const contextValue: BudgetContextType = {
    budgetRecords,
    activeRecord,
    loading,
    error,
    fetchBudgetRecords,
    fetchBudgetRecord,
    createBudgetRecord,
    updateBudgetRecord,
    deleteBudgetRecord,
    setActiveRecord,
  };

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
}

export default BudgetProvider;

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
