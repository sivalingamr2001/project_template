import { LoginForm } from "@/components/Login/LoginForm";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/core/store/authStore";
import { useRequestionApi } from "@/core/api/useRequestionApi";

export function LoginPage() {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((s) => s.setCredentials);

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      const authResponse = await useRequestionApi.login({ email, password });
      setCredentials(authResponse.user, authResponse.accessToken);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">JANATICS</h1>
          <p>Component Development Requisition System</p>
        </div>
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}
