import DetailItem from "../../AccessDetail"
import type { AccessDetailValue } from "../../AccessDetail/types"

interface AccessDetailItemProps {
  detail: AccessDetailValue
  index: number
  totalItems: number
  currentRole: string | null
  onChange: (index: number, field: string, value: string | number) => void
  onRemove: (index: number) => void
}

export function AccessDetailItem(props: AccessDetailItemProps) {
  const handleChange = (
    index: number,
    field: keyof AccessDetailValue,
    value: string | number
  ) => {
    props.onChange(index, field, value)
  }

  return (
    <DetailItem
      detail={props.detail}
      index={props.index}
      totalItems={props.totalItems}
      currentRole={props.currentRole}
      onRemove={props.onRemove}
      onChange={handleChange}
    />
  )
}
