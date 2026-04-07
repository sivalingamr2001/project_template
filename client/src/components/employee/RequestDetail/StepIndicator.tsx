import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { STATUS_STEPS } from "./types"

interface Props {
  currentStepIndex: number
}

export function StepIndicator({ currentStepIndex }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Request Status</h3>
      <div className="flex items-center space-x-4">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const dotClass = isCompleted ? "text-green-400" : isCurrent ? "text-blue-400" : "text-gray-300"
          const StepIcon = isCurrent ? Loader2 : isCompleted ? CheckCircle2 : Circle

          return (
            <div key={step.key} className="flex items-center">
              <StepIcon className={`h-4 w-4 ${dotClass} animate-pulse`} />
              <span className={`ml-2 text-sm ${isCompleted || isCurrent ? "font-semibold" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              {index < STATUS_STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 w-8 ${isCompleted ? "bg-primary" : "bg-gray-300"}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

