import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { AccessRequest } from "@/lib/types"

interface Props {
  request: AccessRequest
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  )
}

export function RequestDetailsCard({ request }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoField label="Systems" value={request.items.map((item) => item.system).join(", ")} />
          <InfoField label="Access Types" value={request.items.map((item) => item.accessType).join(", ")} />
          <InfoField label="Requested Date" value={formatDate(request.requestedAt)} />
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Badge>{request.status}</Badge>
          </div>
        </div>
        {request.rejectionReason && <InfoField label="Rejection Reason" value={request.rejectionReason} />}
      </CardContent>
    </Card>
  )
}

