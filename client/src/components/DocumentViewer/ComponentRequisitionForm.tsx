import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Logo from "@/assets/jana.png"

export const ComponentRequisitionForm = () => {
    const blankRows = Array.from({ length: 10 }, (_, i) => i + 1)
    const CurrentDate = new Date().toISOString().split("T")[0]

    return (
        <Card className="w-full max-w-5xl mx-auto my-8 border shadow-md bg-white text-slate-900 print:shadow-none print:border-none">

            {/* Header Section */}
            <CardHeader className="border-b bg-slate-50/50 px-6">
                <div className="flex justify-between gap-6 items-center">
                    <div className="text-2xl font-black tracking-wider text-slate-800 uppercase flex items-center h-full">
                        <img src={Logo} alt="Company Logo" className="h-5" />
                    </div>
                    <div className="text-center">
                        <CardTitle className="text-2xl wrap-break-word font-bold uppercase tracking-wide text-slate-700">
                            Requisition For Component <br /> Development
                        </CardTitle>
                    </div>
                    <div className="space-y-2 text-sm border p-3 rounded-md bg-white shadow-sm">
                        <div className="grid grid-cols-3 items-center">
                            <Label className="text-xs text-muted-foreground">Rec. No:</Label>
                            <Input className="col-span-2 h-7 text-xs" />
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <Label className="text-xs text-muted-foreground">Date:</Label>
                            <Input type="date" defaultValue={CurrentDate} readOnly className="col-span-2 h-7 text-xs bg-muted-foreground/10" />
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <Label className="text-xs text-muted-foreground">Page No:</Label>
                            <Input defaultValue="1 of 1" className="col-span-2 h-7 text-xs" />
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Metadata Fields Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-slate-50/30">
                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label className="text-xs font-semibold text-right">From:</Label>
                        <Input defaultValue="D&D" className="col-span-3 h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label className="text-xs font-semibold text-right">Team:</Label>
                        <Input defaultValue="" className="col-span-3 h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label className="text-xs font-semibold text-right">To:</Label>
                        <Input defaultValue="Materials-D&D" className="col-span-3 h-8 text-sm" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label className="text-xs font-semibold text-right">Product No:</Label>
                        <Input className="col-span-3 h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label className="text-xs font-semibold text-right">Rev:</Label>
                        <Input defaultValue="" className="col-span-3 h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label className="text-xs font-semibold text-right">Project No:</Label>
                        <Input defaultValue="" className="col-span-3 h-8 text-sm" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label className="text-xs font-semibold text-right">Project No:</Label>
                        <Input className="col-span-3 md:w-full h-8 text-sm" />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-2 col-span-1 md:col-span-2 border-t pt-4 mt-2">
                        <div className="col-span-2 space-y-1.5">
                            <Label className="text-xs font-semibold">Purpose</Label>
                            <Input defaultValue="New product validation / Sales" className="h-8 text-sm" />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <Label className="text-xs font-semibold leading-tight block">
                                Monthly quantity as per new product requisition <span className="text-muted-foreground font-normal">(Refer Note)</span>
                            </Label>
                            <Input className="h-8 text-sm" />
                        </div>
                    </div>
                </div>

                {/* Dynamic / Interactive Table Components */}
                <div className="border rounded-md shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow className="divide-x">
                                <TableHead className="w-12 text-center text-xs font-bold text-slate-700">S. No.</TableHead>
                                <TableHead className="w-36 text-xs font-bold text-slate-700">Part No.</TableHead>
                                <TableHead className="w-16 text-center text-xs font-bold text-slate-700">Rev.</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700">Part Name</TableHead>
                                <TableHead className="w-16 text-center text-xs font-bold text-slate-700">Qty.</TableHead>
                                <TableHead className="w-28 text-xs font-bold text-slate-700">Required Date</TableHead>
                                <TableHead className="w-28 text-xs font-bold text-slate-700">Committed Date</TableHead>
                                <TableHead className="w-28 text-xs font-bold text-slate-700">Actual Comp. Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {blankRows.map((num) => (
                                <TableRow key={num} className="divide-x hover:bg-slate-50/50">
                                    <TableCell className="text-center py-1 text-xs text-muted-foreground font-medium">{num}</TableCell>
                                    <TableCell className="p-1"><Input className="h-7 border-0 focus-visible:ring-1 rounded-none shadow-none text-xs" /></TableCell>
                                    <TableCell className="p-1"><Input className="h-7 border-0 focus-visible:ring-1 rounded-none shadow-none text-xs text-center" /></TableCell>
                                    <TableCell className="p-1"><Input className="h-7 border-0 focus-visible:ring-1 rounded-none shadow-none text-xs" /></TableCell>
                                    <TableCell className="p-1"><Input type="number" className="h-7 border-0 focus-visible:ring-1 rounded-none shadow-none text-xs text-center" /></TableCell>
                                    <TableCell className="p-1"><Input type="date" className="h-7 border-0 focus-visible:ring-1 rounded-none shadow-none text-xs" /></TableCell>
                                    <TableCell className="p-1"><Input type="date" className="h-7 border-0 focus-visible:ring-1 rounded-none shadow-none text-xs" /></TableCell>
                                    <TableCell className="p-1"><Input type="date" className="h-7 border-0 focus-visible:ring-1 rounded-none shadow-none text-xs" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Remarks / Business Rules Section */}
                <div className="rounded-lg border bg-amber-50/40 p-4 text-xs text-slate-600 italic leading-normal">
                    <span className="font-bold uppercase not-italic block mb-1 text-slate-700">Remarks / Notes:</span>
                    If MOQ is more than 1-month quantity, the concerned product leaders or engineers and sourcing persons shall be agreed together based on marketing demand and approval to be received from the concerned HODs before purchasing the components.
                </div>

                {/* Digital Signature workflows Layout */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border rounded-lg p-4 bg-slate-50/50 text-center">
                    <div className="space-y-2 border-r last:border-r-0 pr-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase block">Prepared</Label>
                        <Input className="h-8 bg-white text-center text-xs" placeholder="Sign / Name" />
                    </div>
                    <div className="space-y-2 md:border-r last:border-r-0 pr-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase block">Checked</Label>
                        <Input className="h-8 bg-white text-center text-xs" placeholder="Sign / Name" />
                    </div>
                    <div className="space-y-2 border-r last:border-r-0 pr-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase block">Approved</Label>
                        <Input className="h-8 bg-white text-center text-xs" placeholder="Sign / Name" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase block">Received</Label>
                        <Input className="h-8 bg-white text-center text-xs" placeholder="Sign / Name" />
                    </div>
                </div>

                {/* Footer Audit Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-muted-foreground border-t pt-4 gap-2">
                    <div>Form No: <span className="font-medium text-slate-700">F/D&D/21</span></div>
                    <div>Issue No: <span className="font-medium text-slate-700">4.2</span></div>
                    <div>Date: <span className="font-medium text-slate-700">30.06.2025</span></div>
                </div>

                {/* Submission Action bar */}
                <div className="flex justify-end gap-3 pt-4 border-t print:hidden">
                    <Button variant="outline" onClick={() => window.print()}>
                        Print Form
                    </Button>
                    <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
                        Submit Requisition
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
