"use client"

import { useState } from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { Link, useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    login(userName, password)
    navigate("/")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex flex-col items-center gap-2 font-medium">
                <div className="flex size-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">Janatics</span>
              </div>

              <h1 className="text-xl font-bold">Welcome to Janatics</h1>

              <FieldDescription>
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="underline">
                  Sign up
                </Link>
              </FieldDescription>
            </div>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {/* Submit */}
            <Field>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </Card>
  )
}