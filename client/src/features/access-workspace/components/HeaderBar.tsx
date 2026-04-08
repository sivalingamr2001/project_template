import { Button } from "@/components/ui/button"

type HeaderBarProps = {
  createLabel?: string
  onCreate?: () => void
  onRefresh?: () => void
  searchValue?: string
  setSearchValue?: (value: string) => void
}

function HeaderBar({
  createLabel = "Create Request",
  onCreate,
  onRefresh,
  searchValue = "",
  setSearchValue,
}: HeaderBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <input
        className="w-full max-w-sm rounded-xl border border-input bg-background px-3 py-2.5 text-sm transition outline-none placeholder:text-muted-foreground focus:border-primary"
        value={searchValue}
        onChange={(event) => setSearchValue?.(event.target.value)}
        placeholder="Search folder, request, or status"
      />
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
        {onCreate ? <Button onClick={onCreate}>{createLabel}</Button> : null}
      </div>
    </div>
  )
}

export default HeaderBar
