import { Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCallback, type ChangeEvent } from "react"
import type { CommonTableAction } from "./types"

export function CommonTableToolbar(props: {
  searchTerm: string
  searchPlaceholder: string
  onSearchTermChange: (value: string) => void
  onRefresh?: () => void
  primaryAction?: CommonTableAction
}) {
  const { searchTerm, searchPlaceholder, onSearchTermChange, onRefresh, primaryAction } =
    props

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onSearchTermChange(event.target.value)
    },
    [onSearchTermChange]
  )

  const handleRefresh = useCallback(() => {
    onRefresh?.()
  }, [onRefresh])

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={handleChange}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        {primaryAction && (
          <Button onClick={primaryAction.onClick}>
            {primaryAction.icon}
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

