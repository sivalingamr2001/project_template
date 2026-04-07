import type { AccessRequest } from "@/lib/types"
import { getCurrentStepIndex } from "./types"
import { StepIndicator } from "./StepIndicator"
import { RequestDetailsCard } from "./RequestDetailsCard"

interface TimelineProps {
  request?: AccessRequest
}

export function RequestTimeline({ request }: TimelineProps) {
  if (!request) return null

  const currentStepIndex = getCurrentStepIndex(request.status)

  return (
    <div className="space-y-6">
      <StepIndicator currentStepIndex={currentStepIndex} />
      <RequestDetailsCard request={request} />
    </div>
  )
}
