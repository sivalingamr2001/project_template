import { Link } from "react-router-dom";

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Register</h1>
          <p className="text-sm text-muted-foreground">Please contact your administrator to create an account.</p>
        </div>

        <div className="text-center">
          <p className="mb-4">If you already have an account, you can login.</p>
          <Link to="/login" className="text-primary">Go to Login</Link>
        </div>
      </div>
    </div>
  );
}
