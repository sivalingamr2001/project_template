import { type FormEvent, useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { useAuth } from "@/providers/auth-provider"
import { Spinner } from "@/shared/components/ui/spinner"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from =
    (location.state as { from?: string })?.from ?? "/dashboard"

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, from])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-sm text-muted-foreground">
            Checking authentication...
          </span>
        </div>
      </div>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login({ username, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to login. Please check your credentials."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Use your employee credentials to access the portal.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Username
            </label>
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Type your username"
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Type your password"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner className="mr-2" /> : null}
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link
            className="font-medium text-primary hover:text-primary/80"
            to="/register"
          >
            Register now
          </Link>
        </p>
      </div>
    </div>
  )
}
