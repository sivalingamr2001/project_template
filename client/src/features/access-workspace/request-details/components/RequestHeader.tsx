import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"

type RequestHeaderProps = {
  accessReqId: number
  action?: ReactNode
  onBack: () => void
  status: string
}

function RequestHeader({
  accessReqId,
  action,
  onBack,
  status,
}: RequestHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          className="w-fit px-0"
          size="sm"
          variant="ghost"
          onClick={onBack}
        >
          <IconArrowLeft className="size-4" />
          {"Back to Requests"}
        </Button>
        {action}
      </div>
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
              <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                Current Status
              </p>
              <p className="mt-2 text-lg font-semibold">{status}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RequestHeader
