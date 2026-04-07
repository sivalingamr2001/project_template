import { useApp } from "@/context/AppContext"
import { useNewRequestForm } from "./hooks/useNewRequestForm"
import { HeaderFields } from "./components/HeaderFields"
import { AccessDetailsSection } from "./components/AccessDetailsSection"
import { AgreementSection } from "./components/AgreementSection"
import type { NewRequestFormProps } from "./types"

export function NewRequestForm({ onSubmit, isPending }: NewRequestFormProps) {
  const { currentRole } = useApp()
  const {
    formData,
    handleBaseChange,
    handleDetailChange,
    handleAddDetail,
    handleRemoveDetail,
    handleSubmit,
  } = useNewRequestForm({ onSubmit })

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
        onChange={(checked) => handleBaseChange("isAgreed", checked)}
        onSubmit={handleSubmit}
      />
    </form>
  )
}
