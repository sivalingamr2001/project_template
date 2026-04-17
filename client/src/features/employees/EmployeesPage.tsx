import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type {
  CreateEmployeeRequest,
  EmployeeResponse,
  UpdateEmployeeRequest,
} from "./employees.types";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "./employeesApi";
import { Edit, Trash2 } from "lucide-react";

const roleOptions = ["User", "Admin"];

const defaultFormState = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  departmentId: "",
  departmentName: "",
  role: "User",
  password: "",
};

type EmployeeFormState = typeof defaultFormState;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeResponse | null>(null);
  const [formState, setFormState] = useState<EmployeeFormState>(defaultFormState);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formTitle = selectedEmployeeId ? "Edit employee" : "Create employee";

  const canSubmit = useMemo(
    () =>
      formState.name.trim().length > 0 &&
      formState.email.trim().length > 0 &&
      Number(formState.employeeId) > 0 &&
      Number(formState.phone) > 0 &&
      Number(formState.departmentId) > 0 &&
      formState.departmentName.trim().length > 0 &&
      formState.role.trim().length > 0,
    [formState],
  );

  useEffect(() => {
    void loadEmployees();
  }, []);

  async function loadEmployees() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load employees.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateDialog() {
    setSelectedEmployeeId(null);
    setFormState(defaultFormState);
    setErrorMessage(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(employee: EmployeeResponse) {
    setSelectedEmployeeId(employee.employeeId);
    setFormState({
      employeeId: employee.employeeId.toString(),
      name: employee.name,
      email: employee.email,
      phone: employee.phone.toString(),
      departmentId: employee.departmentId.toString(),
      departmentName: employee.departmentName,
      role: employee.role,
      password: "",
    });
    setErrorMessage(null);
    setIsDialogOpen(true);
  }

  async function handleSubmit() {
    if (!canSubmit) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const request: CreateEmployeeRequest | UpdateEmployeeRequest = {
      name: formState.name.trim(),
      email: formState.email.trim(),
      phone: Number(formState.phone),
      departmentId: Number(formState.departmentId),
      departmentName: formState.departmentName.trim(),
      role: formState.role.trim(),
      password: formState.password.trim() || undefined,
      ...(selectedEmployeeId === null
        ? { employeeId: Number(formState.employeeId) }
        : {}),
    };

    try {
      if (selectedEmployeeId === null) {
        await createEmployee(request as CreateEmployeeRequest);
      } else {
        await updateEmployee(selectedEmployeeId, request as UpdateEmployeeRequest);
      }

      setIsDialogOpen(false);
      await loadEmployees();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save employee.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function promptDelete(employee: EmployeeResponse) {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!employeeToDelete) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteEmployee(employeeToDelete.employeeId);
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      await loadEmployees();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete employee.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function cancelDelete() {
    setIsDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Manage employee records, departments, and access roles.
          </p>
        </div>

        <Button onClick={openCreateDialog}>New Employee</Button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.employeeId} className="border-t border-border/70">
                <td className="px-4 py-3 font-medium text-foreground">
                  {employee.employeeId}
                </td>
                <td className="px-4 py-3">{employee.name}</td>
                <td className="px-4 py-3">{employee.email}</td>
                <td className="px-4 py-3">{employee.departmentName}</td>
                <td className="px-4 py-3">{employee.role}</td>
                <td className="px-4 py-3">{employee.phone}</td>
                <td className="px-4 py-3 space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(employee)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => promptDelete(employee)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No employees found.
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading employees...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-lg rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle>Delete employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
                {employeeToDelete?.name}
              </span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle>{formTitle}</DialogTitle>
            <DialogDescription>
              {selectedEmployeeId
                ? "Update the employee details and save changes."
                : "Create a new employee record. A default password of 0000 will be used if no password is provided."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Employee ID</label>
              <Input
                type="number"
                min={1}
                value={formState.employeeId}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, employeeId: event.target.value }))
                }
                disabled={selectedEmployeeId !== null}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <Input
                type="tel"
                value={formState.phone}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Department ID</label>
              <Input
                type="number"
                min={1}
                value={formState.departmentId}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, departmentId: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Department Name</label>
              <Input
                value={formState.departmentName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, departmentName: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <select
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={formState.role}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, role: event.target.value }))
                }
              >
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                value={formState.password}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, password: event.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to keep the existing password or use default password for new employees.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canSubmit || isSaving} onClick={handleSubmit}>
              {selectedEmployeeId ? "Save changes" : "Create employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
