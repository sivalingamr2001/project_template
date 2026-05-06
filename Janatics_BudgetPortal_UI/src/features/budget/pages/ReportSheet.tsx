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

export default function ProjectCostReportTable({ budgetId }: { budgetId: number }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const response = await apiService.get(`/budgets/${budgetId}/report-data`);
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch report data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (budgetId) {
            fetchReport();
        }
    }, [budgetId]);

    // 1. Loading & Error States (Must be before calculations)
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0096D6]"></div>
                <p className="text-muted-foreground">Loading Report Data...</p>
            </div>
        );
    }

    if (!data || !data.categories) {
        return <div className="p-20 text-center text-red-500">No report data available for this record.</div>;
    }

    // 2. Safe Grand Totals Calculations
    const totalPlanned = data.categories.reduce((acc: number, cat: any) =>
        acc + (cat.items?.reduce((sum: number, i: any) => sum + (i.estimatedAmount || 0), 0) || 0), 0);

    const totalActual = data.categories.reduce((acc: number, cat: any) =>
        acc + (cat.items?.reduce((sum: number, i: any) => sum + (i.actualAmount || 0), 0) || 0), 0);

    return (
        <div className="max-w-5xl mx-auto border-2  bg-white text-[11px] font-sans shadow-lg">
            {/* LOGO & HEADER */}
            <div className="bg-[#0096D6] text-white p-2 flex justify-between items-center border-b-2 border-black">
                <div className="font-bold text-lg italic px-4 underline uppercase">JANATICS</div>
                <div className="text-xl font-bold tracking-widest uppercase text-center flex-1">
                    Project Cost Report
                </div>
                <div className="text-left min-w-[120px] border-l border-white/30 pl-4">
                    <p className="font-bold">Req No : {data.budgetId}</p>
                </div>
            </div>

            {/* PROJECT INFO DETAILS */}
            <div className="grid grid-cols-2 border-b-2 border-black bg-white">
                <div className="border-r-2 border-black p-2 space-y-1">
                    <p><span className="font-bold w-28 inline-block uppercase">Product No :</span> {data.productNo || '—'}</p>
                    <p><span className="font-bold w-28 inline-block uppercase">Product Name :</span> {data.productName || '—'}</p>
                    <p><span className="font-bold w-28 inline-block uppercase">NPD No :</span> {data.projectNumber || '—'}</p>
                </div>
                <div className="p-2 space-y-1">
                    <p><span className="font-bold w-28 inline-block uppercase">Date :</span> {data.createdOn ? new Date(data.createdOn).toLocaleDateString() : '—'}</p>
                    <p><span className="font-bold w-28 inline-block uppercase">Page No :</span> 1</p>
                </div>
            </div>

            {/* REPORT TABLE */}
            <Table className="border-collapse">
                <TableHeader>
                    <TableRow className="bg-[#004B8D] hover:bg-[#004B8D] border-b-2 border-black">
                        <TableHead className="text-white border-r border-black text-center h-10 font-bold uppercase w-20">Cost Breakup</TableHead>
                        <TableHead className="text-white border-r border-black text-center font-bold uppercase">Description</TableHead>
                        <TableHead className="text-white border-r border-black text-center font-bold uppercase w-32">Estimated Amount (₹)</TableHead>
                        <TableHead className="text-white border-r border-black text-center font-bold uppercase w-32">Actual Amount (₹)</TableHead>
                        <TableHead className="text-white border-r border-black text-center font-bold uppercase w-32">Variance (₹)</TableHead>
                        <TableHead className="text-white text-center font-bold uppercase w-40">Remarks</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.categories.map((cat: any) => (
                        <React.Fragment key={cat.categoryNumber}>
                            {/* CATEGORY HEADER ROW */}
                            <TableRow className="bg-[#0096D6] hover:bg-[#0096D6] h-8">
                                <TableCell className="text-white font-bold text-center border-r border-black">{cat.categoryNumber}</TableCell>
                                <TableCell colSpan={5} className="text-white font-bold px-4 uppercase tracking-wider">
                                    {cat.categoryName}
                                </TableCell>
                            </TableRow>

                            {/* ITEM ROWS */}
                            {cat.items?.map((item: any) => (
                                <TableRow key={item.itemNumber} className="h-7 border-b border-black hover:bg-slate-50">
                                    <TableCell className="text-center border-r border-black font-medium">{item.itemNumber}</TableCell>
                                    <TableCell className="border-r border-black px-4">{item.itemName}</TableCell>
                                    <TableCell className="text-right border-r border-black px-4">{item.estimatedAmount?.toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="text-right border-r border-black px-4">{item.actualAmount > 0 ? item.actualAmount.toLocaleString('en-IN') : '-'}</TableCell>
                                    <TableCell className={`text-right border-r border-black px-4 font-bold ${parseFloat(item.variance) < 0 ? 'text-red-600' : ''}`}>
                                        {item.variance}
                                    </TableCell>
                                    <TableCell className="px-2 italic text-gray-500">{item.remarks}</TableCell>
                                </TableRow>
                            ))}
                        </React.Fragment>
                    ))}

                    {/* GRAND TOTAL ROW */}
                    <TableRow className="bg-[#004B8D] hover:bg-[#004B8D] text-white font-bold h-10">
                        <TableCell className="border-r border-black text-center">#</TableCell>
                        <TableCell className="border-r border-black px-4 uppercase">Total Project Cost</TableCell>
                        <TableCell className="text-right border-r border-black px-4">{totalPlanned.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right border-r border-black px-4">{totalActual > 0 ? totalActual.toLocaleString('en-IN') : '-'}</TableCell>
                        <TableCell className="text-right border-r border-black px-4">{(totalPlanned - totalActual).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="bg-white border-l border-black"></TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            {/* APPROVAL FOOTER */}
            <div className="border-t-2 border-black">
                <div className="p-2 border-b border-black min-h-10">
                    <span className="font-bold uppercase mr-2">Remarks / Decision:</span>
                    <span className="text-gray-700">{data.approvals?.comments || 'No specific remarks provided.'}</span>
                </div>
                <div className="grid grid-cols-3 divide-x-2 divide-black text-center bg-white">
                    <div className="p-3"><p className="font-bold uppercase text-[10px] text-gray-500 mb-1">Prepared By</p> <span className="font-semibold">{data.preparedBy || '—'}</span></div>
                    <div className="p-3"><p className="font-bold uppercase text-[10px] text-gray-500 mb-1">Approved On</p> <span className="font-semibold">{data.approvals?.approvedOn ? new Date(data.approvals.approvedOn).toLocaleDateString() : 'N/A'}</span></div>
                    <div className="p-3"><p className="font-bold uppercase text-[10px] text-gray-500 mb-1">Approved By</p> <span className="font-semibold">{data.approvals?.approverName || 'N/A'}</span></div>
                </div>
            </div>

            {/* CONTROL INFO */}
            <div className="bg-gray-50 flex justify-between px-4 py-1 text-[9px] text-gray-400 border-t border-black font-mono">
                <span>Form No: F/D&D/07</span>
                <span>Issue No: 4.0</span>
                <span>Rev No: 1</span>
                <span>Controlled Copy</span>
            </div>
        </div>
    )
}
