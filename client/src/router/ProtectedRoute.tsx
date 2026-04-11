import { Navigate, useLocation } from "react-router-dom";

import { useAuthContext } from "@/features/auth";

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const auth = useAuthContext();
  const location = useLocation();

  if (!auth.isLoggedIn) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return children;
}

