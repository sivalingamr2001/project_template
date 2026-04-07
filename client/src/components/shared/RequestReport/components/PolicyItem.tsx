export function PolicyItem(props: {
  num: number
  title: string
  body: string
}) {
  const { num, title, body } = props

  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card/60 p-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[10px] font-bold text-muted-foreground">
        {num}
      </div>
      <div>
        <span className="text-xs font-semibold text-muted-foreground">{title}: </span>
        <span className="text-xs text-foreground">{body}</span>
      </div>
    </div>
  )
}

