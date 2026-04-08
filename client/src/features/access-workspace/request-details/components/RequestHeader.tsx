import type { ReactNode } from "react"

type RequestHeaderProps = {
  accessReqId: number
  action?: ReactNode
  onBack: () => void
  status: string
}

function RequestHeader({ accessReqId, status }: RequestHeaderProps) {
  return (
    <>
      <div className="rounded-[0.9rem] border border-border bg-background p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                File Server Folder Access
              </p>
              <h1 className="mt-2 text-2xl font-semibold">
                Request #{accessReqId}
              </h1>
            </div>
            <div className="rounded-[0.9rem] border border-border bg-card px-4 py-2">
              <span className="mr-2 text-xs tracking-[0.22em] text-muted-foreground uppercase">
                Current Status
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="mt-2 ml-2 text-sm font-semibold">{status}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RequestHeader
