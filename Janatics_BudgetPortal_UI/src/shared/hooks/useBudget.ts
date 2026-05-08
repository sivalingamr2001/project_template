import type { BudgetRecord, BudgetSummary } from "@/features/budget/types"
import { useEffect, useState } from "react"
import { apiService } from "../lib/api-client"

type TrendPoint = {
  label: string
  planned: number
  actual: number
  variance: number
}

// 1. Core Summary Hook
export function useBudgetSummary(
  period: string = "monthly",
  from?: string,
  to?: string,
  teamName?: string
) {
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const params: Record<string, string | undefined> = {
          period,
          from,
          to,
        }

        if (teamName) {
          params.teamName = teamName
        }

        const { data } = await apiService.get<BudgetSummary>(
          "/budgets/summary",
          {
            params,
          }
        )
        setSummary(data)
      } catch (error) {
        console.error("Failed to fetch budget summary", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [period, from, to, teamName])

  return { summary, loading }
}

// 2. Trend Hooks
export function useMonthlyTrend(projectNumber?: string, teamName?: string) {
  return useTrendData("monthly", projectNumber, teamName)
}

export function useQuarterlyTrend(projectNumber?: string, teamName?: string) {
  return useTrendData("quarterly", projectNumber, teamName)
}

export function useYearlyTrend(projectNumber?: string, teamName?: string) {
  return useTrendData("yearly", projectNumber, teamName)
}

// Internal shared logic for Trends
function useTrendData(type: string, projectNumber?: string, teamName?: string) {
  const [data, setData] = useState<TrendPoint[]>([])

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const params: Record<string, string | undefined> = {
          type,
        }

        if (projectNumber) {
          params.projectNumber = projectNumber
        }

        if (teamName) {
          params.teamName = teamName
        }

        const { data } = await apiService.get<TrendPoint[]>(
          "/budgets/summary/trend",
          {
            params,
          }
        )
        setData(data)
      } catch (error) {
        console.error(`Failed to fetch ${type} trend`, error)
      }
    }
    fetchTrend()
  }, [type, projectNumber, teamName])

  return data
}

// 3. Project Specific Hooks
export function useProjectBudgets(productNo?: string) {
  const [budgets, setBudgets] = useState<BudgetRecord[]>([])

  useEffect(() => {
    if (!productNo) return
    const fetchSearch = async () => {
      try {
        const { data } = await apiService.get<BudgetRecord[]>(
          "/budget/search/searchTerm=",
          {
            params: { productNo },
          }
        )
        setBudgets(data)
      } catch (error) {
        console.error("Search failed", error)
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
        const { data } = await apiService.get<BudgetRecord>(
          `/budget/${projectNumber}`
        )
        setBudget(data)
      } catch (error) {
        console.error("Failed to fetch budget details", error)
      }
    }
    fetchById()
  }, [projectNumber])

  return budget
}

export function useBudgetTeams() {
  const [teamsOptions, setTeamsOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true)
      try {
        const { data } = await apiService.get<string[]>("/budgets/teams")
        setTeamsOptions(data)
      } catch (error) {
        console.error("Failed to fetch teams", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeams()
  }, [])

  return { teamsOptions, loading }
}
