import { useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { formatDate } from "@/lib/utils"
import type { AccessRequest, AccessTypes } from "@/lib/types"
import { Check, Disc, Notebook, User, type LucideIcon } from "lucide-react"

const Badge = ({
  children,
  variant = "default",
}: {
  children: ReactNode
  variant?: string
}) => {
  const variants: Record<string, string> = {
    default: "bg-zinc-800 text-zinc-200 border border-zinc-700",
    success: "bg-emerald-950 text-emerald-400 border border-emerald-800",
    warning: "bg-amber-950 text-amber-400 border border-amber-800",
    destructive: "bg-red-950 text-red-400 border border-red-800",
    info: "bg-blue-950 text-blue-400 border border-blue-800",
    readonly: "bg-slate-800 text-slate-300 border border-slate-600",
    readwrite: "bg-violet-950 text-violet-400 border border-violet-700",
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

const Separator = () => <div className="my-1 h-px bg-zinc-800" />

const SectionHeading = ({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) => (
  <div className="mb-3 flex items-center gap-2">
    <span className="text-lg">
      <Icon size={18} /> {/* Render it as a component */}
    </span>
    <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
      {label}
    </h3>
    <div className="h-px flex-1 bg-zinc-800" />
  </div>
)

const Field = ({
  label,
  value,
  mono = false,
  children,
}: {
  label: string
  value?: string | number
  mono?: boolean
  children?: ReactNode
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
      {label}
    </span>
    {children ? (
      children
    ) : (
      <span className={`text-sm text-zinc-200 ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-zinc-600 italic">N/A</span>}
      </span>
    )}
  </div>
)

const PolicyItem = ({
  num,
  title,
  body,
}: {
  num: number
  title: string
  body: string
}) => (
  <div className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[10px] font-bold text-zinc-400">
      {num}
    </div>
    <div>
      <span className="text-xs font-semibold text-zinc-300">{title}: </span>
      <span className="text-xs text-zinc-500">{body}</span>
    </div>
  </div>
)

const policies = [
  {
    title: "Authorized Use",
    body: "Access is granted strictly for business-related purposes. Unauthorized access, sharing, or modification of data is prohibited.",
  },
  {
    title: "Data Confidentiality",
    body: "Employees must maintain the confidentiality of the information and not share it with unauthorized personnel.",
  },
  {
    title: "Access Restrictions",
    body: "Users must only access data necessary for their job functions. Any additional access must be approved through formal requests.",
  },
  {
    title: "Monitoring & Auditing",
    body: "The organization reserves the right to monitor file access and usage for security and compliance purposes.",
  },
  {
    title: "Data Integrity",
    body: "Users must not modify or delete critical business data unless explicitly authorized.",
  },
  {
    title: "Revocation of Access",
    body: "Access may be revoked at any time due to changes in job roles, security concerns, or policy violations.",
  },
]

const getAccessTypeLabel = (accessType: AccessTypes | undefined) => {
  if (accessType === "ReadAndWrite") return "Read & Write"
  if (accessType === "ReadOnly") return "Read-Only"
  return "Not Applicable"
}

const getStatusVariant = (status: AccessRequest["status"]) => {
  if (status === "Approved") return "success"
  if (status === "Rejected") return "destructive"
  return "warning"
}

interface RequestReportProps {
  request: AccessRequest
  open: boolean
  onOpenChange: (open: boolean) => void
  onResubmit?: () => void
  isResubmitting?: boolean
}

export function RequestReport({
  request,
  open,
  onOpenChange,
  onResubmit,
  isResubmitting,
}: RequestReportProps) {
  const [tab, setTab] = useState("details")
  const primaryItem = request.items[0]
  const hasMultipleItems = request.items.length > 1
  const accessReason = primaryItem?.reason || request.rejectionReason || ""
  const hodReviewer = request.approvalTimeline.find(
    (record) =>
      record.action === "HODApproved" || record.action === "HODRejected"
  )
  const itReviewer = request.approvalTimeline.find(
    (record) => record.action === "ITApproved"
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader className="border-b border-zinc-800 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Access Request #{request.id} Report
              </DialogTitle>
              <p className="text-sm text-zinc-500">
                Review the request details and resubmit if required.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getStatusVariant(request.status)}>
                {request.status}
              </Badge>
              {onResubmit && request.status === "Rejected" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onResubmit}
                  disabled={isResubmitting}
                >
                  {isResubmitting ? "Resubmitting..." : "Resubmit Request"}
                </Button>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-5">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold tracking-[0.32em] text-zinc-500 uppercase">
                  File Server Folder Access Request
                </p>
                <p className="text-sm font-semibold text-zinc-200">
                  Janatics India Pvt. Ltd.
                </p>
              </div>
              <div className="grid gap-2 text-right text-xs text-zinc-400">
                <div>
                  <p className="tracking-[0.24em] text-zinc-500 uppercase">
                    Record No.
                  </p>
                  <p className="font-mono text-zinc-200">
                    {request.ticketNumber || `REQ-${request.id}`}
                  </p>
                </div>
                <div>
                  <p className="tracking-[0.24em] text-zinc-500 uppercase">
                    Issue Date
                  </p>
                  <p className="font-mono text-zinc-200">
                    {formatDate(request.requestedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
            <div className="flex border-b border-zinc-800">
              {[
                { id: "details", label: "Request Details" },
                { id: "policy", label: "Data Policies" },
                { id: "itdept", label: "IT Dept. Use" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex-1 px-4 py-3 text-[11px] font-semibold tracking-widest uppercase transition-all ${
                    tab === item.id
                      ? "border-b-2 border-violet-500 bg-zinc-800/50 text-zinc-100"
                      : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "details" && (
              <div className="space-y-6 p-6">
                <div>
                  <SectionHeading icon={User} label="Employee Information" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Employee ID"
                      value={request.requesterId.toString()}
                      mono
                    />
                    <Field label="Name" value={request.requesterName} />
                    <Field label="Department" value={request.requesterDept} />
                    <Field
                      label="Requested On"
                      value={formatDate(request.requestedAt)}
                      mono
                    />
                    <Field
                      label="Items Requested"
                      value={`${request.items.length}`}
                    />
                    <Field label="Status" value={request.status} />
                  </div>
                </div>

                <Separator />

                <div>
                  <SectionHeading icon={Notebook} label="Access Details" />
                  <div className="space-y-4">
                    <Field
                      label="Folder Name / Path"
                      value={primaryItem?.system}
                      mono
                    />
                    <Field
                      label="Type of Access Required"
                      value={getAccessTypeLabel(primaryItem?.accessType)}
                    >
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge
                          variant={
                            primaryItem?.accessType === "ReadOnly"
                              ? "readonly"
                              : "default"
                          }
                        >
                          {primaryItem?.accessType === "ReadOnly" ? "✓" : "○"}{" "}
                          Read-Only
                        </Badge>
                        <Badge
                          variant={
                            primaryItem?.accessType === "ReadAndWrite"
                              ? "readwrite"
                              : "default"
                          }
                        >
                          {primaryItem?.accessType === "ReadAndWrite"
                            ? "✓"
                            : "○"}{" "}
                          Read &amp; Write
                        </Badge>
                      </div>
                    </Field>
                    <Field label="Reason for Access" value={accessReason} />
                    {hasMultipleItems && (
                      <Field
                        label="Additional Items"
                        value={`${request.items.length - 1} more item${request.items.length - 1 === 1 ? "" : "s"}`}
                      />
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <SectionHeading icon={User} label="HOD Approval" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Approver" value={hodReviewer?.approverName} />
                    <Field
                      label="Decision"
                      value={
                        hodReviewer
                          ? hodReviewer.action === "HODApproved"
                            ? "Approved"
                            : "Rejected"
                          : "Pending"
                      }
                    />
                    <Field label="Department" value={request.requesterDept} />
                    <Field
                      label="Signature"
                      value={hodReviewer?.approverName}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <SectionHeading
                    icon={Check}
                    label="Acknowledgment by Requestor"
                  />
                  <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                    <p className="text-xs leading-relaxed text-zinc-400 italic">
                      "I acknowledge that I have read and agree to comply with
                      the organization's data access policies and security
                      guidelines."
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field
                      label="ITSR Number"
                      value={request.ticketNumber || "N/A"}
                      mono
                    />
                    <Field
                      label="Request Date"
                      value={formatDate(request.requestedAt)}
                      mono
                    />
                    <Field label="Submitted By" value={request.requesterName} />
                  </div>
                </div>
              </div>
            )}

            {tab === "policy" && (
              <div className="space-y-4 p-6">
                <p className="mb-4 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                  Data Access Policies — {policies.length} clauses
                </p>
                {policies.map((policy, index) => (
                  <PolicyItem
                    key={index}
                    num={index + 1}
                    title={policy.title}
                    body={policy.body}
                  />
                ))}
              </div>
            )}

            {tab === "itdept" && (
              <div className="p-6">
                <SectionHeading icon={Disc} label="IT Department Use Only" />
                <div className="overflow-hidden rounded-lg border border-zinc-800">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-800/60">
                        <th className="w-1/2 px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                          Field
                        </th>
                        <th className="w-1/2 px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {[
                        ["Date Received", formatDate(request.requestedAt)],
                        [
                          "Date Access Provided",
                          itReviewer ? formatDate(itReviewer.timestamp) : "—",
                        ],
                        ["Access Granted By", itReviewer?.approverName || "—"],
                        [
                          "Access Level Assigned",
                          getAccessTypeLabel(primaryItem?.accessType),
                        ],
                      ].map(([field, value]) => (
                        <tr
                          key={field as string}
                          className="transition-colors hover:bg-zinc-800/30"
                        >
                          <td className="px-4 py-3 font-semibold text-zinc-400">
                            {field}
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-300">
                            {value || (
                              <span className="text-zinc-700 italic">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-mono text-[10px] text-zinc-500">
              Form: F/EDP/70 - Issue: 4.0
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RequestReport
