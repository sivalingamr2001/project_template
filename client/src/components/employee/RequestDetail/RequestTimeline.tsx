import { Badge, CheckCircle2, Circle, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { AccessRequest } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getCurrentStepIndex, STATUS_STEPS } from "./types"
import { Label } from "@/components/ui/label"

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

function StepIndicator({ currentStepIndex }: { currentStepIndex: number }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Request Status</h3>
      <div className="flex items-center space-x-4">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const dotClass = isCompleted
            ? "text-green-400"
            : isCurrent
              ? "text-blue-400"
              : "text-gray-300"
          const StepIcon = isCurrent
            ? Loader2
            : isCompleted
              ? CheckCircle2
              : Circle

          return (
            <div key={step.key} className="flex items-center">
              <StepIcon className={`h-4 w-4 ${dotClass} animate-pulse`} />
              <span
                className={`ml-2 text-sm ${isCompleted || isCurrent ? "font-semibold" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>
              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-8 ${isCompleted ? "bg-primary" : "bg-gray-300"}`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RequestDetailsCard({ request }: { request: AccessRequest }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoField
            label="Systems"
            value={request.items.map((item) => item.system).join(", ")}
          />
          <InfoField
            label="Access Types"
            value={request.items.map((item) => item.accessType).join(", ")}
          />
          <InfoField
            label="Requested Date"
            value={formatDate(request.requestedAt)}
          />
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Badge>{request.status}</Badge>
          </div>
        </div>
        {request.rejectionReason && (
          <InfoField label="Rejection Reason" value={request.rejectionReason} />
        )}
      </CardContent>
    </Card>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  )
}
