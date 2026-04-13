import { IconDisc } from "@tabler/icons-react"
import type { AccessRequestDetails } from "../../../types"
import { formatRequestDate } from "../../utils/requestDetails"
import ReportSectionHeading from "./ReportSectionHeading"
import { getItProvisionDate, getItReviewer } from "../utils/requestReport"
import { useEffect } from "react"
import { toast } from "sonner"

type RequestReportItSectionProps = {
  details: AccessRequestDetails
}

function RequestReportItSection({ details }: RequestReportItSectionProps) {
  const itReviewer = getItReviewer(details)

  // FIX 1: Handle potential null from getItProvisionDate before formatting
  const provisionDateRaw = getItProvisionDate(details)
  const approvedDateStr = provisionDateRaw
    ? formatRequestDate(provisionDateRaw)
    : "—"

  const getAccessExpiryInfo = (dateInput: string | number | Date | null) => {
    // FIX 2: Early return if dateInput is null or invalid
    if (!dateInput || dateInput === "—")
      return { expiryDate: null, shouldNotify: false }

    const expiry = new Date(dateInput)
    expiry.setFullYear(expiry.getFullYear() + 1)

    const today = new Date()
    const notifyWindowStart = new Date(expiry)
    notifyWindowStart.setDate(expiry.getDate() - 7)

    const shouldNotify = today >= notifyWindowStart && today < expiry

    return {
      expiryDate: expiry,
      shouldNotify: shouldNotify,
    }
  }

  const expiryInfo = getAccessExpiryInfo(provisionDateRaw)

  useEffect(() => {
    if (expiryInfo.shouldNotify) {
      toast("Notification: Your access will expire in less than 7 days!")
    }
  }, [expiryInfo.shouldNotify])

  const rows = [
    ["Date Received", formatRequestDate(details.createdOn)],
    ["Date Access Provided", approvedDateStr],
    ["Access Granted By", itReviewer?.approverName || "—"],
    ["Access Level Assigned", details.items[0]?.accessType || "Not Applicable"],
    // FIX 3: Ensure we pass a string to the table cell.
    // Use .toISOString() if formatRequestDate only accepts strings.
    [
      "Expiry Date",
      expiryInfo.expiryDate
        ? formatRequestDate(expiryInfo.expiryDate.toISOString())
        : "—",
    ],
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
