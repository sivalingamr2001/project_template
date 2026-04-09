import { IconDisc } from "@tabler/icons-react"

import type { AccessRequestDetails } from "../../../types"
import { formatRequestDate } from "../../utils/requestDetails"
import ReportSectionHeading from "./ReportSectionHeading"
import { getItProvisionDate, getItReviewer } from "../utils/requestReport"

type RequestReportItSectionProps = {
  details: AccessRequestDetails
}

function RequestReportItSection({ details }: RequestReportItSectionProps) {
  const itReviewer = getItReviewer(details)
  const primaryItem = details.items[0]
  const rows = [
    ["Date Received", formatRequestDate(details.createdOn)],
    [
      "Date Access Provided",
      formatRequestDate(primaryItem?.accessGrantedOn || getItProvisionDate(details)),
    ],
    ["Access Granted By", itReviewer?.approverName || "—"],
    [
      "Access Level Assigned",
      primaryItem?.confirmAccessType === "Not Applicable"
        ? primaryItem?.accessType || "Not Applicable"
        : primaryItem?.confirmAccessType || "Not Applicable",
    ],
    ["Access Valid Until", formatRequestDate(primaryItem?.accessValidUntil || null)],
  ]

  return (
    <div className="p-6">
      <ReportSectionHeading icon={IconDisc} label="IT Department Use Only" />
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
                <td className="px-4 py-3 font-semibold text-muted-foreground">
                  {field}
                </td>
                <td className="px-4 py-3 font-mono text-foreground">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RequestReportItSection
