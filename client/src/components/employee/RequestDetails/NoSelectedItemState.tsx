interface Props {
  onBack: () => void
}

export function NoSelectedItemState({ onBack }: Props) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
        Back to Requests
      </button>
      <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-lg font-semibold">No access item selected</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This detail page requires a single access item selection. Please open a request from the item-level list.
        </p>
      </div>
    </div>
  )
}

