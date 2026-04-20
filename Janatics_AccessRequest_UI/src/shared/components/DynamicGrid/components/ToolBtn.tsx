import React from "react"

function ToolBtn({
  children,
  onClick,
  title,
  variant = "default",
  spinning = false,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  variant?: "default" | "danger" | "success"
  spinning?: boolean
}) {
  // Define Tailwind classes for each variant
  const variants = {
    default: "text-slate-500 hover:bg-slate-100 border-slate-200",
    danger: "text-red-700 hover:bg-red-50 border-red-200",
    success: "text-green-700 hover:bg-green-50 border-green-200",
  }

  return (
    <button
      onClick={spinning ? undefined : onClick}
      title={title}
      disabled={spinning}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]} `}
    >
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          return (
            <span className={`${spinning ? "animate-spin" : ""}`}>{child}</span>
          )
        }
        return child
      })}
    </button>
  )
}

export default ToolBtn
