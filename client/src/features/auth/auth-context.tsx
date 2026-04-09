import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { getStoredSession, loginRequest, logoutRequest } from "@/features/auth/authApi";
import type { AuthContextValue, LoginInput, User } from "@/features/auth/auth.types";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => getStoredSession());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      roles: user ? [user.role] : [],
      login: async (input: LoginInput) => {
        const nextUser = await loginRequest(input);
        setUser(nextUser);
      },
      logout: () => {
        logoutRequest();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider.");
  }

  return context;
}
