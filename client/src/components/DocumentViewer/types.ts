export interface PartItem {
  sNo: number;
  partNo: string;
  rev: string;
  partName: string;
  qty: number;
  requiredDate: string;
  committedDate: string;
  actualCompletionDate: string;
}

export interface RequisitionFormData {
  recNo: string;
  date: string;
  pageNo: string;
  from: string;
  to: string;
  productNo: string;
  rev: string;
  projectNo: string;
  productName: string;
  purpose: string;
  monthlyQty: string;
  parts: PartItem[];
  moqWarningAccepted: boolean;
  signatures: {
    prepared: { name: string; date: string };
    checked: { name: string; date: string };
    approved: { name: string; date: string };
    received: { name: string; date: string };
  };
}
