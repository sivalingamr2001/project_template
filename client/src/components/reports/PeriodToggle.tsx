import { Button } from '@/components/ui/button'
import type { ReportPeriod } from '@/types/budget'

interface PeriodToggleProps {
  selected: ReportPeriod
  options: ReportPeriod[]
  onChange: (value: ReportPeriod) => void
}

export function PeriodToggle({ selected, options, onChange }: PeriodToggleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          size="sm"
          variant={selected === option ? 'secondary' : 'outline'}
          onClick={() => onChange(option)}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </Button>
      ))}
    </div>
  )
}
