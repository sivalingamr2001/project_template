import { Navigate } from "react-router-dom";

import { useAuthContext } from "@/features/auth";

interface Props {
  children: React.ReactNode;
}

export function GuestRoute({ children }: Props) {
  const auth = useAuthContext();

  if (auth.isLoggedIn) {
    return <Navigate to="/budget" replace />;
  }

  return children;
}

