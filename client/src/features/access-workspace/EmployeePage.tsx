import CommonTable from "./components/CommonTable"
import PageSection from "./components/PageSection"
import { useAccessWorkspace } from "./hooks/useAccessWorkspace"
import { employeeColumns } from "./utils/tableColumns"

function EmployeePage() {
  const { employees } = useAccessWorkspace("itAll")

  return (
    <PageSection
      title="Employee"
      description="IT can review employees and roles tied to the access request workflow."
    >
      <CommonTable
        columns={employeeColumns}
        getRowId={(row) => row.employeeId}
        pageSize={8}
        rows={employees}
        emptyMessage="No employee records are available."
      />
    </PageSection>
  )
}

export default EmployeePage
