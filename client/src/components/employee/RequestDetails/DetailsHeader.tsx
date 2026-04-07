import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  onBack: () => void
  onOpenReport: () => void
}

export function DetailsHeader({ onBack, onOpenReport }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft size={18} />
        Back to Requests
      </button>
      <Button variant="secondary" onClick={onOpenReport} className="w-full sm:w-auto">
        View Report
      </Button>
    </div>
  )
}

