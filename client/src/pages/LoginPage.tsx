import { LoginForm } from "@/components/Login/LoginForm";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    navigate("/dashboard");
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
