import type { RequisitionDocument } from "../../types";

export interface DashboardProps {
  user: { email: string; name: string };
  onLogout: () => void;
  onSelectDocument: (doc: RequisitionDocument) => void;
  onCreateNew: () => void;
}

export interface SearchState {
  query: string;
  statusFilter: "all" | "draft" | "pending" | "approved";
}
