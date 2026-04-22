import { useState, useEffect, useRef } from "react"
import { apiService } from "@/shared/lib/api-client"
import type { ProjectData } from "@/types"
import { useDebounce } from "../lib/utils"

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
  const [isLoading, setIsLoading] = useState(false)

  const productRef = useRef<HTMLDivElement>(null)
  const projectRef = useRef<HTMLDivElement>(null)

  // Use your custom hook
  const debouncedProduct = useDebounce(productNo, 300)
  const debouncedProject = useDebounce(projectNo, 300)

  // 1. Effect for Product Suggestions
  useEffect(() => {
    if (!debouncedProduct || debouncedProduct.length < 2) {
      setProductSuggestions([])
      return
    }
    const fetch = async () => {
      try {
        const res = await apiService.get<ProjectData[]>(
          `/budgets/search?productNo=${debouncedProduct}`
        )
        setProductSuggestions(res.data)
      } catch (e) {
        console.error(e)
      }
    }
    fetch()
  }, [debouncedProduct])

  // 2. Effect for Project Suggestions
  useEffect(() => {
    if (!debouncedProject || debouncedProject.length < 2) {
      setProjectSuggestions([])
      return
    }
    const fetch = async () => {
      try {
        const res = await apiService.get<ProjectData[]>(
          `/budgets/search?productNo=${debouncedProject}`
        )
        setProjectSuggestions(res.data)
      } catch (e) {
        console.error(e)
      }
    }
    fetch()
  }, [debouncedProject])

  // 3. API: Fetch Final Table Data
  const fetchTableData = async (prod: string, proj: string) => {
    if (!prod || !proj) return
    setIsLoading(true)
    try {
      const response = await apiService.get<ProjectData[]>(
        `/budgets/by-project/${proj}/product/${prod}`
      )
      setFilteredData(response.data)
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
    // Trigger table load immediately
    fetchTableData(item.product_no || "", item.projectnumber || "")
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
      handleSearch: () => fetchTableData(productNo, projectNo),
    },
  }
}
