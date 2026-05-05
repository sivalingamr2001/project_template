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
import { cn } from "@/shared/lib/utils"
import { CalendarDays, CalendarRange, Check, MoreHorizontal, PieChart } from "lucide-react"
import { useMemo, useState } from "react"

interface Props {
    period: string // Used to show active state
    onPeriodChange: (newPeriod: string) => void
}

export function AdvancedViewPicker({ period, onPeriodChange }: Props) {
    const currentYear = new Date().getFullYear()

    // Selection states for internal menu logic
    const [selYear, setSelYear] = useState(currentYear.toString())
    const [selQuarter, setSelQuarter] = useState("Q1")
    const [selMonth, setSelMonth] = useState("January")

    // Dynamic Data
    const years = useMemo(() => {
        const start = currentYear - 1
        return Array.from({ length: 7 }, (_, i) => (start + i).toString())
    }, [currentYear])

    const quarters = ["Q1", "Q2", "Q3", "Q4"]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border-muted/20">
                <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Selection Menu
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-1" />

                {/* --- YEARLY VIEW --- */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-sm py-2">
                        <CalendarRange className="mr-2 h-4 w-4 opacity-70" />
                        <span>Yearly View</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="p-3 w-60 shadow-2xl border-muted/20 ml-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3 px-1">Fiscal Year Period</p>
                            <div className="flex items-center gap-2 mb-4 bg-muted/30 p-2 rounded-lg border border-border/40">
                                <select
                                    value={selYear}
                                    onChange={(e) => setSelYear(e.target.value)}
                                    className="flex-1 h-9 rounded-md border border-input bg-background text-sm font-medium px-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <span className="text-muted-foreground font-light">–</span>
                                <div className="flex-1 h-9 flex items-center justify-center rounded-md border border-dashed border-muted-foreground/30 bg-muted/50 text-sm font-medium text-muted-foreground select-none">
                                    {parseInt(selYear) + 1}
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="w-full h-9 text-xs font-semibold shadow-sm"
                                onClick={() => onPeriodChange(`${selYear}-${parseInt(selYear) + 1}`)}
                            >
                                Apply Yearly Range
                            </Button>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* --- QUARTERLY VIEW --- */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-sm py-2">
                        <PieChart className="mr-2 h-4 w-4 opacity-70" />
                        <span>Quarterly View</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="p-3 w-60 shadow-2xl ml-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Select Specific Quarter</p>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <select value={selYear} onChange={(e) => setSelYear(e.target.value)} className="h-9 rounded-md border text-sm px-2 bg-background">
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <select value={selQuarter} onChange={(e) => setSelQuarter(e.target.value)} className="h-9 rounded-md border text-sm px-2 bg-background">
                                    {quarters.map(q => <option key={q} value={q}>{q}</option>)}
                                </select>
                            </div>
                            <Button size="sm" variant="secondary" className="w-full h-9 text-xs font-semibold" onClick={() => onPeriodChange(`${selQuarter} ${selYear}`)}>
                                Set Quarterly
                            </Button>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* --- MONTHLY VIEW (NOW IMPLEMENTED) --- */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-sm py-2">
                        <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                        <span>Monthly View</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="p-3 w-60 shadow-2xl ml-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Select Month & Year</p>
                            <div className="space-y-2 mb-4">
                                <select value={selYear} onChange={(e) => setSelYear(e.target.value)} className="w-full h-9 rounded-md border text-sm px-2 bg-background">
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <select value={selMonth} onChange={(e) => setSelMonth(e.target.value)} className="w-full h-9 rounded-md border text-sm px-2 bg-background">
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <Button size="sm" variant="outline" className="w-full h-9 text-xs font-semibold" onClick={() => onPeriodChange(`${selMonth} ${selYear}`)}>
                                Apply Monthly View
                            </Button>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="mx-1" />

                {/* --- CUSTOM RANGE --- */}
                <DropdownMenuItem
                    onClick={() => onPeriodChange("custom")}
                    className={cn(
                        "text-xs font-bold cursor-pointer flex items-center justify-between",
                        period === "custom" ? "text-primary bg-primary/5" : "text-muted-foreground"
                    )}
                >
                    Set Custom Range...
                    {period === "custom" && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
