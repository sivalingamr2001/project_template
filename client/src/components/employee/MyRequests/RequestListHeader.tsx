import { Plus } from "lucide-react"

interface Props {
  onNewRequest: () => void
}

export function RequestListHeader({ onNewRequest }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">My Access Requests</h2>
      <button
        onClick={onNewRequest}
        className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90"
      >
        <Plus size={18} />
        New Request
      </button>
    </div>
  )
}

