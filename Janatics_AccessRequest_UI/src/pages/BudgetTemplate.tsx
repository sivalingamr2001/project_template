import planEntryTemplate from "@/data/planEntryTemplate.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"

export default function BudgetTemplate() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Budget Template</h1>
            <p className="text-sm text-muted-foreground">
              Create or review the budget structure used for new project planning.
            </p>
          </div>
          <Button className="mt-4 h-10 rounded-lg px-4 text-sm sm:mt-0">Download Template</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {planEntryTemplate.map((category) => (
          <Card key={category.category} className="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
