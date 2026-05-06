"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { apiService } from "@/shared/lib/api-client"
import React from "react"

export default function ProjectCostReportTable({
  budgetId,
}: {
  budgetId: number
}) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        const response = await apiService.get(
          `/budgets/${budgetId}/report-data`
        )
        setData(response.data)
      } catch (error) {
        console.error("Failed to fetch report data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (budgetId) {
      fetchReport()
    }
  }, [budgetId])

  // 1. Loading & Error States (Must be before calculations)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0096D6]"></div>
        <p className="text-muted-foreground">Loading Report Data...</p>
      </div>
    )
  }

  if (!data || !data.categories) {
    return (
      <div className="p-20 text-center text-red-500">
        No report data available for this record.
      </div>
    )
  }

  // 2. Safe Grand Totals Calculations
  const totalPlanned = data.categories.reduce(
    (acc: number, cat: any) =>
      acc +
      (cat.items?.reduce(
        (sum: number, i: any) => sum + (i.estimatedAmount || 0),
        0
      ) || 0),
    0
  )

  const totalActual = data.categories.reduce(
    (acc: number, cat: any) =>
      acc +
      (cat.items?.reduce(
        (sum: number, i: any) => sum + (i.actualAmount || 0),
        0
      ) || 0),
    0
  )

  return (
    <div className="mx-auto max-w-5xl border-2 bg-white font-sans text-[11px] shadow-lg">
      {/* LOGO & HEADER */}
      <div className="flex items-center justify-between border-b-2 border-black bg-[#0096D6] p-2 text-white">
        <div className="px-4 text-lg font-bold uppercase italic underline">
          JANATICS
        </div>
        <div className="flex-1 text-center text-xl font-bold tracking-widest uppercase">
          Project Cost Report
        </div>
        <div className="min-w-[120px] border-l border-white/30 pl-4 text-left">
          <p className="font-bold">Req No : {data.budgetId}</p>
        </div>
      </div>

      {/* PROJECT INFO DETAILS */}
      <div className="grid grid-cols-2 border-b-2 border-black bg-white">
        <div className="space-y-1 border-r-2 border-black p-2">
          <p>
            <span className="inline-block w-28 font-bold uppercase">
              Product No :
            </span>{" "}
            {data.productNo || "—"}
          </p>
          <p>
            <span className="inline-block w-28 font-bold uppercase">
              Product Name :
            </span>{" "}
            {data.productName || "—"}
          </p>
          <p>
            <span className="inline-block w-28 font-bold uppercase">
              NPD No :
            </span>{" "}
            {data.projectNumber || "—"}
          </p>
        </div>
        <div className="space-y-1 p-2">
          <p>
            <span className="inline-block w-28 font-bold uppercase">
              Date :
            </span>{" "}
            {data.createdOn
              ? new Date(data.createdOn).toLocaleDateString()
              : "—"}
          </p>
          <p>
            <span className="inline-block w-28 font-bold uppercase">
              Page No :
            </span>{" "}
            1
          </p>
        </div>
      </div>

      {/* REPORT TABLE */}
      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="border-b-2 border-black bg-[#004B8D] hover:bg-[#004B8D]">
            <TableHead className="h-10 w-20 border-r border-black text-center font-bold text-white uppercase">
              Cost Breakup
            </TableHead>
            <TableHead className="border-r border-black text-center font-bold text-white uppercase">
              Description
            </TableHead>
            <TableHead className="w-32 border-r border-black text-center font-bold text-white uppercase">
              Estimated Amount (₹)
            </TableHead>
            <TableHead className="w-32 border-r border-black text-center font-bold text-white uppercase">
              Actual Amount (₹)
            </TableHead>
            <TableHead className="w-32 border-r border-black text-center font-bold text-white uppercase">
              Variance (₹)
            </TableHead>
            <TableHead className="w-40 text-center font-bold text-white uppercase">
              Remarks
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.categories.map((cat: any) => (
            <React.Fragment key={cat.categoryNumber}>
              {/* CATEGORY HEADER ROW */}
              <TableRow className="h-8 bg-[#0096D6] hover:bg-[#0096D6]">
                <TableCell className="border-r border-black text-center font-bold text-white">
                  {cat.categoryNumber}
                </TableCell>
                <TableCell
                  colSpan={5}
                  className="px-4 font-bold tracking-wider text-white uppercase"
                >
                  {cat.categoryName}
                </TableCell>
              </TableRow>

              {/* ITEM ROWS */}
              {cat.items?.map((item: any) => (
                <TableRow
                  key={item.itemNumber}
                  className="h-7 border-b border-black hover:bg-slate-50"
                >
                  <TableCell className="border-r border-black text-center font-medium">
                    {item.itemNumber}
                  </TableCell>
                  <TableCell className="border-r border-black px-4">
                    {item.itemName}
                  </TableCell>
                  <TableCell className="border-r border-black px-4 text-right">
                    {item.estimatedAmount?.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="border-r border-black px-4 text-right">
                    {item.actualAmount > 0
                      ? item.actualAmount.toLocaleString("en-IN")
                      : "-"}
                  </TableCell>
                  <TableCell
                    className={`border-r border-black px-4 text-right font-bold ${parseFloat(item.variance) < 0 ? "text-red-600" : ""}`}
                  >
                    {item.variance}
                  </TableCell>
                  <TableCell className="px-2 text-gray-500 italic">
                    {item.remarks}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}

          {/* GRAND TOTAL ROW */}
          <TableRow className="h-10 bg-[#004B8D] font-bold text-white hover:bg-[#004B8D]">
            <TableCell className="border-r border-black text-center">
              #
            </TableCell>
            <TableCell className="border-r border-black px-4 uppercase">
              Total Project Cost
            </TableCell>
            <TableCell className="border-r border-black px-4 text-right">
              {totalPlanned.toLocaleString("en-IN")}
            </TableCell>
            <TableCell className="border-r border-black px-4 text-right">
              {totalActual > 0 ? totalActual.toLocaleString("en-IN") : "-"}
            </TableCell>
            <TableCell className="border-r border-black px-4 text-right">
              {(totalPlanned - totalActual).toLocaleString("en-IN")}
            </TableCell>
            <TableCell className="border-l border-black bg-white"></TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* APPROVAL FOOTER */}
      <div className="border-t-2 border-black">
        <div className="min-h-10 border-b border-black p-2">
          <span className="mr-2 font-bold uppercase">Remarks / Decision:</span>
          <span className="text-gray-700">
            {data.approvals?.comments || "No specific remarks provided."}
          </span>
        </div>
        <div className="grid grid-cols-3 divide-x-2 divide-black bg-white text-center">
          <div className="p-3">
            <p className="mb-1 text-[10px] font-bold text-gray-500 uppercase">
              Prepared By
            </p>{" "}
            <span className="font-semibold">{data.preparedBy || "—"}</span>
          </div>
          <div className="p-3">
            <p className="mb-1 text-[10px] font-bold text-gray-500 uppercase">
              Approved On
            </p>{" "}
            <span className="font-semibold">
              {data.approvals?.approvedOn
                ? new Date(data.approvals.approvedOn).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div className="p-3">
            <p className="mb-1 text-[10px] font-bold text-gray-500 uppercase">
              Approved By
            </p>{" "}
            <span className="font-semibold">
              {data.approvals?.approverName || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* CONTROL INFO */}
      <div className="flex justify-between border-t border-black bg-gray-50 px-4 py-1 font-mono text-[9px] text-gray-400">
        <span>Form No: F/D&D/07</span>
        <span>Issue No: 4.0</span>
        <span>Rev No: 1</span>
        <span>Controlled Copy</span>
      </div>
    </div>
  )
}
