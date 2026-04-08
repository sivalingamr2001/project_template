import type { SummaryCard } from "../types"

type StatsGridProps = {
  cards: SummaryCard[]
}

function StatsGrid({ cards }: StatsGridProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[1.4rem] border border-border bg-background p-4"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            {card.label}
          </p>
          <p className="mt-3 text-3xl font-semibold">{card.value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
        </div>
      ))}
    </div>
  )
}

export default StatsGrid
