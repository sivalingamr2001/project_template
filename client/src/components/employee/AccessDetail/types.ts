export type UserRole = string | null

export interface AccessDetailValue {
  folderName: string
  accessType: string
  reason: string
  durationDays: number
}

export interface AccessDetailItemProps {
  detail: AccessDetailValue
  index: number
  totalItems: number
  currentRole: UserRole
  onRemove: (index: number) => void
  onChange: (index: number, field: keyof AccessDetailValue, value: string | number) => void
}

