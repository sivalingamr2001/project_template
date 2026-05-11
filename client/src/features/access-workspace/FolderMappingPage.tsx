import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import PageSection from "./components/PageSection"
import { fetchAllHod, fetchFolderMappings, saveFolderMapping } from "./utils/requestApi"
import type { FolderMappingRecord, HodResponse } from "./types"
import { toast } from "sonner"

function FolderMappingPage() {
  const [mappings, setMappings] = useState<FolderMappingRecord[]>([])
  const [hods, setHods] = useState<HodResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingFolder, setSavingFolder] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [folderData, hodData] = await Promise.all([
          fetchFolderMappings(),
          fetchAllHod(1, 200),
        ])

        if (cancelled) return
        setMappings(folderData)
        setHods(hodData)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unable to load folder mappings.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [])

  const folderCount = mappings.length
  const hodOptions = useMemo(
    () => hods,
    [hods]
  )

  const handleSelectHod = (folderName: string, hodId: string) => {
    const hod = hodOptions.find((item) => item.EmployeeId === hodId)
    setMappings((current) =>
      current.map((mapping) =>
        mapping.folderName === folderName
          ? {
              ...mapping,
              hodId,
              hodName: hod ? `${hod.FirstName} ${hod.LastName}` : mapping.hodName,
              hodEmail: hod?.Email ?? mapping.hodEmail,
            }
          : mapping
      )
    )
  }

  const handleSave = async (mapping: FolderMappingRecord) => {
    setSavingFolder(mapping.folderName)
    try {
      const saved = await saveFolderMapping(mapping)
      setMappings((current) =>
        current.map((item) =>
          item.folderName === saved.folderName ? saved : item
        )
      )
      toast.success("Folder mapping saved.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save mapping.")
    } finally {
      setSavingFolder(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageSection
        title="Folder Mapping"
        description="Assign each folder from the system list to an HOD one by one."
      >
        {error ? (
          <p className="mb-4 text-sm text-destructive">{error}</p>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Folder</th>
                <th className="px-4 py-3">Assigned HOD</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading folder mapping data...
                  </td>
                </tr>
              ) : mappings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No folder rows found in the provided CSV.
                  </td>
                </tr>
              ) : (
                mappings.map((mapping) => (
                  <tr key={mapping.folderName}>
                    <td className="px-4 py-3 font-medium">{mapping.folderName}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={mapping.hodId ?? ""}
                        onValueChange={(value) => handleSelectHod(mapping.folderName, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select HOD" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {hodOptions.map((hod) => (
                            <SelectItem key={hod.EmployeeId} value={hod.EmployeeId}>
                              {hod.FirstName} {hod.LastName} ({hod.Email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      {mapping.hodEmail ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        disabled={savingFolder === mapping.folderName}
                        onClick={() => handleSave(mapping)}
                      >
                        {savingFolder === mapping.folderName ? "Saving..." : "Save"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {folderCount} folder{folderCount === 1 ? "" : "s"}.
        </p>
      </PageSection>
    </div>
  )
}

export default FolderMappingPage
