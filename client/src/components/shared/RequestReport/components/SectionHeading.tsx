import type { LucideIcon } from "lucide-react"

export function SectionHeading(props: { icon: LucideIcon; label: string }) {
  const { icon: Icon, label } = props

  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-lg">
        <Icon size={18} />
      </span>
      <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
        {label}
      </h3>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

