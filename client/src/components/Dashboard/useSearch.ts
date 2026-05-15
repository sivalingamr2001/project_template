import { useState, useMemo } from "react";
import type { RequisitionDocument } from "../../types";
import type { SearchState } from "./types";

export function useSearch(documents: RequisitionDocument[]) {
  const [search, setSearch] = useState<SearchState>({
    query: "",
    statusFilter: "all",
  });

  const filtered = useMemo(() => {
    let result = documents;

    if (search.statusFilter !== "all") {
      result = result.filter((doc) => {
        if (search.statusFilter === "approved") return doc.approvedBy;
        if (search.statusFilter === "pending") return doc.checkedBy && !doc.approvedBy;
        return !doc.checkedBy && !doc.approvedBy;
      });
    }

    if (search.query) {
      const q = search.query.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.recNo.toLowerCase().includes(q) ||
          doc.productName.toLowerCase().includes(q) ||
          doc.projectNo.toLowerCase().includes(q),
      );
    }

    return result;
  }, [documents, search]);

  return {
    search,
    filtered,
    setQuery: (query: string) => setSearch((prev) => ({ ...prev, query })),
    setStatus: (status: SearchState["statusFilter"]) =>
      setSearch((prev) => ({ ...prev, statusFilter: status })),
  };
}
