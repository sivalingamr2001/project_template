import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useApp } from "@/hooks/useApp"
import { IconPlus } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import AccessDetail from "./AccessDetails"
import { useAccessRequestForm } from "./hooks/useAccessRequestForm"
import type { NewRequestFormProps } from "./types"
import { UserInfoSection } from "./UserInfoSection"
import { createDefaultPayload } from "./utils/accessRequestForm"

const API_URL =
  import.meta.env.VITE_API_URL ?? "/api"

export function NewRequestForm({
  initialData,
  isPending,
  mode = "create",
  onSubmit,
  submitLabel = "Submit Request",
}: NewRequestFormProps) {
  const { currentRole, currentUser } = useApp()
  const [isFetchingUser, setIsFetchingUser] = useState(false)
  const [fetchedUser, setFetchedUser] = useState<any>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  const me = currentUser?.employeeId ?? 0
  const myHod = currentUser?.departmentHod?.employeeId ?? 0
  const { formData, setFormData } = useAccessRequestForm(
    me,
    myHod,
    initialData,
    mode
  )

  const displayUser = fetchedUser || (formData.empId === me ? currentUser : null)

  // API Sync Logic
  useEffect(() => {
    if (formData.empId > 0 && formData.empId !== me) {
      const fetcher = async () => {
        setIsFetchingUser(true)
        try {
          const res = await fetch(
            `${API_URL}/User/${formData.empId}`
          )
          if (res.ok) {
            const data = await res.json()
            setFetchedUser(data)
            if (data.departmentHod?.employeeId)
              setFormData((p) => ({
                ...p,
                reqTo: data.departmentHod.employeeId,
              }))
          } else setFetchedUser(null)
        } finally {
          setIsFetchingUser(false)
        }
      }
      const timer = setTimeout(fetcher, 600)
      return () => clearTimeout(timer)
    } else if (formData.empId === me) {
      setFetchedUser(null)
      setFormData((p) => ({ ...p, reqTo: myHod }))
    }
  }, [formData.empId, me, myHod, setFormData])

  const handleAddDetail = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, createDefaultPayload(me, myHod).items[0]],
    }))
    setExpandedIndex(formData.items.length)
  }

  const handleRemoveDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items:
        prev.items.length > 1
          ? prev.items.filter((_, i) => i !== index)
          : prev.items,
    }))
  }

  const handleDetailChange = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(formData)
      }}
      className="space-y-6"
    >
      <UserInfoSection
        empId={formData.empId}
        onEmpIdChange={(e) =>
          setFormData((p) => ({ ...p, empId: Number(e.target.value) || 0 }))
        }
        isFetching={isFetchingUser}
        displayUser={displayUser}
        itsrNo={formData.itsrNo}
        onItsrChange={(e) =>
          setFormData((p) => ({ ...p, itsrNo: e.target.value }))
        }
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Access Details
          </h3>
          {currentRole === "User" && (
            <Button
              type="button"
              size="sm"
              onClick={handleAddDetail}
              className="h-8 gap-1"
            >
              <IconPlus className="h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>
        <div className="max-h-[clamp(200px,40vh,600px)] overflow-y-auto space-y-4 pr-2">
          {formData.items.map((detail, index) => (
            <AccessDetail
              key={index}
              index={index}
              detail={detail}
              isExpanded={expandedIndex === index}
              onToggle={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              totalItems={formData.items.length}
              currentRole={currentRole}
              onRemove={handleRemoveDetail}
              onChange={handleDetailChange}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="agree"
            checked={formData.isAgree}
            onCheckedChange={(v) =>
              setFormData((p) => ({ ...p, isAgree: !!v }))
            }
          />
          <Label htmlFor="agree" className="text-sm">
            I agree to the security policy.
          </Label>
        </div>
        <Button
          type="submit"
          disabled={isPending || !formData.isAgree || isFetchingUser}
          className="w-full"
        >
          {isPending ? "Submitting..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
