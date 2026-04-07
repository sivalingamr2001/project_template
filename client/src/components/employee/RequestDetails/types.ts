import type { AccessItem } from "@/lib/types"

export type DialogActionType = "APPROVE" | "REJECT" | null

export interface WorkflowStep {
  label: string
  status: "complete" | "active" | "failed" | "pending"
  description: string
}

export interface WorkflowFlags {
  hodStageCompleted: boolean
  itStageCompleted: boolean
  rejectedAtHOD: boolean
  rejectedAtIT: boolean
}

export type SelectedItem = AccessItem

