import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { SearchState } from "./types";

interface SearchBarProps {
  search: SearchState;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: SearchState["statusFilter"]) => void;
  onCreateNew: () => void;
}

export function SearchBar({
  search,
  onSearchChange,
  onStatusChange,
  onCreateNew,
}: SearchBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <Input
        placeholder="Search by Rec. No, Product Name, Project..."
        value={search.query}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      <Select value={search.statusFilter} onValueChange={(v: any) => onStatusChange(v)}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onCreateNew} className="w-full sm:w-auto">
        Create New
      </Button>
    </div>
  );
}
