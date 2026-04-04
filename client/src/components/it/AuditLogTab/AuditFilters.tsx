import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const options = ['All', 'RequestCreated', 'HODApproved', 'ITApproved', 'Revoked'];

export function AuditFilters({ onChange }: { onChange: (value: string) => void }) {
  return (
    <Select defaultValue="All" onValueChange={onChange}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Filter action" />
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
