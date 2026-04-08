import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import type { AccessRequestItem } from "../../types"
import { ACCESS_OPTIONS } from "../../request-form/utils/accessRequestForm"

type ReviewItemCardProps = {
  isHod: boolean
  item: AccessRequestItem
  onConfirmChange: (value: number) => void
  value: number
}

function ReviewItemCard({ isHod, item, onConfirmChange, value }: ReviewItemCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Folder Path"><Input disabled value={item.folderPath} /></Field>
        <Field label="Access Type"><Input disabled value={item.accessType} /></Field>
        <Field label="Confirm Access Type By HOD">{isHod ? <Select value={String(value)} onValueChange={(next) => onConfirmChange(Number(next))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{ACCESS_OPTIONS.map((option) => <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>)}</SelectContent></Select> : <Input disabled value={item.accessType} />}</Field>
      </div>
      <Field className="mt-4" label="Reason"><Textarea disabled rows={2} value={item.reason} /></Field>
    </div>
  )
}

function Field({ children, className = "", label }: { children: React.ReactNode; className?: string; label: string }) {
  return <div className={`space-y-2 ${className}`}><Label>{label}</Label>{children}</div>
}

export default ReviewItemCard
