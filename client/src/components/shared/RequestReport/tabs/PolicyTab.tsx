import { policies } from "../constants/policies"
import { PolicyItem } from "../components/PolicyItem"

export function PolicyTab() {
  return (
    <div className="space-y-4 p-6">
      <p className="mb-4 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        Data Access Policies — {policies.length} clauses
      </p>
      {policies.map((policy, index) => (
        <PolicyItem
          key={`${policy.title}-${index}`}
          num={index + 1}
          title={policy.title}
          body={policy.body}
        />
      ))}
    </div>
  )
}

