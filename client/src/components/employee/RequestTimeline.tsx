import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { formatDate } from "../../lib/utils"
import type { AccessRequest } from "../../lib/types"

const statusSteps = [
  { key: "PendingHOD", label: "Submitted" },
  { key: "PendingIT", label: "HOD Review" },
  { key: "Approved", label: "IT Review" },
  { key: "Expired", label: "Expired" },
  { key: "Revoked", label: "Revoked" },
]

export function RequestTimeline({ request }: { request?: AccessRequest }) {
  if (!request) return null

  let currentStepIndex = statusSteps.findIndex((step) => step.key === request.status)
  if (currentStepIndex < 0) currentStepIndex = 0

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Request Status</h3>
        <div className="flex items-center space-x-4">
          {statusSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const dotClass = isCompleted
              ? "text-green-400"
              : isCurrent
                ? "text-blue-400"
                : "text-gray-300"

            const StepIcon = isCurrent ? Loader2 : isCompleted ? CheckCircle2 : Circle

            return (
              <div key={step.key} className="flex items-center">
                <StepIcon className={`h-4 w-4 ${dotClass} animate-pulse`} />
                <span
                  className={`ml-2 text-sm ${isCompleted || isCurrent ? "font-semibold" : "text-muted-foreground"}`}
                >
                  {step.label}
                </span>
                {index < statusSteps.length - 1 && (
                  <div className={`mx-2 h-0.5 w-8 ${isCompleted ? "bg-primary" : "bg-gray-300"}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Systems</Label>
              <p className="text-sm text-muted-foreground">
                {request.items.map((item) => item.system).join(", ")}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Access Types</Label>
              <p className="text-sm text-muted-foreground">
                {request.items.map((item) => item.accessType).join(", ")}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Requested Date</Label>
              <p className="text-sm text-muted-foreground">{formatDate(request.requestedAt)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant="default">{request.status}</Badge>
            </div>
          </div>
          {request.rejectionReason && (
            <div>
              <Label className="text-sm font-medium">Rejection Reason</Label>
              <p className="text-sm text-muted-foreground">{request.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
