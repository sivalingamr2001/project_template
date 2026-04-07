import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DetailFields } from "./DetailFields"
import { ToggleHeader } from "./ToggleHeader"
import type { AccessDetailItemProps, AccessDetailValue } from "./types"

export default function DetailItem({
  detail,
  index,
  totalItems,
  currentRole,
  onRemove,
  onChange,
}: AccessDetailItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isDurationDisabled = currentRole === "User"

  const handleToggle = () => setIsExpanded((v) => !v)
  const handleRemove = () => onRemove(index)

  const createFieldChangeHandler =
    (field: keyof AccessDetailValue) => (value: string | number) =>
      onChange(index, field, value)

  const handleFolderNameChange = createFieldChangeHandler("folderName")
  const handleAccessTypeChange = createFieldChangeHandler("accessType")
  const handleDurationDaysChange = createFieldChangeHandler("durationDays")
  const handleReasonChange = createFieldChangeHandler("reason")

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all">
      <ToggleHeader
        isExpanded={isExpanded}
        detail={detail}
        index={index}
        totalItems={totalItems}
        onToggle={handleToggle}
        onRemove={handleRemove}
      />

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DetailFields
              folderName={detail.folderName}
              accessType={detail.accessType}
              reason={detail.reason}
              durationDays={detail.durationDays}
              isDurationDisabled={isDurationDisabled}
              onFolderNameChange={handleFolderNameChange}
              onAccessTypeChange={handleAccessTypeChange}
              onDurationDaysChange={handleDurationDaysChange}
              onReasonChange={handleReasonChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

