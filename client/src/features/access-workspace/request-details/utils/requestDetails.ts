import type { AccessRequestItem, AccessRequestTimeline } from "../../types"

type StageCard = {
  description: string
  label: string
  tone: "active" | "complete" | "failed" | "pending"
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" })
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
})
const STAGE_LABELS = [
  "Submitted",
  "Pending HOD",
  "Pending IT",
  "Access Granted",
  "Rejected",
  "Revoked",
  "Expired",
]

export function formatRequestDate(value: string | null) {
  return value ? DATE_FORMATTER.format(new Date(value)) : "Not available"
}

export function formatRequestDateTime(value: string | null) {
  return value ? DATE_TIME_FORMATTER.format(new Date(value)) : "Not available"
}

export function buildStageCards(status: any): StageCard[] {
  return STAGE_LABELS.map((label, index) => ({
    description: getStageDescription(index),
    label,
    tone: getStageTone(status, index),
  }))
}

export function findInitialItemId(items: AccessRequestItem[]) {
  return items[0]?.accessItemId ?? 0
}

export function getUniqueTimelineEntries(timeline: AccessRequestTimeline[]) {
  const seen = new Set<string>()

  return timeline.filter((entry) => {
    const key = `${entry.eventType}|${entry.message}|${entry.createdOn}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getStageDescription(index: number) {
  return (
    [
      "Request created and recorded.",
      "Business validation by HOD.",
      "IT infrastructure approval.",
      "Access delivered to requester.",
      "Request rejected by approver.",
      "Access revoked after approval.",
      "Access expired need renewal.",
    ][index] ?? ""
  )
}

function getStageTone(status: string, index: number): StageCard["tone"] {
  const failed =
    status.includes("Rejected") || status === "Revoked" || status === "Expired"
  const activeIndex = Math.max(
    STAGE_LABELS.findIndex((item) => item === status),
    0
  )
  if (failed && index >= activeIndex)
    return index === activeIndex ? "failed" : "pending"
  if (status === "Access Granted") return "complete"
  if (index < activeIndex) return "complete"
  if (index === activeIndex) return "active"
  return "pending"
}
