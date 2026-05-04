import { useState, useEffect, useRef } from "react"
import { apiService } from "@/shared/lib/api-client"
import type { ProjectData } from "@/types"
import { useDebounce } from "../lib/utils"

interface BudgetSummaryItem {
  projectNumber: string
  product_No: string
}

function mapBudgetToProjectData(item: any): ProjectData {
  return {
    product_no: item.product_No || item.productNo,
    projectnumber: item.projectNumber || item.projectNumber,
    projectname: item.projectTitle || item.projectName,
    status: item.isActive ? "Active" : "Inactive",
    budgetId: item.budgetId,
  }
}

export function useProjectSearch() {
  const [productNo, setProductNo] = useState("")
  const [projectNo, setProjectNo] = useState("")
  const [filteredData, setFilteredData] = useState<ProjectData[]>([])

  const [productSuggestions, setProductSuggestions] = useState<ProjectData[]>(
    []
  )
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectData[]>(
    []
  )
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const productRef = useRef<HTMLDivElement>(null)
  const projectRef = useRef<HTMLDivElement>(null)

  const debouncedProduct = useDebounce(productNo, 300)
  const debouncedProject = useDebounce(projectNo, 300)

  // Initial fetch of all budgets
  useEffect(() => {
    const fetchInitialBudgets = async () => {
      try {
        const response = await apiService.get<BudgetSummaryItem[]>("/budgets")
        const rows = response.data.map(mapBudgetToProjectData)
        setFilteredData(rows)
      } catch (e) {
        console.error("Error fetching initial budgets:", e)
        setFilteredData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialBudgets()
  }, [])

  useEffect(() => {
    const fetchBudgets = async () => {
      if (!debouncedProduct || debouncedProduct.length < 2) {
        setProductSuggestions([])
        return
      }

      try {
        const response = await apiService.get<BudgetSummaryItem[]>(
          `/budgets/search?productNo=${debouncedProduct}`
        )
        const rows = response.data.map(mapBudgetToProjectData)
        setProductSuggestions(rows.slice(0, 6))
      } catch (e) {
        console.error(e)
        setProductSuggestions([])
      }
    }

    fetchBudgets()
  }, [debouncedProduct])

  useEffect(() => {
    if (!debouncedProject || debouncedProject.length < 2) {
      setProjectSuggestions([])
      return
    }

    const fetchProjectSuggestions = async () => {
      try {
        // Assuming search also works by project number
        const response = await apiService.get<BudgetSummaryItem[]>(
          `/budgets/search?projectNumber=${debouncedProject}`
        )
        const rows = response.data.map(mapBudgetToProjectData)
        setProjectSuggestions(rows.slice(0, 6))
      } catch (e) {
        console.error(e)
        setProjectSuggestions([])
      }
    }

    fetchProjectSuggestions()
  }, [debouncedProject])

  const fetchTableData = async (prod: string, proj: string) => {
    setIsLoading(true)

    try {
      // Build query parameters based on provided search criteria
      const queryParams = new URLSearchParams()
      if (prod) queryParams.append("productNo", prod)
      if (proj) queryParams.append("projectNumber", proj)

      const response = await apiService.get<BudgetSummaryItem[]>(
        `/budgets/search?${queryParams.toString()}`
      )
      const filtered = response.data.map(mapBudgetToProjectData)
      setFilteredData(filtered)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (item: ProjectData) => {
    setProductNo(item.product_no || "")
    setProjectNo(item.projectnumber || "")
    setShowProductSuggestions(false)
    setShowProjectSuggestions(false)
    fetchTableData(item.product_no || "", item.projectnumber || "")
  }

  const clearSearch = () => {
    setProductNo("")
    setProjectNo("")
    setProductSuggestions([])
    setProjectSuggestions([])
    // Reload initial data
    const fetchInitialBudgets = async () => {
      try {
        const response = await apiService.get<BudgetSummaryItem[]>("/budgets")
        const rows = response.data.map(mapBudgetToProjectData)
        setFilteredData(rows)
      } catch (e) {
        console.error("Error fetching budgets:", e)
        setFilteredData([])
      }
    }
    fetchInitialBudgets()
  }

  return {
    state: {
      productNo,
      projectNo,
      filteredData,
      productSuggestions,
      projectSuggestions,
      showProductSuggestions,
      showProjectSuggestions,
      isLoading,
    },
    refs: { productRef, projectRef },
    actions: {
      setProductNo,
      setProjectNo,
      setShowProductSuggestions,
      setShowProjectSuggestions,
      handleSelect,
      clearSearch,
      handleSearch: () => fetchTableData(productNo, projectNo),
    },
  }
}
