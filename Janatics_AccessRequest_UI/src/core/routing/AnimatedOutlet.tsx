import { Outlet, useLocation } from "react-router-dom";

export function AnimatedOutlet() {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="animate-in fade-in slide-in-from-bottom-1 duration-300"
    >
      <Outlet />
    </div>
  );
}
