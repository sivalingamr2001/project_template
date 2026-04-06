export interface AccessItemForm {
  id: number
  system: string
  accessType: string
  reason: string
  durationDays: number
}

export interface CreateRequestFormState {
  items: AccessItemForm[]
  submitting: boolean
}
