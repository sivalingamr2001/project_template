import type { User } from "@/lib/types"
import { CommonTable } from "../shared/CommonTable"

export function UserTable(props: {
  data: User[]
  isLoading: boolean
}) {
  return (
    <CommonTable<User>
      data={props.data}
      isLoading={props.isLoading}
      rowKey={(row) => row.id}
      columns={[
        {
          header: 'Employee ID',
          cell: (row) => row.employeeId,
        },
        {
          header: 'Name',
          cell: (row) => row.name,
        },
        {
          header: 'Email',
          cell: (row) => row.email,
        },
        {
          header: 'Role',
          cell: (row) => row.role,
        },
        {
          header: 'Department',
          cell: (row) => row.department ?? '-',
        },
      ]}
      emptyMessage="No users found"
      searchPlaceholder="Search users"
    />
  )
}