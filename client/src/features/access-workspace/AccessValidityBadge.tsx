import { IconAlertCircle, IconClock } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { getExpiredAccessItems } from "./utils/requestApi"

function AccessValidityBadge({ itemId }: { itemId?: number }) {
  const [expiryData, setExpiryData] = useState<{
    approvedOn: string
    expiresOn: string
  } | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("Calculating...")

  useEffect(() => {
    const fetchExpiration = async () => {
      if (!itemId) return
      try {
        const res: any = await getExpiredAccessItems(Number(itemId))
        setExpiryData(res)
      } catch (error) {
        console.error("Failed to load expiry:", error)
        setTimeLeft("Error loading date")
      }
    }
    fetchExpiration()
  }, [itemId])

  useEffect(() => {
    if (!expiryData?.expiresOn) return

    const targetDate = new Date(expiryData.expiresOn)

    const interval = setInterval(() => {
      const now = new Date()
      const distance = targetDate.getTime() - now.getTime()

      if (distance < 0) {
        setTimeLeft("EXPIRED")
        clearInterval(interval)
        return
      }

      let businessDaysRemaining = 0
      let tempDate = new Date(now)

      while (tempDate < targetDate) {
        tempDate.setDate(tempDate.getDate() + 1)
        if (tempDate.getDay() !== 0 && tempDate <= targetDate) {
          businessDaysRemaining++
        }
      }

      const h = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${businessDaysRemaining}d ${h}h ${m}m ${s}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [expiryData])
  return (
    <div className="rounded-[0.5rem] border border-dashed border-destructive bg-destructive/5 shadow-sm">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-3 px-4 py-1.5">
          <div className="flex items-center gap-2">
            {/* Changed both icons to text-destructive */}
            {timeLeft === "EXPIRED" ? (
              <IconAlertCircle className="size-4 text-destructive" />
            ) : (
              <IconClock className="size-4 animate-pulse text-destructive" />
            )}

            {/* Changed label to text-destructive/80 */}
            <span className="text-[11px] font-semibold tracking-tight text-destructive/80 uppercase">
              Expired On
            </span>
          </div>

          <div className="min-w-31.25 font-mono text-sm font-bold text-destructive">
            {timeLeft}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessValidityBadge
