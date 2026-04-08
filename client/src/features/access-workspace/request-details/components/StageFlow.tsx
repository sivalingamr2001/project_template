import { buildStageCards } from "../utils/requestDetails"

type StageFlowProps = {
  status: string
}

const TONE_CLASS = {
  active: "border-primary text-primary",
  complete: "border-primary bg-primary/10 text-primary",
  failed: "border-destructive bg-destructive/10 text-destructive",
  pending: "border-border text-muted-foreground",
} as const

function StageFlow({ status }: StageFlowProps) {
  const cards = buildStageCards(status)

  return (
    <div className="grid gap-3 xl:grid-cols-4">
      {cards.map((card, index) => (
        <article
          key={card.label}
          className={`rounded-[0.9rem] border bg-card p-4 ${TONE_CLASS[card.tone]}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current text-sm font-semibold">
              {index + 1}
            </span>
            <span className="text-[11px] tracking-[0.24em] uppercase">
              {card.tone}
            </span>
          </div>
          <h2 className="mt-3 font-semibold">{card.label}</h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {card.description}
          </p>
        </article>
      ))}
    </div>
  )
}

export default StageFlow
