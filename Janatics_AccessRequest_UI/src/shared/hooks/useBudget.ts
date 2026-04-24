import type { BudgetRecord, BudgetSummary } from '@/features/budget/types'
import { useState, useEffect } from 'react'
import { apiService } from '../lib/api-client'

type TrendPoint = {
  label: string
  planned: number
  actual: number
  variance: number
}

// 1. Core Summary Hook
export function useBudgetSummary(period: string = 'monthly', from?: string, to?: string) {
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const { data } = await apiService.get<BudgetSummary>('/budgets/summary', {
          params: { period, from, to }
        })
        setSummary(data)
      } catch (error) {
        console.error('Failed to fetch budget summary', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [period, from, to])

  return { summary, loading }
}

// 2. Trend Hooks
export function useMonthlyTrend(projectNumber?: string) {
  return useTrendData('monthly', projectNumber)
}

export function useQuarterlyTrend(projectNumber?: string) {
  return useTrendData('quarterly', projectNumber)
}

export function useYearlyTrend(projectNumber?: string) {
  return useTrendData('yearly', projectNumber)
}

// Internal shared logic for Trends
function useTrendData(type: string, projectNumber?: string) {
  const [data, setData] = useState<TrendPoint[]>([])

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const { data } = await apiService.get<TrendPoint[]>('/budgets/summary/trend', {
          params: { type, projectNumber }
        })
        setData(data)
      } catch (error) {
        console.error(`Failed to fetch ${type} trend`, error)
      }
    }
    fetchTrend()
  }, [type, projectNumber])

  return data
}

// 3. Project Specific Hooks
export function useProjectBudgets(productNo?: string) {
  const [budgets, setBudgets] = useState<BudgetRecord[]>([])

  useEffect(() => {
    if (!productNo) return
    const fetchSearch = async () => {
      try {
        const { data } = await apiService.get<BudgetRecord[]>('/budget/search', {
          params: { productNo }
        })
        setBudgets(data)
      } catch (error) {
        console.error('Search failed', error)
      }
    }
    fetchSearch()
  }, [productNo])

  return budgets
}

export function useProjectBudget(projectNumber: string) {
  const [budget, setBudget] = useState<BudgetRecord | null>(null)

  useEffect(() => {
    const fetchById = async () => {
      try {
        const { data } = await apiService.get<BudgetRecord>(`/budget/${projectNumber}`)
        setBudget(data)
      } catch (error) {
        console.error('Failed to fetch budget details', error)
      }
    }
    fetchById()
  }, [projectNumber])

  return budget
}
