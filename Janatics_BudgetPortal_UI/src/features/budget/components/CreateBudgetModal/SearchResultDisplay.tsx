import { type BudgetRecordResponse } from "../../types"

interface SearchResultDisplayProps {
  searchResult: BudgetRecordResponse | null
  searchError: string | null
  isSearching: boolean
}

export function SearchResultDisplay({
  searchResult,
  searchError,
  isSearching,
}: SearchResultDisplayProps) {
  if (searchError) {
    return (
      <div className="rounded-2xl border border-destructive/70 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {searchError}
      </div>
    )
  }

  if (isSearching) {
    return (
      <div className="rounded-2xl border border-border/80 bg-muted px-4 py-3 text-sm text-muted-foreground">
        Looking up product number...
      </div>
    )
  }

  if (!searchResult) {
    return null
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-muted px-4 py-4 text-sm">
      <div className="mb-3 text-base font-semibold text-foreground">
        Budget lookup result
      </div>
      <div className="grid gap-1 text-xs text-muted-foreground">
        <div>
          <span className="font-semibold text-foreground">Product Number:</span>{" "}
          {searchResult.header.productNo}
        </div>
        <div>
          <span className="font-semibold text-foreground">Project Number:</span>{" "}
          {searchResult.header.projectNumber}
        </div>
        <div>
          <span className="font-semibold text-foreground">Product Name:</span>{" "}
          {searchResult.header.productName ?? searchResult.header.projectTitle}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {searchResult.categories.map((category) => (
          <div key={category.categoryId}>
            <div className="text-sm font-semibold text-foreground">
              {category.categoryName}
            </div>
            <div className="mt-2 space-y-2">
              {category.items.map((item) => (
                <div
                  className="grid grid-cols-[1fr_auto_auto] gap-2 rounded-2xl border border-border/80 bg-background px-3 py-2 text-sm"
                  key={item.itemId}
                >
                  <span>{item.itemName}</span>
                  <span className="text-right text-muted-foreground">
                    {item.planned}
                  </span>
                  <span className="text-right text-muted-foreground">
                    {item.actual}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
