import { type ChangeEvent, type FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { useAuth } from "@/providers/auth-provider"
import { Spinner } from "@/shared/components/ui/spinner"

type DepartmentDto = {
  departmentId: number
  departmentName: string
}

const DEFAULT_DEPARTMENTS: DepartmentDto[] = [
  { departmentId: 0, departmentName: "General" },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [departments] = useState<DepartmentDto[]>(DEFAULT_DEPARTMENTS)
  const loading = false
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
    mobile: "",
    location: "",
    role: "User",
    departmentId: 0,
  })

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: name === "departmentId" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSaving(true)

    try {
      await register(form)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register. Please check your information."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Register with your employee details and connect to the backend.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-1">
            <label className="text-sm font-medium text-foreground">
              First name
            </label>
            <Input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Last name
            </label>
            <Input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Username
            </label>
            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Mobile
            </label>
            <Input name="mobile" value={form.mobile} onChange={handleChange} />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Location
            </label>
            <Input
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none"
            >
              <option value="User">User</option>
              <option value="Hod">Hod</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-foreground">
              Department
            </label>
            {loading ? (
              <div className="flex h-10 items-center rounded-lg border border-input bg-muted/30 px-3 text-sm text-muted-foreground">
                <Spinner className="mr-2" /> Loading departments
              </div>
            ) : (
              <select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none"
              >
                {departments.map((department) => (
                  <option
                    key={department.departmentId}
                    value={department.departmentId}
                  >
                    {department.departmentName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2 md:col-span-2">
            <Button
              type="submit"
              className="w-full"
              disabled={saving || loading}
            >
              {saving ? <Spinner className="mr-2" /> : null}
              Create account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                className="font-medium text-primary hover:text-primary/80"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
