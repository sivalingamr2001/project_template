import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, type MouseEvent } from "react"

export function CommonTablePagination(props: {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  filteredCount: number
  onPageChange: (page: number) => void
}) {
  const { currentPage, totalPages, itemsPerPage, filteredCount, onPageChange } = props

  const handlePrevious = useCallback(() => {
    onPageChange(currentPage - 1)
  }, [currentPage, onPageChange])

  const handleNext = useCallback(() => {
    onPageChange(currentPage + 1)
  }, [currentPage, onPageChange])

  const handleSelectPage = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const page = Number(event.currentTarget.value)
      if (Number.isFinite(page)) onPageChange(page)
    },
    [onPageChange]
  )

  const start = Math.min((currentPage - 1) * itemsPerPage + 1, filteredCount)
  const end = Math.min(currentPage * itemsPerPage, filteredCount)

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {start} to {end} of {filteredCount} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              value={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={handleSelectPage}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

