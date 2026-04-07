import type { HODAccessTypes } from "@/lib/types"

export type DialogActionType = "APPROVE" | "REJECT" | null

export interface DialogPageProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: DialogActionType
  onActionTypeChange: (type: DialogActionType) => void
}

export type TempTypesMap = Record<number, HODAccessTypes>
export type TempDurationsMap = Record<number, number>

