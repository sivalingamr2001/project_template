import { Outlet, useLocation } from "react-router-dom"

export function AnimatedOutlet() {
  const location = useLocation()

  return (
    <div
      key={location.pathname}
      className="animate-in duration-300 fade-in slide-in-from-bottom-1"
    >
      <Outlet />
    </div>
  )
}
