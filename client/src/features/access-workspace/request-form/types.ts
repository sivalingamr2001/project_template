import type { AccessRequestFormPayload } from "@/lib/access-request-api"

export interface NewRequestFormProps {
  initialData?: AccessRequestFormPayload
  isPending: boolean
  mode?: "create" | "edit"
  onSubmit: (values: AccessRequestFormPayload) => void
  submitLabel?: string
}

export interface AccessDetailProps {
  currentRole: string | null
  detail: AccessRequestFormPayload["items"][number]
  index: number
  onChange: (
    index: number,
    field: keyof AccessRequestFormPayload["items"][number],
    value: number | string
  ) => void
  onRemove: (index: number) => void
  totalItems: number
}
