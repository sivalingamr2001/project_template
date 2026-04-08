import type { AccessRequestDetails, AccessRequestItem } from "../../types"

type AccessItemDetailsProps = {
  details: AccessRequestDetails
  item: AccessRequestItem
}

function AccessItemDetails({ details, item }: AccessItemDetailsProps) {
  return (
    <section className="rounded-[0.9rem] border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Selected Access Item
        </p>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <DetailRow label="Folder Path" value={item.folderPath} />
        <DetailRow label="Access Type" value={item.accessType} />
        <DetailRow label="Item" value={`#${item.accessItemId}`} />
        <DetailRow
          label="Assigned To"
          value={details.currentApproverName || `Emp #${details.reqTo}`}
        />
        <DetailRow label="Business Reason" value={item.reason || "No reason was provided."} />
      </div>
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  )
}

export default AccessItemDetails
