import { useState, useEffect, useMemo } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconX, IconFolder, IconFolderOpen, IconCheck } from "@tabler/icons-react"
import { fetchFolderHierarchy } from "../utils/requestApi"

const NONE_VALUE = "__none__"

type FolderNode = {
  name: string
  children: FolderNode[]
}

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
  const [data, setData] = useState<FolderNode[]>([])
  const [loading, setLoading] = useState(true)

  const [searchL1, setSearchL1] = useState("")
  const [searchL2, setSearchL2] = useState("")
  const [searchL3, setSearchL3] = useState("")
  const [searchL4, setSearchL4] = useState("")

  useEffect(() => {
    fetchFolderHierarchy()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const parts = value.split("/")
  const s1 = parts[0] || ""
  const s2 = parts[1] || NONE_VALUE
  const s3 = parts[2] || NONE_VALUE
  const s4 = parts[3] || NONE_VALUE

  const l1Options = useMemo(() =>
    data.filter(f => f.name.toLowerCase().includes(searchL1.toLowerCase())),
    [data, searchL1])

  const l2Data = useMemo(() => data.find(f => f.name === s1)?.children || [], [data, s1])
  const l2Options = useMemo(() =>
    l2Data.filter(f => f.name.toLowerCase().includes(searchL2.toLowerCase())),
    [l2Data, searchL2])

  const l3Data = useMemo(() => l2Data.find(f => f.name === s2)?.children || [], [l2Data, s2])
  const l3Options = useMemo(() =>
    l3Data.filter(f => f.name.toLowerCase().includes(searchL3.toLowerCase())),
    [l3Data, searchL3])

  const l4Data = useMemo(() => l3Data.find(f => f.name === s3)?.children || [], [l3Data, s3])
  const l4Options = useMemo(() =>
    l4Data.filter(f => f.name.toLowerCase().includes(searchL4.toLowerCase())),
    [l4Data, searchL4])

  const handleUpdate = (index: number, val: string) => {
    const newParts = [...parts]
    if (val === NONE_VALUE) {
      onChange(newParts.slice(0, index).join("/"))
    } else {
      newParts[index] = val
      onChange(newParts.slice(0, index + 1).join("/"))
    }
    setSearchL1(""); setSearchL2(""); setSearchL3(""); setSearchL4("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20" />
          <p className="text-sm text-muted-foreground">Loading folder structure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconFolder className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Folder Path</Label>
        </div>
        {required && <span className="text-xs font-semibold text-destructive">Required</span>}
      </div>

      <div className="space-y-4">
        {/* Level 1 - Parent Folder */}
        <div className="space-y-2">
          <Label htmlFor="folder-l1" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">1</span>
            Parent Folder
          </Label>
          <Select value={s1} onValueChange={(v) => handleUpdate(0, v)}>
            <SelectTrigger id="folder-l1" className="h-11 border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors rounded-xl">
              {s1 ? (
                <div className="flex items-center gap-2">
                  <IconFolderOpen className="w-4 h-4 text-primary" />
                  <SelectValue />
                </div>
              ) : (
                <SelectValue placeholder="Select parent folder..." />
              )}
            </SelectTrigger>
            <SelectContent side="bottom" align="start" avoidCollisions={true}>
              <div className="p-2 sticky top-0 bg-card border-b">
                <Input 
                  placeholder="Search folders..." 
                  value={searchL1} 
                  onChange={(e) => setSearchL1(e.target.value)} 
                  className="h-9 text-sm" 
                  autoFocus
                />
              </div>
              {l1Options.length > 0 ? (
                l1Options.map(f => (
                  <SelectItem key={f.name} value={f.name}>
                    <div className="flex items-center gap-2">
                      <IconFolder className="w-4 h-4" />
                      {f.name}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground text-center">No folders found</div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Level 2 - Sub Folder L1 */}
        {s1 && l2Data.length > 0 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="folder-l2" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-accent/20 text-accent text-[10px] font-bold">2</span>
              Sub Folder Level 1
            </Label>
            <Select value={s2} onValueChange={(v) => handleUpdate(1, v)}>
              <SelectTrigger id="folder-l2" className="h-11 border-accent/30 bg-accent/5 hover:border-accent/50 transition-colors rounded-xl ml-2">
                {s2 !== NONE_VALUE ? (
                  <div className="flex items-center gap-2">
                    <IconFolderOpen className="w-4 h-4 text-accent" />
                    <SelectValue />
                  </div>
                ) : (
                  <SelectValue placeholder="Select sub folder..." />
                )}
              </SelectTrigger>
              <SelectContent side="bottom" align="start" avoidCollisions={true}>
                <div className="p-2 sticky top-0 bg-card border-b">
                  <Input 
                    placeholder="Search subfolders..." 
                    value={searchL2} 
                    onChange={(e) => setSearchL2(e.target.value)} 
                    className="h-9 text-sm"
                  />
                </div>
                <SelectItem value={NONE_VALUE} className="text-muted-foreground">None</SelectItem>
                {l2Options.length > 0 ? (
                  l2Options.map(f => (
                    <SelectItem key={f.name} value={f.name}>
                      <div className="flex items-center gap-2">
                        <IconFolder className="w-4 h-4" />
                        {f.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">No folders found</div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Level 3 - Sub Folder L2 */}
        {s2 !== NONE_VALUE && l3Data.length > 0 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="folder-l3" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500/20 text-green-600 text-[10px] font-bold">3</span>
              Sub Folder Level 2
            </Label>
            <Select value={s3} onValueChange={(v) => handleUpdate(2, v)}>
              <SelectTrigger id="folder-l3" className="h-11 border-green-500/30 bg-green-500/5 hover:border-green-500/50 transition-colors rounded-xl ml-4">
                {s3 !== NONE_VALUE ? (
                  <div className="flex items-center gap-2">
                    <IconFolderOpen className="w-4 h-4 text-green-600" />
                    <SelectValue />
                  </div>
                ) : (
                  <SelectValue placeholder="Select sub folder..." />
                )}
              </SelectTrigger>
              <SelectContent side="bottom" align="start" avoidCollisions={true}>
                <div className="p-2 sticky top-0 bg-card border-b">
                  <Input 
                    placeholder="Search subfolders..." 
                    value={searchL3} 
                    onChange={(e) => setSearchL3(e.target.value)} 
                    className="h-9 text-sm"
                  />
                </div>
                <SelectItem value={NONE_VALUE} className="text-muted-foreground">None</SelectItem>
                {l3Options.length > 0 ? (
                  l3Options.map(f => (
                    <SelectItem key={f.name} value={f.name}>
                      <div className="flex items-center gap-2">
                        <IconFolder className="w-4 h-4" />
                        {f.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">No folders found</div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Level 4 - Sub Folder L3 */}
        {s3 !== NONE_VALUE && l4Data.length > 0 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="folder-l4" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-500/20 text-purple-600 text-[10px] font-bold">4</span>
              Sub Folder Level 3
            </Label>
            <Select value={s4} onValueChange={(v) => handleUpdate(3, v)}>
              <SelectTrigger id="folder-l4" className="h-11 border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50 transition-colors rounded-xl ml-6">
                {s4 !== NONE_VALUE ? (
                  <div className="flex items-center gap-2">
                    <IconFolderOpen className="w-4 h-4 text-purple-600" />
                    <SelectValue />
                  </div>
                ) : (
                  <SelectValue placeholder="Select sub folder..." />
                )}
              </SelectTrigger>
              <SelectContent side="bottom" align="start" avoidCollisions={true}>
                <div className="p-2 sticky top-0 bg-card border-b">
                  <Input 
                    placeholder="Search subfolders..." 
                    value={searchL4} 
                    onChange={(e) => setSearchL4(e.target.value)} 
                    className="h-9 text-sm"
                  />
                </div>
                <SelectItem value={NONE_VALUE} className="text-muted-foreground">None</SelectItem>
                {l4Options.length > 0 ? (
                  l4Options.map(f => (
                    <SelectItem key={f.name} value={f.name}>
                      <div className="flex items-center gap-2">
                        <IconFolder className="w-4 h-4" />
                        {f.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">No folders found</div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected Path Display */}
        {value && (
          <div className="mt-6 p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <IconCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Selected Path</p>
                <p className="text-sm font-semibold text-primary truncate">{value}</p>
              </div>
            </div>
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              onClick={() => onChange("")} 
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0 transition-colors"
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
