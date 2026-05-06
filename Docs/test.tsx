"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Row = {
  code: string
  label: string
}

type Section = {
  title: string
  rows: Row[]
}

const sections: Section[] = [
  {
    title: "1. Information Collection",
    rows: [
      { code: "1.1", label: "Visiting fairs" },
      { code: "1.2", label: "Purchase of books, periodicals, standards etc." },
      { code: "1.3", label: "Samples purchase (Bench marked product)" },
      { code: "1.4", label: "Others" },
    ],
  },
  {
    title: "2. Product Design",
    rows: [
      { code: "2.1", label: "3D Modelling / Design calculations" },
      { code: "2.2", label: "Assembly / Sub assembly drawings" },
      { code: "2.3", label: "Parts drawings" },
      { code: "2.4", label: "Design verification" },
      { code: "2.5", label: "Simulation, analysis etc." },
      { code: "2.6", label: "Others" },
    ],
  },
  {
    title: "3. Concept Test - Physical Model",
    rows: [
      { code: "3.1", label: "Design verification, validation" },
      { code: "3.2", label: "Qty. to be manufactured" },
      { code: "3.3", label: "Others" },
    ],
  },
  {
    title: "4. Prototype Testing",
    rows: [
      { code: "4.1", label: "Development tools" },
      { code: "4.2", label: "Product Assembly fixtures" },
      { code: "4.3", label: "Prototype Manufacturing Qty" },
      { code: "4.4", label: "Functional / other testing" },
      { code: "4.5", label: "Reliability / Life testing" },
      { code: "4.6", label: "Others" },
    ],
  },
  {
    title: "5. Product Testing & Measuring Equipment",
    rows: [
      { code: "5.1", label: "Testing fixtures" },
      { code: "5.2", label: "Certifications" },
    ],
  },
  {
    title: "6. Capital Equipment",
    rows: [
      { code: "6.1", label: "Special Machineries" },
      { code: "6.2", label: "Others" },
    ],
  },
  {
    title: "7. Significant Production Run / Pilot Batch",
    rows: [
      { code: "7.1", label: "Process capability study (tooled components)" },
      { code: "7.2", label: "Process trials (machined components)" },
      { code: "7.3", label: "Pilot lot - Assembly & Testing" },
    ],
  },
  {
    title: "8. Production Tooling",
    rows: [
      { code: "8.1", label: "Moulds, Dies, press tools" },
      { code: "8.2", label: "Jigs & Fixtures" },
      { code: "8.3", label: "Others" },
    ],
  },
  {
    title: "9. Field Trials",
    rows: [],
  },
  {
    title: "10. Other Overheads",
    rows: [],
  },
  {
    title: "11. Total Cost - Direct",
    rows: [],
  },
  {
    title: "12. Indirect Costs",
    rows: [
      { code: "12.1", label: "Factory overheads" },
      { code: "12.2", label: "Contingencies expenses" },
      { code: "12.3", label: "Team members / duration cost" },
    ],
  },
  {
    title: "13. Total Project Cost",
    rows: [],
  },
]

export default function ProjectCostReportTable() {
  return (
    <div className="p-6 border rounded-2xl shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">
        Project Cost Report
      </h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right w-[150px]">
              Amount (₹)
            </TableHead>
            <TableHead className="w-[200px]">Remarks</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sections.map((section, idx) => (
            <>
              {/* Section Header */}
              <TableRow key={`section-${idx}`}>
                <TableCell
                  colSpan={4}
                  className="font-semibold bg-muted"
                >
                  {section.title}
                </TableCell>
              </TableRow>

              {/* Rows */}
              {section.rows.map((row) => (
                <TableRow key={row.code}>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-right">
                    {/* Hook input here later */}
                    —
                  </TableCell>
                  <TableCell>
                    {/* Remarks input */}
                    —
                  </TableCell>
                </TableRow>
              ))}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}