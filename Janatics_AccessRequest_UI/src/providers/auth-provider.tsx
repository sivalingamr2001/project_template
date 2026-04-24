import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react"
import {
  authApi,
  type AuthResponse,
  type LoginRequest,
  type RegisterRequest,
} from "@/features/auth/api/authApi"
import { setStorageItem } from "@/shared/lib/storage"

const STORAGE_KEY = "janatics-auth-user"

type AuthContextValue = {
  user: AuthResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (request: LoginRequest) => Promise<AuthResponse>
  register: (request: RegisterRequest) => Promise<AuthResponse>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY)

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthResponse)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const handleLogout = () => {
      setUser(null)
      localStorage.removeItem(STORAGE_KEY)
    }

    window.addEventListener("auth:logout", handleLogout)
    return () => window.removeEventListener("auth:logout", handleLogout)
  }, [])

  const login = async (request: LoginRequest) => {
    const auth: any = await authApi.login(request)
    setUser(auth.session.user)
    setStorageItem(STORAGE_KEY, auth.session.user, {
      expiresInMinutes: 30,
    })
    return auth
  }

  const register = async (request: RegisterRequest) => {
    const auth: any = await authApi.register(request)
    setUser(auth)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    return auth
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
