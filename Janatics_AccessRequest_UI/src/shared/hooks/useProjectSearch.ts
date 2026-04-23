import { useState, useEffect, useRef } from "react"
import { apiService } from "@/shared/lib/api-client"
import type { ProjectData } from "@/types"
import { useDebounce } from "../lib/utils"

interface BudgetSummaryItem {
  productNo: string
  projectCode: string
  projectTitle: string
}

function mapBudgetToProjectData(item: BudgetSummaryItem): ProjectData {
  return {
    product_no: item.productNo,
    projectnumber: item.projectCode,
    projectname: item.projectTitle,
    description: item.projectTitle,
  }
}

export function useProjectSearch() {
  const [productNo, setProductNo] = useState("")
  const [projectNo, setProjectNo] = useState("")
  const [allProjects, setAllProjects] = useState<ProjectData[]>([])
  const [filteredData, setFilteredData] = useState<ProjectData[]>([])

  const [productSuggestions, setProductSuggestions] = useState<ProjectData[]>([])
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectData[]>([])
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const productRef = useRef<HTMLDivElement>(null)
  const projectRef = useRef<HTMLDivElement>(null)

  const debouncedProduct = useDebounce(productNo, 300)
  const debouncedProject = useDebounce(projectNo, 300)

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await apiService.get<BudgetSummaryItem[]>("/budgets")
        const rows = response.data.map(mapBudgetToProjectData)
        setAllProjects(rows)
        setFilteredData(rows)
      } catch (e) {
        console.error(e)
      }
    }

    fetchBudgets()
  }, [])

  useEffect(() => {
    if (!debouncedProduct || debouncedProduct.length < 2) {
      setProductSuggestions([])
      return
    }

    setProductSuggestions(
      allProjects
        .filter((item) =>
          item.product_no?.toLowerCase().includes(debouncedProduct.toLowerCase())
        )
        .slice(0, 6)
    )
  }, [debouncedProduct, allProjects])

  useEffect(() => {
    if (!debouncedProject || debouncedProject.length < 2) {
      setProjectSuggestions([])
      return
    }

    setProjectSuggestions(
      allProjects
        .filter((item) =>
          item.projectnumber?.toLowerCase().includes(debouncedProject.toLowerCase())
        )
        .slice(0, 6)
    )
  }, [debouncedProject, allProjects])

  const fetchTableData = async (prod: string, proj: string) => {
    if (!allProjects.length) {
      return
    }

    setIsLoading(true)

    try {
      const filtered = allProjects.filter((item) => {
        const matchesProduct = prod
          ? item.product_no?.toLowerCase().includes(prod.toLowerCase())
          : true
        const matchesProject = proj
          ? item.projectnumber?.toLowerCase().includes(proj.toLowerCase())
          : true
        return matchesProduct && matchesProject
      })
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
