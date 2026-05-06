"use client"

import { useEffect, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog"
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
  role: string
}

type CreateEmployeeRequest = {
  employeeId: number
  name: string
  email: string
  phone: string
  departmentId: number
  departmentName: string
  role: string
  password?: string
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
    role: "",
    password: ""
  })

  const fetchEmployees = async () => {
    try {
      const response = await apiService.get<Employee[]>("/employees")
      setEmployees(response.data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch employees"
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
        phone: parseInt(formData.phone)
      })
      toast.success("Employee created successfully")
      setIsCreateDialogOpen(false)
      resetForm()
      fetchEmployees()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create employee"
      toast.error(errorMessage)
    }
  }

  const handleUpdate = async () => {
    if (!editingEmployee) return
    try {
      await apiService.put(`/employees/${editingEmployee.employeeId}`, {
        ...formData,
        phone: parseInt(formData.phone)
      })
      toast.success("Employee updated successfully")
      setIsEditDialogOpen(false)
      setEditingEmployee(null)
      resetForm()
      fetchEmployees()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update employee"
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
      const errorMessage = error instanceof Error ? error.message : "Failed to delete employee"
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
      role: "",
      password: ""
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
      role: employee.role,
      password: ""
    })
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Employee</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employeeId" className="text-right">Employee ID</Label>
                <Input
                  id="employeeId"
                  type="number"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: parseInt(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="departmentId" className="text-right">Dept ID</Label>
                <Input
                  id="departmentId"
                  type="number"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: parseInt(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="departmentName" className="text-right">Dept Name</Label>
                <Input
                  id="departmentName"
                  value={formData.departmentName}
                  onChange={(e) => setFormData({...formData, departmentName: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="HOD">HOD</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
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
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(employee.employeeId)}
                      >
                        <Trash2 className="w-4 h-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-employeeId" className="text-right">Employee ID</Label>
              <Input
                id="edit-employeeId"
                type="number"
                value={formData.employeeId}
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-departmentId" className="text-right">Dept ID</Label>
              <Input
                id="edit-departmentId"
                type="number"
                value={formData.departmentId}
                onChange={(e) => setFormData({...formData, departmentId: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-departmentName" className="text-right">Dept Name</Label>
              <Input
                id="edit-departmentName"
                value={formData.departmentName}
                onChange={(e) => setFormData({...formData, departmentName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="HOD">HOD</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">Password</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave empty to keep current"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}