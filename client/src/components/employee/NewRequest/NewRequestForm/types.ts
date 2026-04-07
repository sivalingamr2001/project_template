import type { AccessRequestFormPayload } from "@/lib/access-request-api"

export interface NewRequestFormProps {
  onSubmit: (values: AccessRequestFormPayload) => void
  isPending: boolean
}

export interface HeaderFieldsProps {
  formData: AccessRequestFormPayload
  onChange: (field: keyof AccessRequestFormPayload, value: string | number) => void
}

export interface AccessDetailsSectionProps {
  details: AccessRequestFormPayload["details"]
  currentRole: string | null
  onAdd: () => void
  onChange: (index: number, field: string, value: string | number) => void
  onRemove: (index: number) => void
}

export interface AgreementSectionProps {
  isAgreed: boolean
  isPending: boolean
  onChange: (checked: boolean) => void
  onSubmit: (e: React.FormEvent) => void
}
