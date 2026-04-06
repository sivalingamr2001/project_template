import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

export function EmployeeSearchBar({ onSearch }: { onSearch: (value: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Search by employee ID"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button onClick={() => onSearch(value)}>
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </div>
  );
}
