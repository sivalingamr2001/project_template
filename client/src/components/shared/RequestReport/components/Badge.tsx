import type { ReactNode } from "react"

export function Badge(props: { children: ReactNode; variant?: string }) {
  const { children, variant = "default" } = props

  const variants: Record<string, string> = {
    default: "bg-card text-foreground border border-border",
    success: "bg-primary text-primary-foreground border border-primary",
    warning: "bg-secondary text-secondary-foreground border border-secondary",
    destructive: "bg-destructive text-foreground border border-destructive",
    info: "bg-secondary text-secondary-foreground border border-secondary",
    readonly: "bg-muted text-muted-foreground border border-border",
    readwrite: "bg-primary text-primary-foreground border border-primary",
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide ${
        variants[variant]
      }`}
    >
      {children}
    </span>
  )
}

