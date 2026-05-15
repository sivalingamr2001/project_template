import type { RequisitionDocument, Part } from "../types";

const mockParts: Part[] = [
  {
    sNo: 1,
    partNo: "PART-001",
    rev: "A",
    partName: "Microcontroller MCU32",
    qty: 500,
    requiredDate: new Date("2024-06-15"),
    committedDate: new Date("2024-06-10"),
    actualCompletionDate: new Date("2024-06-09"),
  },
  {
    sNo: 2,
    partNo: "PART-002",
    rev: "B",
    partName: "Capacitor 100uF",
    qty: 1000,
    requiredDate: new Date("2024-06-20"),
    committedDate: new Date("2024-06-18"),
    actualCompletionDate: null,
  },
];

export const mockRequisitions: RequisitionDocument[] = [
  {
    recNo: "REC-2024-001",
    date: new Date("2024-06-01"),
    pageNo: "1",
    fromTeam: "D&D Team",
    toTeam: "Materials-D&D",
    productNo: "PRD-001",
    productRev: "1.0",
    projectNo: "PROJ-2024",
    productName: "Smart IoT Device v2",
    purpose: "new-product-validation",
    monthlyQty: 5000,
    status: "approved",
    parts: mockParts,
    preparedBy: "John Doe",
    preparedDate: new Date("2024-06-01"),
    checkedBy: "Jane Smith",
    checkedDate: new Date("2024-06-02"),
    approvedBy: "Admin User",
    approvedDate: new Date("2024-06-03"),
    receivedBy: "Store Manager",
    receivedDate: new Date("2024-06-04"),
  },
  {
    recNo: "REC-2024-002",
    date: new Date("2024-05-15"),
    pageNo: "1",
    fromTeam: "D&D Team",
    toTeam: "Materials-D&D",
    productNo: "PRD-002",
    productRev: "2.1",
    projectNo: "PROJ-2024",
    productName: "Wireless Sensor Module",
    purpose: "sales",
    monthlyQty: 10000,
    status: "draft",
    parts: mockParts,
  },
];

export const mockUser = {
  id: "1",
  email: "user@example.com",
  name: "John Developer",
};
