import type { RequisitionFormData } from "./types";

export const fetchMockRequisitionData = (): Promise<RequisitionFormData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        recNo: "REQ-2026-042",
        date: "2026-05-13",
        pageNo: "1 of 1",
        from: "Design & Development Team",
        to: "Materials - D&D",
        productNo: "P-88391",
        rev: "02",
        projectNo: "PRJ-9910",
        productName: 'High-Pressure Solenoid Valve 1/2"',
        purpose: "New product validation",
        monthlyQty: "500 Units",
        parts: [
          {
            sNo: 1,
            partNo: "PT-001-A",
            rev: "01",
            partName: "Aluminum Valve Body Plunger",
            qty: 10,
            requiredDate: "2026-05-20",
            committedDate: "2026-05-19",
            actualCompletionDate: "",
          },
          {
            sNo: 2,
            partNo: "PT-042-B",
            rev: "00",
            partName: "NBR Nitrile Rubber O-Ring Seal",
            qty: 50,
            requiredDate: "2026-05-20",
            committedDate: "2026-05-22",
            actualCompletionDate: "",
          },
        ],
        moqWarningAccepted: true,
        signatures: {
          prepared: { name: "Alex Kumar", date: "2026-05-13 09:00 AM" },
          checked: { name: "Sarah Jenkins", date: "2026-05-13 10:15 AM" },
          approved: { name: "", date: "" },
          received: { name: "", date: "" },
        },
      });
    }, 400);
  });
};
