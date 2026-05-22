import { LoginForm } from "@/components/Login/LoginForm";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useState } from "react";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: { identifier: string; password: string }) => {
    setError(null);
    try {
      await login(credentials.identifier, credentials.password);
      navigate("/dashboard");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">JANATICS</h1>
          <p>Component Development Requisition System</p>
        </div>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <LoginForm onLogin={handleLogin} />

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/register" className="text-primary">Register</Link>
        </div>
      </div>
    </div>
  );
}
