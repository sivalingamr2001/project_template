import CommonTable from "./components/CommonTable"
import PageSection from "./components/PageSection"
import { useAccessWorkspace } from "./hooks/useAccessWorkspace"
import { auditColumns } from "./utils/tableColumns"

function AuditLogPage() {
  const { auditLogs } = useAccessWorkspace("itAll")

  return (
    <PageSection
      title="Audit Log"
      description="IT audit trail for approvals, provisioning, and request changes."
    >
      <CommonTable
        columns={auditColumns}
        getRowId={(row) => row.auditId}
        pageSize={8}
        rows={auditLogs}
        emptyMessage="No audit entries are available."
      />
    </PageSection>
  )
}

export default AuditLogPage
