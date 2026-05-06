"use client"

import { useEffect, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Edit, Trash2 } from "lucide-react"
import { apiService } from "@/shared/lib/api-client"

type Employee = {
  employeeId: number
  name: string
  email: string
  phone: number
  departmentId: number
  departmentName: string
  teamName?: string
  role: string
}

type CreateEmployeeRequest = {
  employeeId: number
  name: string
  email: string
  phone: string
  departmentId: number
  departmentName: string
  teamName?: string
  role: string
  password?: string
  confirmPassword?: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    employeeId: 0,
    name: "",
    email: "",
    phone: "",
    departmentId: 0,
    departmentName: "",
    teamName: "",
    role: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await apiService.get<Employee[]>("/employees")
      setEmployees(response.data)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch employees"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleCreate = async () => {
    try {
      await apiService.post("/employees", {
        ...formData,
        phone: parseInt(formData.phone),
      })
      toast.success("Employee created successfully")
      setIsCreateDialogOpen(false)
      resetForm()
      fetchEmployees()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create employee"
      toast.error(errorMessage)
    }
  }

  const handleUpdate = async () => {
    if (!editingEmployee) return
    try {
      await apiService.put(`/employees/${editingEmployee.employeeId}`, {
        ...formData,
        phone: parseInt(formData.phone),
      })
      toast.success("Employee updated successfully")
      setIsEditDialogOpen(false)
      setEditingEmployee(null)
      resetForm()
      fetchEmployees()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update employee"
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (employeeId: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return
    try {
      await apiService.delete(`/employees/${employeeId}`)
      toast.success("Employee deleted successfully")
      fetchEmployees()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete employee"
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: 0,
      name: "",
      email: "",
      phone: "",
      departmentId: 0,
      departmentName: "",
      teamName: "",
      role: "",
      password: "",
    })
  }

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      phone: employee.phone.toString(),
      departmentId: employee.departmentId,
      departmentName: employee.departmentName,
      teamName: employee.teamName || "",
      role: employee.role,
      password: "",
    })
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">Loading...</div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Employee</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4">
              {/* Employee ID */}
              <div className="grid gap-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  type="number"
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employeeId: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* Phone */}
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              {/* Dept ID */}
              <div className="grid gap-2">
                <Label htmlFor="departmentId">Dept ID</Label>
                <Input
                  id="departmentId"
                  type="number"
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      departmentId: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              {/* Dept Name */}
              <div className="grid gap-2">
                <Label htmlFor="departmentName">Dept Name</Label>
                <Input
                  id="departmentName"
                  value={formData.departmentName}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentName: e.target.value })
                  }
                />
              </div>

              {/* Team Name (New Field) */}
              <div className="grid gap-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={formData.teamName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, teamName: e.target.value })
                  }
                  placeholder="Enter team name"
                />
              </div>

              {/* Role */}
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="HOD">HOD</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className={
                    passwordError
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                    if (passwordError) setPasswordError("")
                  }}
                  onBlur={() => {
                    if (
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                    ) {
                      setPasswordError("Passwords do not match")
                    }
                  }}
                />
                {passwordError && (
                  <span className="animate-in text-[12px] font-medium text-red-500 fade-in slide-in-from-top-1">
                    {passwordError}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  !!passwordError ||
                  formData.password !== formData.confirmPassword
                }
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.employeeId}>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.departmentName}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(employee.employeeId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          {" "}
          {/* Widened for two columns */}
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4">
            {/* Employee ID (Full Width or Disabled) */}
            <div className="grid gap-2">
              <Label htmlFor="edit-employeeId">Employee ID</Label>
              <Input
                id="edit-employeeId"
                type="number"
                value={formData.employeeId}
                disabled
              />
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            {/* Dept ID */}
            <div className="grid gap-2">
              <Label htmlFor="edit-departmentId">Dept ID</Label>
              <Input
                id="edit-departmentId"
                type="number"
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    departmentId: parseInt(e.target.value),
                  })
                }
              />
            </div>

            {/* Dept Name */}
            <div className="grid gap-2">
              <Label htmlFor="edit-departmentName">Dept Name</Label>
              <Input
                id="edit-departmentName"
                value={formData.departmentName}
                onChange={(e) =>
                  setFormData({ ...formData, departmentName: e.target.value })
                }
              />
            </div>

            {/* Team Name (New Field) */}
            <div className="grid gap-2">
              <Label htmlFor="edit-teamName">Team Name</Label>
              <Input
                id="edit-teamName"
                value={formData.teamName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, teamName: e.target.value })
                }
              />
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="HOD">HOD</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password (Full width if desired, or keep in column) */}
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave empty to keep current"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            {formData.password && (
              <div className="col-span-2 grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className={
                    passwordError
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                    if (passwordError) setPasswordError("")
                  }}
                  onBlur={() => {
                    if (
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                    ) {
                      setPasswordError("Passwords do not match")
                    }
                  }}
                />
                {passwordError && (
                  <span className="animate-in text-[12px] font-medium text-red-500 fade-in slide-in-from-top-1">
                    {passwordError}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
