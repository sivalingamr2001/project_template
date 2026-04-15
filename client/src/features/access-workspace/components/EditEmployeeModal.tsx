import { useEffect, useMemo, useState } from "react"

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

import type { EmployeeRecord, AppRole } from "../types"
import { useDepartments } from "../hooks/useDepartments"
import { getDepartmentName } from "../utils/departments"
import {
  fetchUserProfile,
  updateUserProfile,
  type UpdateUserPayload,
} from "../utils/requestApi"
import type { AuthUser } from "@/context/AuthContext"

function splitName(fullName: string) {
  const trimmed = fullName.trim()
  if (!trimmed) return { firstName: "", lastName: "" }
  const [firstName, ...rest] = trimmed.split(/\s+/)
  return { firstName, lastName: rest.join(" ") }
}

type EditEmployeeModalProps = {
  employeeId: number | null
  userId: number | null
  employees: EmployeeRecord[]
  open: boolean
  onClose: () => void
  onSaved: (updated: AuthUser) => void
}

export default function EditEmployeeModal({
  employeeId,
  userId,
  employees,
  open,
  onClose,
  onSaved,
}: EditEmployeeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [role, setRole] = useState<AppRole>("User")
  const [hodEmployeeId, setHodEmployeeId] = useState("0")
  const { departments } = useDepartments()

  const departmentName = useMemo(
    () => (departmentId ? getDepartmentName(departments, Number(departmentId)) : ""),
    [departmentId, departments]
  )

  useEffect(() => {
    if (!open || !employeeId) return
    setIsLoading(true)
    setError(null)
    void (async () => {
      try {
        const profile = await fetchUserProfile(employeeId)
        const name = splitName(profile.name ?? "")
        setUserName(profile.userName ?? "")
        setFirstName(name.firstName)
        setLastName(name.lastName)
        setEmail(profile.email ?? "")
        setPhone(profile.phone ?? "")
        setDepartmentId(profile.departmentId ? String(profile.departmentId) : "")
        setRole(profile.role as AppRole)
        setHodEmployeeId(
          profile.departmentHod?.employeeId
            ? String(profile.departmentHod.employeeId)
            : "0"
        )
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load employee.")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [employeeId, open])

  const onSubmit = async () => {
    if (!employeeId || !userId) return
    setIsSaving(true)
    setError(null)
    try {
      const payload: UpdateUserPayload = {
        userName,
        firstName,
        lastName,
        email,
        phone,
        departmentId: departmentId ? Number(departmentId) : undefined,
        departmentName,
        role,
        hodEmployeeId: hodEmployeeId ? Number(hodEmployeeId) : 0,
      }
      const updated = await updateUserProfile(userId, payload)
      onSaved(updated)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update employee.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="empEmployeeId">EmployeeId</Label>
                <Input
                  id="empEmployeeId"
                  value={String(employeeId ?? "")}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empUserName">User Name</Label>
                <Input
                  id="empUserName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empFirstName">First name</Label>
                <Input
                  id="empFirstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empLastName">Last name</Label>
                <Input
                  id="empLastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="empEmail">Email</Label>
                <Input
                  id="empEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empPhone">Phone</Label>
                <Input
                  id="empPhone"
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
              <Select
                value={hodEmployeeId}
                onValueChange={setHodEmployeeId}
              >
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

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={
              isSaving || isLoading || !employeeId || !userId || !userName.trim()
            }
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
