import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProjectSelectorProps {
  projects: string[]
  selected: string
  onChange: (value: string) => void
}

export function ProjectSelector({ projects, selected, onChange }: ProjectSelectorProps) {
  return (
    <Select value={selected} onValueChange={(value) => onChange(value)}>
      <SelectTrigger className="w-52">
        <SelectValue>{selected === 'all' ? 'All Projects' : selected}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Projects</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project} value={project}>
            {project}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
