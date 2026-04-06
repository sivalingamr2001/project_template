import { useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { formatDate } from "@/lib/utils"
import type { AccessRequest, AccessTypes } from "@/lib/types"
import { Check, Disc, Notebook, User, type LucideIcon } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area"

const Badge = ({
  children,
  variant = "default",
}: {
  children: ReactNode
  variant?: string
}) => {
  const variants: Record<string, string> = {
    default: "bg-card text-foreground border border-border",
    success: "bg-primary text-primary-foreground border border-primary",
    warning: "bg-secondary text-secondary-foreground border border-secondary",
    destructive: "bg-destructive text-foreground border border-destructive",
    info: "bg-secondary text-secondary-foreground border border-secondary",
    readonly: "bg-muted text-muted-foreground border border-border",
    readwrite: "bg-primary text-primary-foreground border border-primary",
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

const Separator = () => <div className="my-1 h-px bg-border" />

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
    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
      {label}
    </h3>
    <div className="h-px flex-1 bg-border" />
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
    <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
      {label}
    </span>
    {children ? (
      children
    ) : (
      <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-muted-foreground italic">N/A</span>}
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
  <div className="flex gap-3 rounded-lg border border-border bg-card/60 p-3">
    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[10px] font-bold text-muted-foreground">
      {num}
    </div>
    <div>
      <span className="text-xs font-semibold text-muted-foreground">
        {title}:{" "}
      </span>
      <span className="text-xs text-foreground">{body}</span>
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
      <DialogContent className="max-h-[90vh] overflow-hidden border-none p-0 pt-4 pb-4 pl-4 shadow-2xl sm:max-w-5xl">
        <ScrollArea
          type="hover"
          className="h-[90vh] w-full **:data-[orientation=vertical]:w-1.5 **:data-[orientation=vertical]:bg-transparent **:data-[state=visible]:rounded-full **:data-[state=visible]:bg-transparent **:data-[state=visible]:transition-colors hover:**:data-[state=visible]:bg-muted-foreground/40"
        >
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Access Request #{request.id} Report
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Review the request details and resubmit if required.
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-6 p-5">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold tracking-[0.32em] text-muted-foreground uppercase">
                    File Server Folder Access Request
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Janatics India Pvt. Ltd.
                  </p>
                </div>
                <div className="flex items-center justify-between gap-6 text-xs whitespace-nowrap">
                  {/* Left Section: Stacked metadata */}
                  <div className="flex flex-col gap-1 space-y-1 text-right sm:text-left">
                    <div className="flex gap-2 leading-none">
                      <span className="tracking-[0.2em] text-muted-foreground uppercase opacity-70">
                        Record No.
                      </span>
                      <span className="font-mono text-foreground">
                        {request.ticketNumber || `REQ-${request.id}`}
                      </span>
                    </div>

                    <div className="flex gap-2 leading-none">
                      <span className="tracking-[0.2em] text-muted-foreground uppercase opacity-70">
                        Issue Date
                      </span>
                      <span className="font-mono text-foreground">
                        {formatDate(request.requestedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right Section: Status and Actions */}
                  <div className="flex items-center gap-3 border-l border-border pl-6">
                    <Badge variant={getStatusVariant(request.status)}>
                      {request.status}
                    </Badge>

                    {onResubmit && request.status === "Rejected" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={onResubmit}
                        disabled={isResubmitting}
                        className="h-7 px-3"
                      >
                        {isResubmitting
                          ? "Resubmitting..."
                          : "Resubmit Request"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10 flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
              <div className="flex border-b border-border">
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
                        ? "border-b-2 border-primary bg-card/50 text-foreground"
                        : "text-muted-foreground hover:bg-card/30 hover:text-foreground"
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
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
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

                  <div className="mt-4">
                    <SectionHeading icon={Notebook} label="Access Details" />
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
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

                  <div className="mt-4">
                    <SectionHeading icon={User} label="HOD Approval" />
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <Field
                        label="Approver"
                        value={hodReviewer?.approverName}
                      />
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
                    </div>
                  </div>

                  <Separator />

                  <div className="mt-4">
                    <SectionHeading
                      icon={Check}
                      label="Acknowledgment by Requestor"
                    />
                    <div className="mb-4 rounded-lg border border-border bg-card/60 p-3">
                      <p className="text-xs leading-relaxed text-muted-foreground italic">
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
                      <Field
                        label="Submitted By"
                        value={request.requesterName}
                      />
                    </div>
                  </div>
                </div>
              )}

              {tab === "policy" && (
                <div className="space-y-4 p-6">
                  <p className="mb-4 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
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
                        {[
                          ["Date Received", formatDate(request.requestedAt)],
                          [
                            "Date Access Provided",
                            itReviewer ? formatDate(itReviewer.timestamp) : "—",
                          ],
                          [
                            "Access Granted By",
                            itReviewer?.approverName || "—",
                          ],
                          [
                            "Access Level Assigned",
                            getAccessTypeLabel(primaryItem?.accessType),
                          ],
                        ].map(([field, value]) => (
                          <tr
                            key={field as string}
                            className="transition-colors hover:bg-card/30"
                          >
                            <td className="px-4 py-3 font-semibold text-muted-foreground">
                              {field}
                            </td>
                            <td className="px-4 py-3 font-mono text-foreground">
                              {value || (
                                <span className="text-muted-foreground italic">
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default RequestReport
