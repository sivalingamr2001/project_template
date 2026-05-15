export interface Part {
  sNo: number;
  partNo: string;
  rev: string;
  partName: string;
  qty: number;
  requiredDate: Date | null;
  committedDate: Date | null;
  actualCompletionDate: Date | null;
}

export interface RequisitionDocument {
  recNo: string;
  date: Date;
  pageNo: string;
  fromTeam: string;
  toTeam: string;
  productNo: string;
  productRev: string;
  projectNo: string;
  productName: string;
  purpose: string;
  monthlyQty: number;
  status: string;
  parts: Part[];
  preparedBy?: string;
  preparedDate?: Date;
  checkedBy?: string;
  checkedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
  receivedBy?: string;
  receivedDate?: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
