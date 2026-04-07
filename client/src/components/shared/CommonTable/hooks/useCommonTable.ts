import { useEffect, useMemo, useState } from "react"

export function useCommonTable<T>(args: {
  data: T[]
  rowToSearchString?: (item: T) => string
  enablePagination: boolean
  itemsPerPage: number
  externalCurrentPage?: number
  onPageChange?: (page: number) => void
}) {
  const {
    data,
    rowToSearchString,
    enablePagination,
    itemsPerPage,
    externalCurrentPage,
    onPageChange,
  } = args

  const [searchTerm, setSearchTerm] = useState("")
  const [internalCurrentPage, setInternalCurrentPage] = useState(1)

  const currentPage = externalCurrentPage ?? internalCurrentPage
  const setCurrentPage = (page: number) => {
    if (onPageChange) onPageChange(page)
    else setInternalCurrentPage(page)
  }

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query || !rowToSearchString) return data
    return data.filter((item) =>
      rowToSearchString(item).toLowerCase().includes(query)
    )
  }, [data, rowToSearchString, searchTerm])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1)
  }, [currentPage, totalPages])

  const paginatedData = useMemo(() => {
    if (!enablePagination) return filteredData
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredData, enablePagination, currentPage, itemsPerPage])

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    filteredData,
    paginatedData,
    totalPages,
  }
}

