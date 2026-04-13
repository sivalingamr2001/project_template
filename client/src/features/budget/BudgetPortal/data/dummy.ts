import type { BudgetRecord } from "../types";

export const DUMMY_BUDGET: BudgetRecord = {
  header: {
    budgetId: 0,
    employeeId: 0,
    projectCode: "PROJ-DUMMY",
    productNo: "DUMMY-123",
    projectTitle: "Sample R&D Project (Dummy Data)",
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  categories: [
    {
      categoryId: 1,
      categoryName: "Product Design",
      items: [
        { itemId: 101, itemName: "Benchmarking sample", planned: 50000, actual: 45000 },
        { itemId: 102, itemName: "FEA Analysis", planned: 120000, actual: 125000 },
        { itemId: 103, itemName: "CFD Analysis", planned: 80000, actual: 0 },
      ],
    },
    {
      categoryId: 2,
      categoryName: "Concept devpt.",
      items: [
        { itemId: 201, itemName: "3D printing", planned: 35000, actual: 38000 },
        { itemId: 202, itemName: "Jigs & fixtures", planned: 95000, actual: 92000 },
      ],
    },
    {
      categoryId: 3,
      categoryName: "Prototype devpt.",
      items: [
        { itemId: 301, itemName: "Machining components", planned: 250000, actual: 240000 },
        { itemId: 302, itemName: "Testing", planned: 60000, actual: 55000 },
      ],
    },
  ],
};
