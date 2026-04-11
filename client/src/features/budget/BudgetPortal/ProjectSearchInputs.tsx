import { Button } from "@/shared/components/ui/button";

import { SearchField } from "./SearchField";

interface Props {
  isLoading: boolean;
  onCreate: () => void;
  onOpenViaApi: () => void;
  onSearchListSubmit: (event: React.FormEvent) => void;
  productName: string;
  productNo: string;
  projectCode: string;
  setProductName: (value: string) => void;
  setProductNo: (value: string) => void;
  setProjectCode: (value: string) => void;
  canCreate: boolean;
}

export function ProjectSearchInputs({
  canCreate,
  isLoading,
  onCreate,
  onOpenViaApi,
  onSearchListSubmit,
  productName,
  productNo,
  projectCode,
  setProductName,
  setProductNo,
  setProjectCode,
}: Props) {
  return (
    <>
      <form className="grid gap-4 lg:grid-cols-3 lg:items-end" onSubmit={onSearchListSubmit}>
        <SearchField label="Project Code" onChange={setProjectCode} placeholder="e.g. NPD-2025-07" value={projectCode} />
        <SearchField label="Product No" onChange={setProductNo} placeholder="e.g. XYZ-5/2-PSV" value={productNo} />
        <Button className="h-10 px-4" type="submit" disabled={isLoading}>
          Search List
        </Button>
      </form>

      <div className="grid gap-4 lg:grid-cols-3 lg:items-end">
        <SearchField label="Product Name (for create)" onChange={setProductName} placeholder="Enter product name" value={productName} />
        <Button className="h-10 px-4" type="button" variant="outline" onClick={onOpenViaApi}>
          Open via API
        </Button>
        <Button className="h-10 px-4" type="button" onClick={onCreate} disabled={!canCreate}>
          Create Budget
        </Button>
      </div>
    </>
  );
}

