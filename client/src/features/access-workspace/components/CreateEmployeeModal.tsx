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
  const [hodEmployeeId, setHodEmployeeId] = useState("0")
  const [password, setPassword] = useState("")

  const departmentName = useMemo(
    () => (departmentId ? getDepartmentName(departments, Number(departmentId)) : ""),
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
    setHodEmployeeId("0")
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
        hodEmployeeId: hodEmployeeId ? Number(hodEmployeeId) : 0,
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="createEmployeeId">EmployeeId</Label>
              <Input
                id="createEmployeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                inputMode="numeric"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="createUserName">User Name</Label>
              <Input
                id="createUserName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="createFirstName">First name</Label>
              <Input
                id="createFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="createLastName">Last name</Label>
              <Input
                id="createLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="createEmail">Email</Label>
              <Input
                id="createEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="createPhone">Phone</Label>
              <Input
                id="createPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.id} - {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Hod">HOD</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Department HOD</Label>
            <Select value={hodEmployeeId} onValueChange={setHodEmployeeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select HOD (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.employeeId} value={String(emp.employeeId)}>
                    {emp.employeeId} - {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="createPassword">Password</Label>
            <Input
              id="createPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={!canSubmit}>
            {isSaving ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
