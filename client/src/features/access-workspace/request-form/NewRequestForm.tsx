import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useApp } from "@/hooks/useApp"
import { IconPlus, IconShield, IconLoader2 } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import AccessDetail from "./AccessDetails"
import { useAccessRequestForm } from "./hooks/useAccessRequestForm"
import type { NewRequestFormProps } from "./types"
import { UserInfoSection } from "./UserInfoSection"
import { createDefaultPayload } from "./utils/accessRequestForm"

const API_URL = import.meta.env.VITE_API_URL ?? "/access-portal/api"

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

  const displayUser =
    fetchedUser || (formData.empId === me ? currentUser : null)

  useEffect(() => {
    if (formData.empId > 0 && formData.empId !== me) {
      const fetcher = async () => {
        setIsFetchingUser(true)
        try {
          const res = await fetch(`${API_URL}/User/${formData.empId}`)
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
      {/* Step 1: User Info Section */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h3 className="text-base font-bold mb-4 flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
            1
          </div>
          User Information
        </h3>
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
      </div>

      {/* Step 2: Access Details Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
              2
            </div>
            Access Details
            <span className="text-sm font-normal text-gray-600">
              ({formData.items.length} item{formData.items.length !== 1 ? 's' : ''})
            </span>
          </h3>
          {currentRole === "User" && (
            <Button
              type="button"
              size="sm"
              onClick={handleAddDetail}
              className="h-8 gap-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
            >
              <IconPlus className="h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {formData.items.map((detail, index) => (
            <div key={index} className="animate-in fade-in slide-in-from-top-2 duration-300">
              <AccessDetail
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
            </div>
          ))}
        </div>
      </div>

      {/* Agreement & Submit */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <Checkbox
            id="agree"
            checked={formData.isAgree}
            onCheckedChange={(v) =>
              setFormData((p) => ({ ...p, isAgree: !!v }))
            }
            className="mt-1"
          />
          <Label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer flex-1">
            <span className="font-semibold text-gray-900">I agree to the security and access policies</span>
            <p className="text-xs text-gray-600 mt-1">
              By submitting this request, I acknowledge that I have reviewed and agree to comply with all applicable security policies.
            </p>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isPending || !formData.isAgree || isFetchingUser}
          className="w-full h-11 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <IconLoader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : isFetchingUser ? (
            <>
              <IconLoader2 className="h-5 w-5 animate-spin" />
              Loading user...
            </>
          ) : (
            <>
              <IconShield className="h-5 w-5" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
