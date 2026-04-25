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
import { getStorageItem, setStorageItem } from "@/shared/lib/storage"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = getStorageItem<AuthResponse>(STORAGE_KEY)

    if (storedUser) {
      setUser(storedUser)
    } else {
      setUser(null)
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
    try {
      const auth: any = await authApi.login(request)
      const userData = auth.session.user

      setUser(userData)
      setStorageItem(STORAGE_KEY, userData, {
        expiresInMinutes: 30,
      })

      getStorageItem<AuthResponse>(STORAGE_KEY)

      // Success logic
      toast("Login successful!") // Optional: feedback
      navigate("/dashboard")

      return auth
    } catch (error) {
      // Error logic
      console.error("Login failed:", error)
      toast.error("Invalid credentials, please try again.")
      throw error
    }
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
