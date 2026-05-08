import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { useBudgetTeams } from "@/shared/hooks/useBudget"
import { cn } from "@/shared/lib/utils"
import {
  CalendarDays,
  CalendarRange,
  Check,
  MoreHorizontal,
  PieChart,
  Users,
} from "lucide-react"
import { useMemo, useState } from "react"

interface Props {
  period: string // Used to show active state
  selectedTeam: string
  onPeriodChange: (newPeriod: string) => void
  onTeamChange: (team: string) => void
}

export function AdvancedViewPicker({
  period,
  selectedTeam,
  onPeriodChange,
  onTeamChange,
}: Props) {
  const currentYear = new Date().getFullYear()

  const [selYear, setSelYear] = useState(currentYear.toString())
  const [selQuarter, setSelQuarter] = useState("Q1")
  const [selMonth, setSelMonth] = useState("January")

  const { teamsOptions, loading } = useBudgetTeams()

  // Dynamic Data
  const years = useMemo(() => {
    const start = currentYear - 1
    return Array.from({ length: 7 }, (_, i) => (start + i).toString())
  }, [currentYear])

  const quarters = ["Q1", "Q2", "Q3", "Q4"]
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full transition-colors hover:bg-accent"
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-muted/20 p-1.5 shadow-xl"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
          Selection Menu
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1" />

        {/* --- YEARLY VIEW --- */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="py-2 text-sm">
            <CalendarRange className="mr-2 h-4 w-4 opacity-70" />
            <span>Yearly View</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="ml-1 w-60 border-muted/20 p-3 shadow-2xl">
              <p className="mb-3 px-1 text-[10px] font-bold text-muted-foreground uppercase">
                Fiscal Year Period
              </p>
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 p-2">
                <select
                  value={selYear}
                  onChange={(e) => setSelYear(e.target.value)}
                  className="h-9 flex-1 cursor-pointer rounded-md border border-input bg-background px-2 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="font-light text-muted-foreground">–</span>
                <div className="flex h-9 flex-1 items-center justify-center rounded-md border border-dashed border-muted-foreground/30 bg-muted/50 text-sm font-medium text-muted-foreground select-none">
                  {parseInt(selYear) + 1}
                </div>
              </div>
              <Button
                size="sm"
                className="h-9 w-full text-xs font-semibold shadow-sm"
                onClick={() =>
                  onPeriodChange(`${selYear}-${parseInt(selYear) + 1}`)
                }
              >
                Apply Yearly Range
              </Button>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* --- QUARTERLY VIEW --- */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="py-2 text-sm">
            <PieChart className="mr-2 h-4 w-4 opacity-70" />
            <span>Quarterly View</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="ml-1 w-60 p-3 shadow-2xl">
              <p className="mb-3 text-[10px] font-bold text-muted-foreground uppercase">
                Select Specific Quarter
              </p>
              <div className="mb-4 grid grid-cols-2 gap-2">
                <select
                  value={selYear}
                  onChange={(e) => setSelYear(e.target.value)}
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={selQuarter}
                  onChange={(e) => setSelQuarter(e.target.value)}
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                >
                  {quarters.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-9 w-full text-xs font-semibold"
                onClick={() => onPeriodChange(`${selQuarter} ${selYear}`)}
              >
                Set Quarterly
              </Button>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* --- MONTHLY VIEW (NOW IMPLEMENTED) --- */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="py-2 text-sm">
            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
            <span>Monthly View</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="ml-1 w-60 p-3 shadow-2xl">
              <p className="mb-3 text-[10px] font-bold text-muted-foreground uppercase">
                Select Month & Year
              </p>
              <div className="mb-4 space-y-2">
                <select
                  value={selYear}
                  onChange={(e) => setSelYear(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={selMonth}
                  onChange={(e) => setSelMonth(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-full text-xs font-semibold"
                onClick={() => onPeriodChange(`${selMonth} ${selYear}`)}
              >
                Apply Monthly View
              </Button>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="py-2 text-sm">
            <Users className="mr-2 h-4 w-4 opacity-70" />
            <span>{loading ? "Loading..." : "Filter by Team"}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="ml-1 w-56 p-1.5 shadow-2xl">
              <DropdownMenuItem onClick={() => onTeamChange("")} className="flex items-center justify-between">
                All Teams
                {selectedTeam === "" && <Check className="h-3 w-3" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* 2. Map through the fetched team names */}
              {teamsOptions.map((team) => (
                <DropdownMenuItem
                  key={team}
                  onClick={() => onTeamChange(team)} // Changed from setTeams
                  className="flex items-center justify-between"
                >
                  {team}
                  {/* 3. Visual indicator for selection */}
                  {selectedTeam === team && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="mx-1" />

        {/* --- CUSTOM RANGE --- */}
        <DropdownMenuItem
          onClick={() => onPeriodChange("custom")}
          className={cn(
            "flex cursor-pointer items-center justify-between text-xs font-bold",
            period === "custom"
              ? "bg-primary/5 text-primary"
              : "text-muted-foreground"
          )}
        >
          Set Custom Range...
          {period === "custom" && <Check className="h-3 w-3" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
