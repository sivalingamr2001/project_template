import { useEffect, useState } from "react"

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

import type { Department } from "../types"
import { createDepartment, updateDepartment } from "../utils/requestApi"

type EditDepartmentModalProps = {
  mode: "create" | "edit"
  open: boolean
  department: Department | null
  onClose: () => void
  onSaved: () => void
}

export default function EditDepartmentModal({
  mode,
  open,
  department,
  onClose,
  onSaved,
}: EditDepartmentModalProps) {
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setId(department ? String(department.id) : "")
    setName(department?.name ?? "")
    setError(null)
  }, [department, open])

  const canSubmit =
    !isSaving &&
    (mode === "edit" || (Number.isFinite(Number(id)) && Number(id) > 0)) &&
    name.trim()

  const onSubmit = async () => {
    if (!canSubmit) return
    setIsSaving(true)
    setError(null)
    try {
      if (mode === "create") {
        await createDepartment({ id: Number(id), name })
      } else if (department) {
        await updateDepartment({ id: department.id, name })
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save department.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Department" : "Edit Department"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deptId">Department ID</Label>
              <Input
                id="deptId"
                value={id}
                onChange={(e) => setId(e.target.value)}
                inputMode="numeric"
                disabled={mode === "edit"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deptName">Department</Label>
              <Input
                id="deptName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={!canSubmit}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

