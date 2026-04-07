import { useCallback } from "react"
import { useNewRequestForm } from "./hooks/useNewRequestForm"
import { HeaderFields } from "./components/HeaderFields"
import { AccessDetailsSection } from "./components/AccessDetailsSection"
import { AgreementSection } from "./components/AgreementSection"
import type { ExtendedNewRequestFormProps } from "./types"
import { useApp } from "@/hooks/useApp"

export function NewRequestForm({
  onSubmit,
  isPending,
  mode = "create",
  initialData,
}: ExtendedNewRequestFormProps) {
  const { currentRole } = useApp()
  const {
    formData,
    handleBaseChange,
    handleDetailChange,
    handleAddDetail,
    handleRemoveDetail,
    handleSubmit,
  } = useNewRequestForm({ onSubmit, mode, initialData })

  const handleAgreementChange = useCallback(
    (checked: boolean | "indeterminate") => {
      handleBaseChange("isAgreed", checked === true)
    },
    [handleBaseChange]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <HeaderFields formData={formData} onChange={handleBaseChange} />
      <AccessDetailsSection
        details={formData.details}
        currentRole={currentRole}
        onAdd={handleAddDetail}
        onChange={handleDetailChange}
        onRemove={handleRemoveDetail}
      />
      <AgreementSection
        isAgreed={formData.isAgreed}
        isPending={isPending}
        onChange={handleAgreementChange}
      />
    </form>
  )
}
