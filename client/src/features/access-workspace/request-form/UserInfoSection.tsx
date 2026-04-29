import { IconLoader2 } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserInfoSectionProps {
  empId: number
  onEmpIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isFetching: boolean
  displayUser: any
  itsrNo: string
  onItsrChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function UserInfoSection({
  empId,
  onEmpIdChange,
  isFetching,
  displayUser,
  itsrNo,
  onItsrChange,
}: UserInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="empId">Employee ID</Label>
        <div className="relative">
          <Input
            id="empId"
            type="number"
            value={empId}
            onChange={onEmpIdChange}
            required
            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {isFetching && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Employee Name</Label>
        <Input
          value={displayUser ? `${displayUser.name}` : "User not found"}
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label>Employee Email</Label>
        <Input
          value={displayUser?.email || ""}
          className="bg-muted font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label>HOD (Approval Authority)</Label>
        <Input
          value={
            displayUser?.departmentHod
              ? `${displayUser.departmentHod.employeeId} - ${displayUser.departmentHod.name}`
              : "No HOD"
          }
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="itsrNo">ITSR #</Label>
        <Input
          id="itsrNo"
          placeholder="ITSR-001"
          value={itsrNo}
          onChange={onItsrChange}
        />
      </div>
    </div>
  )
}
