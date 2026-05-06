import { useState, useEffect, useRef } from "react"
import { apiService } from "@/shared/lib/api-client"
import type { ProjectData } from "@/types"
import { useDebounce } from "../lib/utils"
import useLoader from "@/shared/hooks/useLoader"

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
  const { loading: isLoading, withLoader } = useLoader()

  const productRef = useRef<HTMLDivElement>(null)
  const projectRef = useRef<HTMLDivElement>(null)

  const debouncedProduct = useDebounce(productNo, 300)
  const debouncedProject = useDebounce(projectNo, 300)

  useEffect(() => {
    const fetchBudgets = async () => {
      if (!debouncedProduct || debouncedProduct.length < 2) {
        setProductSuggestions([])
        return
      }

      try {
        const response = await apiService.get<BudgetSummaryItem[]>(
          `/budgets/search?searchTerm=${debouncedProduct}`
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

    fetchProjectSuggestions()
    fetchTableData(productNo, projectNo)
  }, [debouncedProject])

  const fetchProjectSuggestions = async () => {
    try {
      // Assuming search also works by project number
      const response = await apiService.get<BudgetSummaryItem[]>(
        `/budgets/search?searchTerm=${debouncedProject}`
      )
      const rows = response.data.map(mapBudgetToProjectData)
      setProjectSuggestions(rows.slice(0, 6))
    } catch (e) {
      console.error(e)
      setProjectSuggestions([])
    }
  }

  const fetchTableData = async (prod: string, proj: string) => {
    await withLoader(async () => {
      try {
        // Build query parameters based on provided search criteria
        const queryParams = new URLSearchParams()
        if (prod) queryParams.append("productNo", prod)
        if (proj) queryParams.append("projectNumber", proj)

        const response = await apiService.get<BudgetSummaryItem[]>(
          `/budgets/by-project/${encodeURIComponent(proj)}/product/${encodeURIComponent(prod)}`
        )

        if (response.status === 204) {
          try {
            const res = await apiService.get<BudgetSummaryItem[]>(
              `/budgets/search?searchTerm=${debouncedProduct}`
            )

            // 1. Safety check: Ensure we are mapping an array
            const dataArray = Array.isArray(res.data) ? res.data : [res.data]

            const rows = dataArray.map(mapBudgetToProjectData)

            // 2. Filter using the correct lowercase key 'projectnumber'
            // Use .trim() and .toLowerCase() to prevent spacing or casing bugs
            const matchedByProjectNumber = rows.filter((row) => {
              const targetNo = String(projectNo).trim()
              const currentRowNo = String(row.projectnumber).trim()
              return currentRowNo === targetNo
            })

            setFilteredData(matchedByProjectNumber)
          } catch (error) {
            console.error("Error processing search results:", error)
          }
        }

        const filtered = response.data.map(mapBudgetToProjectData)
        setFilteredData(filtered)
      } catch (e) {
        console.error(e)
      }
    })
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
