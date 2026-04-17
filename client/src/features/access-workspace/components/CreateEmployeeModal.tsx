import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useDepartments } from "../hooks/useDepartments"
import type { AppRole, EmployeeRecord } from "../types"
import { getDepartmentName } from "../utils/departments"
import { createUser, type CreateUserPayload } from "../utils/requestApi"

type CreateEmployeeModalProps = {
  employees: EmployeeRecord[]
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateEmployeeModal({
  employees,
  open,
  onClose,
  onCreated,
}: CreateEmployeeModalProps) {
  const { departments } = useDepartments()

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [employeeId, setEmployeeId] = useState("")
  const [userName, setUserName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [role, setRole] = useState<AppRole>("User")
  const [password, setPassword] = useState("")

  const departmentName = useMemo(
    () =>
      departmentId ? getDepartmentName(departments, Number(departmentId)) : "",
    [departmentId, departments]
  )

  const parsedEmployeeId = Number(employeeId)
  const canSubmit =
    !isSaving &&
    Number.isFinite(parsedEmployeeId) &&
    parsedEmployeeId > 0 &&
    userName.trim() &&
    password.trim() &&
    departmentId

  const reset = () => {
    setEmployeeId("")
    setUserName("")
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setDepartmentId("")
    setRole("User")
    setPassword("")
    setError(null)
  }

  const onSubmit = async () => {
    if (!canSubmit) return
    setIsSaving(true)
    setError(null)
    try {
      const payload: CreateUserPayload = {
        employeeId: parsedEmployeeId,
        userName: userName.trim(),
        firstName,
        lastName,
        email,
        phone,
        departmentId: departmentId ? Number(departmentId) : undefined,
        departmentName,
        role,
        password,
      }

      await createUser(payload)
      onCreated()
      reset()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create user.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset()
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Row 1: Employee ID & User Name */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="createEmployeeId">EmployeeId</Label>
              <Input
                id="createEmployeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                inputMode="numeric"
                className="w-full"
                required
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="createUserName">User Name</Label>
              <Input
                id="createUserName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Row 2: First Name & Last Name */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="createFirstName">First name</Label>
              <Input
                id="createFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="createLastName">Last name</Label>
              <Input
                id="createLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Row 3: Email & Phone */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="createEmail">Email</Label>
              <Input
                id="createEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="createPhone">Phone</Label>
              <Input
                id="createPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Row 4: Department & Role */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.deptId} value={String(dept.deptId)}>
                      {dept.deptId} - {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Hod">HOD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={!canSubmit || isSaving}
          >
            {isSaving ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
