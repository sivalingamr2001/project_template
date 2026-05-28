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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { AppRole } from "../types"
import {
  fetchUserProfile,
  updateUserProfile,
  type UpdateUserPayload,
} from "../utils/requestApi"
import type { AuthUser } from "@/context/AuthContext"

type EditEmployeeModalProps = {
  userId: number | null
  open: boolean
  onClose: () => void
  onSaved: (updated: AuthUser) => void
}

export default function EditEmployeeModal({
  userId,
  open,
  onClose,
  onSaved,
}: EditEmployeeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")
  const [role, setRole] = useState<AppRole>("User")

  useEffect(() => {
    if (!open || !userId) return
    setIsLoading(true)
    setError(null)
    void (async () => {
      try {
        const profile = await fetchUserProfile(userId)
        setName(profile.name ?? profile.userName ?? "")
        setEmail(profile.email ?? "")
        setLocation((profile as any).location ?? "")
        setRole(profile.role as AppRole)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load employee.")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [userId, open])

  const onSubmit = async () => {
    if (!userId) return
    setIsSaving(true)
    setError(null)
    try {
      const payload: UpdateUserPayload = {
        location,
        role,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="animate-pulse text-sm text-muted-foreground">
              Loading...
            </p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  disabled
                  className="w-full cursor-not-allowed bg-muted"
                />
              </div>
              <div className="min-w-0 space-y-2">
                <Label>Email</Label>
                <Input
                  value={email}
                  disabled
                  className="w-full cursor-not-allowed bg-muted"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label>Role</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as AppRole)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Hod">HOD</SelectItem>
                    <SelectItem value="Operator">Operator</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="empLocation">Location</Label>
                <Input
                  id="empLocation"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm font-medium text-destructive">{error}</p>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSaving || isLoading || !userId}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
