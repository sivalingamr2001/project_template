interface SummaryCardProps {
  title: string
  value: string
  note: string
  accent?: "slate" | "violet" | "rose" | "emerald"
}

export function SummaryCard({
  title,
  value,
  note,
  accent = "slate",
}: SummaryCardProps) {
  const accentClass =
    accent === "violet"
      ? "text-violet-600"
      : accent === "rose"
        ? "text-rose-600"
        : accent === "emerald"
          ? "text-emerald-600"
          : ""

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5 shadow-sm">
      <div className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </div>
      <div className={`mt-4 text-3xl font-semibold ${accentClass}`}>
        {value}
      </div>
      {note ? (
        <div className="mt-2 text-sm text-muted-foreground">{note}</div>
      ) : null}
    </div>
  )
}
