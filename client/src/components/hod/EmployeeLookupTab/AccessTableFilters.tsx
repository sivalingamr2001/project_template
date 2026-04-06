import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const options = ['All', 'Read', 'Write', 'Full'];

export function AccessTableFilters({
  onChange,
}: {
  onChange: (value: string) => void;
}) {
  return (
    <Select defaultValue="All" onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Filter" />
      </SelectTrigger>
      <SelectContent>
        {options.map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
