/**
 * DynamicGrid Usage Example
 * Drop this file anywhere in your project to see a working demo.
 */

import { useState, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import DynamicGrid from ".";

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "active" | "inactive";
  joined: string;
}

// ─── Static constants ─────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<User["status"], "default" | "secondary"> = {
  active: "default",
  inactive: "secondary",
};

const MOCK_DATA: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: (["Admin", "Editor", "Viewer"] as const)[i % 3],
  status: i % 4 === 0 ? "inactive" : "active",
  joined: new Date(2023, i % 12, (i % 28) + 1).toLocaleDateString(),
}));

const COLUMNS: ColumnDef<User, unknown>[] = [
  { accessorKey: "id", header: "ID", size: 60, enableColumnFilter: false },
  { accessorKey: "name", header: "Name", size: 160 },
  { accessorKey: "email", header: "Email", size: 220 },
  { accessorKey: "role", header: "Role", size: 100 },
  {
    accessorKey: "status",
    header: "Status",
    size: 100,
    cell: ({ getValue }) => {
      const status = getValue() as User["status"];
      return (
        <Badge variant={STATUS_VARIANT[status]} className="text-xs capitalize">
          {status}
        </Badge>
      );
    },
  },
  { accessorKey: "joined", header: "Joined", size: 120, enableColumnFilter: false },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function DynamicGridDemo() {
  const [data, setData] = useState<User[]>(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setData([...MOCK_DATA].sort(() => Math.random() - 0.5));
    setIsLoading(false);
  }, []);

  const handleRowSelectionChange = useCallback((rows: User[]) => {
    setSelectedUsers(rows);
  }, []);

  return (
    <div className="bg-background min-h-screen space-y-4 p-6">
      {selectedUsers.length > 0 && (
        <div className="text-muted-foreground px-1 text-sm">
          Selected: {selectedUsers.map((u) => u.name).join(", ")}
        </div>
      )}
      <DynamicGrid
        title="User Management"
        description="Manage and filter your team members"
        columns={COLUMNS}
        data={data}
        isLoading={isLoading}
        isFetching={isLoading}
        onRefresh={handleRefresh}
        canColumnFilter
        canGlobalFilter
        canColumnVisibility
        canSorting
        canPagination
        canRowSelection
        pageSize={10}
        globalFilterPlaceholder="Search users..."
        emptyMessage="No users found"
        onRowSelectionChange={handleRowSelectionChange}
      />
    </div>
  );
}
