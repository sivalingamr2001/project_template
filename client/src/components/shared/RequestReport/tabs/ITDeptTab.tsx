import { Disc } from "lucide-react"
import type { AccessRequest } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { SectionHeading } from "../components/SectionHeading"
import { getAccessTypeLabel } from "../utils"

export function ITDeptTab(props: { request: AccessRequest }) {
  const { request } = props
  const primaryItem = request.items[0]
  const itReviewer = request.approvalTimeline.find((record) => record.action === "ITApproved")

  const rows: Array<[string, string]> = [
    ["Date Received", formatDate(request.requestedAt)],
    ["Date Access Provided", itReviewer ? formatDate(itReviewer.timestamp) : "—"],
    ["Access Granted By", itReviewer?.approverName || "—"],
    ["Access Level Assigned", getAccessTypeLabel(primaryItem?.accessType)],
  ]

  return (
    <div className="p-6">
      <SectionHeading icon={Disc} label="IT Department Use Only" />
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-card/60">
              <th className="w-1/2 px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Field
              </th>
              <th className="w-1/2 px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map(([field, value]) => (
              <tr key={field} className="transition-colors hover:bg-card/30">
                <td className="px-4 py-3 font-semibold text-muted-foreground">{field}</td>
                <td className="px-4 py-3 font-mono text-foreground">
                  {value || <span className="text-muted-foreground italic">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

