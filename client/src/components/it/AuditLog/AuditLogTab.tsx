import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuditLog } from "./hooks/useAuditLog"
import { AuditLogTable } from "./components/AuditLogTable"

export function AuditLogTab() {
  const { data, isLoading } = useAuditLog()

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Audit Log</h2>
      </CardHeader>
      <CardContent>
        <AuditLogTable data={data} isLoading={isLoading} />
      </CardContent>
    </Card>
  )
}
