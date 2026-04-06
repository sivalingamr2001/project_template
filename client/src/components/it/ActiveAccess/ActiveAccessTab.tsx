import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useActiveAccess } from "./hooks/useActiveAccess"
import { ActiveAccessTable } from "../ActiveAccessTab/ActiveAccessTable"
export function ActiveAccessTab() {
  const { data, isLoading } = useActiveAccess()

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Active Access</h2>
      </CardHeader>
      <CardContent>
        <ActiveAccessTable data={data} isLoading={isLoading} />
      </CardContent>
    </Card>
  )
}
