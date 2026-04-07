import type { AccessRequestFormPayload } from "@/lib/access-request-api"

export interface NewRequestFormProps {
  onSubmit: (values: AccessRequestFormPayload) => void
  isPending: boolean
}

export interface ExtendedNewRequestFormProps extends NewRequestFormProps {
  mode?: "create" | "edit"
  initialData?: AccessRequestFormPayload
}