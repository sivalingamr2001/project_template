import type { AccessRequest } from "@/lib/types"
import { Separator } from "../components/Separator"
import { EmployeeInfoSection } from "./details/EmployeeInfoSection"
import { AccessDetailsSection } from "./details/AccessDetailsSection"
import { HodApprovalSection } from "./details/HodApprovalSection"
import { AcknowledgementSection } from "./details/AcknowledgementSection"

export function DetailsTab(props: { request: AccessRequest }) {
  const { request } = props

  return (
    <div className="space-y-6 p-6">
      <EmployeeInfoSection request={request} />

      <Separator />

      <AccessDetailsSection request={request} />

      <Separator />

      <HodApprovalSection request={request} />

      <Separator />

      <AcknowledgementSection request={request} />
    </div>
  )
}

