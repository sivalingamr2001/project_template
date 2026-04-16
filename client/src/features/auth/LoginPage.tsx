import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { LoaderCircle, Lock, TrendingUp } from "lucide-react";

import { useAuthContext } from "@/features/auth/auth-context";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

export default function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const auth = useAuthContext();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const redirectTo =
    typeof search.redirect === "string"
      ? search.redirect
      : "/budget/dashboard";

  useEffect(() => {
    if (auth.isLoggedIn && pendingRedirect) {
      void navigate({ replace: true, to: pendingRedirect });
      setPendingRedirect(null);
    }
  }, [auth.isLoggedIn, navigate, pendingRedirect]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const parsedEmployeeId = Number(employeeId);
      if (!Number.isFinite(parsedEmployeeId) || parsedEmployeeId <= 0) {
        throw new Error("Employee ID is required.");
      }

      await auth.login({ employeeId: parsedEmployeeId, password });
      setPendingRedirect(redirectTo);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in right now.",
      );
      setPendingRedirect(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT: Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-[#0f172a] via-[#1e293b] to-[#020617] p-10 text-white">
        {/* Top */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold">
              Janatics India Pvt. Ltd.
            </div>
            <div className="text-sm text-white/70">
              R&D Budget Intelligence Platform
            </div>
          </div>
        </div>

        {/* Middle */}
        <div className="max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">
            Strategic Budget Control, Reimagined
          </h1>
          <p className="mt-4 text-white/70">
            Drive financial clarity across R&D initiatives with real-time
            tracking, variance insights, and performance analytics.
          </p>

          <div className="mt-6 space-y-3 text-sm text-white/80">
            <div>✔ Real-time budget vs actual tracking</div>
            <div>✔ Export-ready audit reports</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-white/50"></div>
      </div>

      {/* RIGHT: Login */}
      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-white/10 bg-card/95 rounded-none">
          <CardHeader>
            <CardTitle className="mt-2 flex items-center gap-2 text-3xl">
              <Lock className="h-6 w-6 text-primary" />
              Access the platform
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Employee Id */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee ID</label>
                <Input
                  inputMode="numeric"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                className="w-full"
                size="lg"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Signing in..." : "Enter the app"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
