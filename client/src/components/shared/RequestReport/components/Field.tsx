import type { ReactNode } from "react"

export function Field(props: {
  label: string
  value?: string | number
  mono?: boolean
  children?: ReactNode
}) {
  const { label, value, mono = false, children } = props

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      {children ? (
        children
      ) : (
        <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
          {value || <span className="text-muted-foreground italic">N/A</span>}
        </span>
      )}
    </div>
  )
}

