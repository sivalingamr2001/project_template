import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useEmployeeLookup } from "./hooks/useEmployeeLookup"
import { EmployeeSearchBar } from "./components/EmployeeSearchBar"
import { EmployeeCard } from "./components/EmployeeCard"
import { AccessTableFilters } from "./components/AccessTableFilters"
import { EmployeeAccessTable } from "./components/EmployeeAccessTable"

export function EmployeeLookupTab() {
  const [empId, setEmpId] = useState("")
  const [filter, setFilter] = useState("All")
  const { data } = useEmployeeLookup(Number(empId))
  const rows = data?.accesses?.filter((item) => filter === "All" || item.accessType === filter) ?? []

  return (
    <div className="space-y-4">
      <EmployeeSearchBar onSearch={setEmpId} />
      {data ? (
        <>
          <EmployeeCard employee={data} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="text-sm font-medium">Access Summary</div>
              <AccessTableFilters onChange={setFilter} />
            </CardHeader>
            <CardContent>
              <EmployeeAccessTable data={rows} />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          Search for an employee to inspect access
        </div>
      )}
    </div>
  )
}
