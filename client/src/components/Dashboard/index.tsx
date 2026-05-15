import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { SearchBar } from "./SearchBar";
import { RequisitionTable } from "./RequisitionTable";
import { useSearch } from "./useSearch";
import { mockRequisitions } from "../../utils/mock-data";
import type { DashboardProps } from "./types";

export function Dashboard({
  user,
  onLogout,
  onSelectDocument,
  onCreateNew,
}: DashboardProps) {
  const [documents] = useState(mockRequisitions);
  const { search, filtered, setQuery, setStatus } = useSearch(documents);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage component development requisitions
            </p>
          </div>
        </header>

        <main className="p-8">
          <SearchBar
            search={search}
            onSearchChange={setQuery}
            onStatusChange={setStatus}
            onCreateNew={onCreateNew}
          />
          <RequisitionTable documents={filtered} onSelect={onSelectDocument} />
        </main>
      </div>
    </div>
  );
}
