import { Button } from "@/components/ui/button"
import {
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"

type CommonTablePaginationProps = {
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
}

function CommonTablePagination({
  currentPage,
  onPageChange,
  totalPages,
}: CommonTablePaginationProps) {
  const canGoNext = currentPage < totalPages
  const canGoPrevious = currentPage > 1

  return (
    <div className="flex items-center justify-end gap-2 border-t border-border bg-card px-4 py-3">
      <Button
        disabled={!canGoPrevious}
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <IconChevronLeft className="size-4" />
      </Button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <Button
          key={page}
          size="icon-sm"
          type="button"
          variant={page === currentPage ? "outline" : "ghost"}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        disabled={!canGoNext}
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <IconChevronRight className="size-4" />
      </Button>
    </div>
  )
}

export default CommonTablePagination
