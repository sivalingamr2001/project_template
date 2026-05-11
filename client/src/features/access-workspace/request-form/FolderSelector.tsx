import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { IconX } from "@tabler/icons-react"

// Sample folder list from Folders.csv
const FOLDER_LIST = [
  "21", "4M", "5S", "Accounts", "Accounts-2", "Accounts-3", "Accounts-Audit",
  "Admin", "Administration", "Application", "Application_Assembly", "AP_TP_TBCR",
  "Assembly Procedure-IED", "Backup", "Catalogue", "CBE2", "CC", "Central Purchase",
  "CI Projects backup", "CMM", "CMT", "CMT_Commercial", "CMT_Contract management",
  "CNC PROGRAM", "Common2", "Corp-Plan Marketing", "Corporate-Admin", "Corp_Planing",
  "Costing", "DAM", "Desgin", "Development", "Digital QP", "E-Commerce", "ED Office",
  "EDP", "Electrical Actuators", "ESNK", "Ex_Emp_bkp", "F", "Flow-meter", "Global",
  "GST", "HR", "HR-2", "I17 Assign", "ICAT", "IED & JandF", "Industrial Relations",
  "Inward", "Inward_Audit", "ISO", "ISO KMD sheets", "ISO-MR", "Janatics", "karthiacc",
  "Knowledge sharing", "LAM-RRA Audit", "Learning", "Machine shop", "Maintenance",
  "Marketing", "Marketing-Dubai", "Materials", "MKTG_Projects", "NON-MOVING", "NPD",
  "Official", "OFL", "Operations", "Operations-Unit7", "Oracle_Report", "photos",
  "Pilot Batch", "PIM", "PLM_Project", "Polymers", "Pre Production", "Product Management",
  "Production", "Production Requirement", "QC", "RAJU", "RandD", "Reception", "RM Price",
  "RM_SHEET", "S.Source", "Safety", "Sales", "Sales-Logistics", "SCM-Project", "SDT",
  "Security", "Service", "Skyfast", "Skyfast-HR", "Skyfast-Maintenance", "SPM",
  "Sticker Files", "Stores", "STR-PROJ", "Talent Acquisition", "Tally", "TEXTILE",
  "Toms", "Tool Design", "Tool Room", "Training Center", "UAUC", "Unit 5 & 6", "Users",
  "VIP MEETING", "WP"
]

type FolderSelectorProps = {
  value: string
  onChange: (path: string) => void
  required?: boolean
}

export default function FolderSelector({
  value,
  onChange,
  required = false,
}: FolderSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParent, setSelectedParent] = useState("")
  const [selectedChild, setSelectedChild] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  // Filter folders based on search term
  const filteredFolders = useMemo(() => {
    if (!searchTerm) return FOLDER_LIST
    return FOLDER_LIST.filter((folder) =>
      folder.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  // Get child folders based on selected parent
  const childFolders = useMemo(() => {
    if (!selectedParent) return []
    return FOLDER_LIST.filter(
      (folder) =>
        folder !== selectedParent &&
        folder.toLowerCase().startsWith(selectedParent.toLowerCase())
    )
  }, [selectedParent])

  // Build the full path
  useEffect(() => {
    if (selectedParent && selectedChild) {
      onChange(`${selectedParent}/${selectedChild}`)
    } else if (selectedParent) {
      onChange(selectedParent)
    }
  }, [selectedParent, selectedChild, onChange])

  const handleParentSelect = (parent: string) => {
    setSelectedParent(parent)
    setSelectedChild("")
    setShowSearch(false)
    setSearchTerm("")
  }

  const handleClearSelection = () => {
    setSelectedParent("")
    setSelectedChild("")
    onChange("")
  }

  return (
    <div className="space-y-3">
      <Label>Folder Path</Label>

      <div className="space-y-2">
        {/* Search Section */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {showSearch ? "Hide Search" : "Search Folders"}
          </button>

          {showSearch && (
            <Input
              placeholder="Search folder name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 text-sm"
            />
          )}

          {showSearch && searchTerm && filteredFolders.length > 0 && (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-border bg-card p-2">
              {filteredFolders.slice(0, 10).map((folder) => (
                <button
                  key={folder}
                  type="button"
                  onClick={() => handleParentSelect(folder)}
                  className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-accent"
                >
                  {folder}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Parent Folder Selection */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Parent Folder</Label>
          <Select value={selectedParent} onValueChange={handleParentSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a parent folder..." />
            </SelectTrigger>
            <SelectContent>
              {FOLDER_LIST.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Child Folder Selection */}
        {selectedParent && childFolders.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Child Folder (Optional)</Label>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger>
                <SelectValue placeholder="Select a child folder..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {childFolders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected Path Display */}
        {selectedParent && (
          <div className="flex items-center justify-between rounded bg-accent/50 px-3 py-2">
            <span className="text-sm">
              <span className="font-medium">Selected Path:</span> {value}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearSelection}
              className="h-5 w-5"
            >
              <IconX className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
