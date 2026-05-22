import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import type { LoginFormData } from "./types";

const VALIDATION_ERRORS = {
  email: "Please enter a valid email address",
  password: "Password must be at least 6 characters",
};

interface LoginFormProps {
  onLogin: (credentials: LoginFormData) => Promise<void>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({ identifier: "", password: "" });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // identifier may be an email or a user id. If it looks like an email, validate as email.
    if (formData.identifier.trim().length === 0) {
      newErrors.identifier = "Please enter your email or user id";
    } else if (formData.identifier.indexOf("@") !== -1 && !emailRegex.test(formData.identifier)) {
      newErrors.identifier = VALIDATION_ERRORS.email;
    }

    if (formData.password.length < 6) newErrors.password = VALIDATION_ERRORS.password;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onLogin(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the requisition system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="identifier" className="text-sm font-medium">
              Email or User ID
            </label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="user@example.com or userId"
              value={formData.identifier}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.identifier && <p className="text-sm text-red-500">{errors.identifier}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
