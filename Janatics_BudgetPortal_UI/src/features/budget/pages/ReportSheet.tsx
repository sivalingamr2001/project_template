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
import Logo from "@/assets/jana.png"

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
        const response = await apiService.get(`/budgets/${budgetId}/report-data`)
        setData(response.data)
      } catch (error) {
        console.error("Failed to fetch report data:", error)
      } finally {
        setLoading(false)
      }
    }
    if (budgetId) fetchReport()
  }, [budgetId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0096D6]"></div>
        <p className="text-muted-foreground animate-pulse">Loading Report Data...</p>
      </div>
    )
  }

  if (!data || !data.categories) {
    return (
      <div className="p-20 text-center text-red-500 font-bold uppercase tracking-wider">
        No report data available for this record.
      </div>
    )
  }

  // Calculation logic including sub-category items
  const calculateTotal = (type: "estimatedAmount" | "actualAmount") => {
    return data.categories.reduce((acc: number, cat: any) => {
      const itemTotal = cat.items?.reduce((sum: number, i: any) => sum + (i[type] || 0), 0) || 0
      const subTotal = cat.subCategories?.reduce((sum: number, sub: any) =>
        sum + (sub.items?.reduce((s: number, si: any) => s + (si[type] || 0), 0) || 0), 0) || 0
      return acc + itemTotal + subTotal
    }, 0)
  }

  const totalPlanned = calculateTotal("estimatedAmount")
  const totalActual = calculateTotal("actualAmount")

  return (
    <div className="w-full p-2 md:p-4 bg-slate-50">
      <div className="mx-auto max-w-6xl border-2 border-black bg-white font-sans text-[10px] md:text-[11px] shadow-2xl">

        {/* LOGO & HEADER */}
        {/* LOGO & HEADER - SINGLE LINE TIGHT LAYOUT */}
        <div className="flex items-center justify-between border-b-2 border-black bg-[#0096D6] h-12 text-white overflow-hidden">
          {/* Logo Section */}
          <div className="px-4 flex items-center h-full">
            <img
              src={Logo}
              alt="JANATICS"
              className="h-5 w-auto object-contain brightness-0 invert"
            />
          </div>

          {/* Title Section */}
          <div className="flex-1 text-center text-sm md:text-base font-bold tracking-[0.3em] uppercase">
            Project Cost Report
          </div>

          {/* Req No Section */}
          <div className="h-full flex items-center px-4 border-l border-white/30 min-w-[100px] justify-end">
            <p className="font-bold text-[10px] whitespace-nowrap">
              Req No : {data.budgetId}
            </p>
          </div>
        </div>

        {/* PROJECT INFO DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b-2 border-black">
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r-2 border-black p-3">
            <p><span className="inline-block w-24 font-bold uppercase text-gray-600">Product No :</span> {data.productNo || "—"}</p>
            <p><span className="inline-block w-24 font-bold uppercase text-gray-600">Product Name :</span> {data.productName || "—"}</p>
            <p><span className="inline-block w-24 font-bold uppercase text-gray-600">NPD No :</span> {data.projectNumber || "—"}</p>
          </div>
          <div className="space-y-1 p-3 bg-gray-50/50">
            <p><span className="inline-block w-24 font-bold uppercase text-gray-600">Date :</span> {data.createdOn ? new Date(data.createdOn).toLocaleDateString("en-IN") : "—"}</p>
            <p><span className="inline-block w-24 font-bold uppercase text-gray-600">Page No :</span> 1</p>
          </div>
        </div>

        {/* REPORT TABLE */}
        <div className="overflow-x-auto">
          <Table className="border-collapse min-w-[800px]">
            <TableHeader>
              <TableRow className="border-b-2 border-black bg-[#004B8D] hover:bg-[#004B8D]">
                <TableHead className="h-10 w-20 border-r border-black text-center font-bold text-white uppercase">Cost Breakup</TableHead>
                <TableHead className="border-r border-black text-center font-bold text-white uppercase text-[10px]">Description</TableHead>
                <TableHead className="w-32 border-r border-black text-center font-bold text-white uppercase text-[10px]">Estimated (₹)</TableHead>
                <TableHead className="w-32 border-r border-black text-center font-bold text-white uppercase text-[10px]">Actual (₹)</TableHead>
                <TableHead className="w-32 border-r border-black text-center font-bold text-white uppercase text-[10px]">Variance (₹)</TableHead>
                <TableHead className="w-40 text-center font-bold text-white uppercase text-[10px]">Remarks</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.categories.map((cat: any) => (
                <React.Fragment key={cat.categoryNumber}>
                  {/* MAIN CATEGORY HEADER (e.g., 1, 2, 3) */}
                  <TableRow className="h-8 bg-[#0096D6] hover:bg-[#0096D6]">
                    <TableCell className="border-r border-black text-center font-bold text-white">
                      {cat.categoryNumber}
                    </TableCell>
                    <TableCell colSpan={5} className="px-4 font-bold tracking-wider text-white uppercase">
                      {cat.categoryName}
                    </TableCell>
                  </TableRow>

                  {/* STANDARD ITEMS (e.g., 2.1, 2.2) */}
                  {cat.items?.map((item: any) => (
                    <TableRow key={item.itemNumber} className="h-7 border-b border-black hover:bg-slate-50 transition-colors">
                      <TableCell className="border-r border-black text-center font-medium bg-gray-50">
                        {item.itemNumber}
                      </TableCell>
                      <TableCell className="border-r border-black px-4 font-medium">
                        {item.itemName}
                      </TableCell>
                      <TableCell className="border-r border-black px-4 text-right">
                        {item.estimatedAmount?.toLocaleString("en-IN") || "-"}
                      </TableCell>
                      <TableCell className="border-r border-black px-4 text-right font-semibold">
                        {item.actualAmount > 0 ? item.actualAmount.toLocaleString("en-IN") : "-"}
                      </TableCell>
                      <TableCell className={`border-r border-black px-4 text-right font-bold ${parseFloat(item.variance) < 0 ? "text-red-600" : "text-green-600"}`}>
                        {item.variance}
                      </TableCell>
                      <TableCell className="px-2 text-[9px] text-gray-500 italic leading-tight">
                        {item.remarks}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* SUB-CATEGORIES WITH NESTED NUMBERING */}
                  {cat.subCategories?.map((sub: any, subIdx: number) => {
                    // Calculate sub-category number based on main items count (e.g., 2.14)
                    const subCatNumber = `${cat.categoryNumber}.${(cat.items?.length || 0) + subIdx + 1}`;

                    return (
                      <React.Fragment key={`sub-${subIdx}`}>
                        {/* Sub-Category Row */}
                        <TableRow className="h-7 bg-[#0096D6]/5 border-b border-black">
                          <TableCell className="border-r border-black text-center font-bold text-gray-700">
                            {subCatNumber}
                          </TableCell>
                          <TableCell colSpan={5} className="px-6 font-bold text-[#004B8D] italic">
                            {sub.name}
                          </TableCell>
                        </TableRow>

                        {/* Sub-Category Items (e.g., 2.14.1, 2.14.2) */}
                        {sub.items?.map((subItem: any, siIdx: number) => (
                          <TableRow key={`si-${siIdx}`} className="h-7 border-b border-black bg-white hover:bg-blue-50/30">
                            <TableCell className="border-r border-black text-center text-[9px] font-medium text-gray-400 bg-gray-50/30">
                              {`${subCatNumber}.${siIdx + 1}`}
                            </TableCell>
                            <TableCell className="border-r border-black pl-12 pr-4 text-gray-700">
                              {subItem.name || subItem.itemName}
                            </TableCell>
                            <TableCell className="border-r border-black px-4 text-right text-gray-600">
                              {subItem.estimatedAmount?.toLocaleString("en-IN") || "0"}
                            </TableCell>
                            <TableCell className="border-r border-black px-4 text-right font-semibold">
                              {subItem.actualAmount > 0 ? subItem.actualAmount.toLocaleString("en-IN") : "-"}
                            </TableCell>
                            <TableCell className="border-r border-black px-4 text-right text-gray-500">
                              {subItem.variance || "0.00"}
                            </TableCell>
                            <TableCell className="px-2 text-[9px] text-gray-400 italic">
                              {subItem.remarks}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              ))}

              {/* GRAND TOTAL ROW */}
              <TableRow className="h-10 bg-[#004B8D] font-bold text-white hover:bg-[#004B8D]">
                <TableCell className="border-r border-black text-center shadow-inner">Σ</TableCell>
                <TableCell className="border-r border-black px-4 uppercase tracking-widest">
                  Total Project Cost
                </TableCell>
                <TableCell className="border-r border-black px-4 text-right underline decoration-double">
                  {totalPlanned.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="border-r border-black px-4 text-right underline decoration-double">
                  {totalActual > 0 ? totalActual.toLocaleString("en-IN") : "-"}
                </TableCell>
                <TableCell className="border-r border-black px-4 text-right">
                  {(totalPlanned - totalActual).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="bg-white border-l border-black"></TableCell>
              </TableRow>
            </TableBody>

          </Table>
        </div>

        {/* APPROVAL FOOTER */}
        <div className="border-t-2 border-black bg-white">
          <div className="min-h-12 border-b border-black p-3">
            <span className="mr-2 font-bold uppercase text-[#004B8D]">Remarks / Decision:</span>
            <span className="text-gray-700 font-medium italic">
              {data.approvals?.comments || "No specific remarks provided."}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x-2 divide-black text-center">
            <div className="p-4 group">
              <p className="mb-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Prepared By</p>
              <span className="font-bold text-gray-800 border-b border-dashed border-gray-300 pb-1">{data.preparedBy || "—"}</span>
            </div>
            <div className="p-4 bg-gray-50/30">
              <p className="mb-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Approved On</p>
              <span className="font-bold text-gray-800">
                {data.approvals?.approvedOn ? new Date(data.approvals.approvedOn).toLocaleDateString("en-IN") : "N/A"}
              </span>
            </div>
            <div className="p-4">
              <p className="mb-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Approved By</p>
              <span className="font-bold text-gray-800 border-b border-dashed border-gray-300 pb-1">{data.approvals?.approverName || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* CONTROL INFO */}
        <div className="flex flex-wrap justify-between items-center border-t border-black bg-[#F8FAFC] px-4 py-2 font-mono text-[8px] md:text-[9px] text-gray-400 uppercase tracking-widest">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Form No: F/D&D/07</span>
          <span>Issue No: 4.0</span>
          <span>Rev No: 1</span>
          <span className="font-bold text-[#0096D6]">Controlled Copy</span>
        </div>
      </div>
    </div>
  )
}
