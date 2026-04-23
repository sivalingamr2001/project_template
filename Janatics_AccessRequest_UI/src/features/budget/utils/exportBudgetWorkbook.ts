import templateUrl from "@/data/Inputs for Budget Portal (5).xlsx?url"
import type { BudgetRecord } from "@/features/budget/types"
import { getTotals } from "@/features/budget/components/plan-entry/utils/budgetTableUtils"
import * as XLSX from "xlsx"

const NEW_BUDGET_CREATION_SHEET = "New Budget creation"

const HEADER_CELLS = {
  productNo: "B4",
  projectCode: "E4",
  productName: "H4",
  totalPlanned: "E48",
  totalActual: "H48",
} as const

const ITEM_ROW_MAP: Record<string, number> = {
  "product design|benchmarking sample": 12,
  "product design|fea analysis": 13,
  "product design|cfd analysis": 14,
  "product design|design consultancy": 15,
  "product design|others": 16,
  "concept development|comp devpt concept": 18,
  "concept development|machining components": 19,
  "concept development|plastic hand moulds": 20,
  "concept development|rubber moulds": 21,
  "concept development|3d printing": 22,
  "concept development|rpt": 23,
  "concept development|mim": 24,
  "concept development|jigs fixtures": 25,
  "concept development|concept testing": 26,
  "prototype development|machining components": 28,
  "prototype development|plastic inj moulds": 29,
  "prototype development|aluminium die casting": 30,
  "prototype development|investment casting": 31,
  "prototype development|stamping tools": 32,
  "prototype development|rubber moulds": 33,
  "prototype development|jigs fixtures": 34,
  "prototype development|comp mfg": 35,
  "prototype development|testing": 36,
  "product testing|testing instruments": 38,
  "product testing|testing fixtures": 39,
  "product testing|certification": 40,
  "product testing|others": 41,
  "capital equipments|testing equipments": 43,
  "capital equipments|special machines": 44,
  "capital equipments|others": 45,
  "field validation|product development": 47,
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[./()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function setSheetCell(
  worksheet: XLSX.WorkSheet,
  address: string,
  value: string | number
) {
  const existing = worksheet[address] ?? {}
  worksheet[address] = {
    ...existing,
    t: typeof value === "number" ? "n" : "s",
    v: value,
    w: undefined,
  }
}

function populateNewBudgetCreationSheet(
  worksheet: XLSX.WorkSheet,
  record: BudgetRecord
) {
  const totals = getTotals(record)

  setSheetCell(worksheet, HEADER_CELLS.productNo, record.projectHeader.productNo)
  setSheetCell(
    worksheet,
    HEADER_CELLS.projectCode,
    record.projectHeader.projectCode
  )
  setSheetCell(
    worksheet,
    HEADER_CELLS.productName,
    record.projectHeader.productName
  )
  setSheetCell(worksheet, HEADER_CELLS.totalPlanned, totals.totalPlanned)
  setSheetCell(worksheet, HEADER_CELLS.totalActual, totals.totalActual)

  for (const category of record.budgetData) {
    for (const item of category.items) {
      const row = ITEM_ROW_MAP[
        `${normalizeKey(category.category)}|${normalizeKey(item.name)}`
      ]

      if (!row) {
        continue
      }

      setSheetCell(worksheet, `E${row}`, item.planned)
      setSheetCell(worksheet, `H${row}`, item.actual)
    }
  }
}

export async function exportBudgetWorkbook(record: BudgetRecord) {
  const response = await fetch(templateUrl)
  const templateBuffer = await response.arrayBuffer()

  const workbook = XLSX.read(templateBuffer, {
    type: "array",
    cellStyles: true,
  })

  const worksheet = workbook.Sheets[NEW_BUDGET_CREATION_SHEET]

  if (!worksheet) {
    throw new Error(
      `Worksheet "${NEW_BUDGET_CREATION_SHEET}" was not found in the export template.`
    )
  }

  populateNewBudgetCreationSheet(worksheet, record)

  XLSX.writeFile(workbook, `${record.projectHeader.projectCode}-budget.xlsx`, {
    compression: true,
  })
}
