import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const savedUser = localStorage.getItem("trackit_user");
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (savedUser) {
    return <Navigate replace to="/dashboard" />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") || "").trim();

      localStorage.setItem(
        "trackit_user",
        JSON.stringify({
          email,
          name: "Demo User",
        }),
      );

      showToast("Welcome back. Your demo workspace is ready.", "success");
      navigate(location.state?.from ?? "/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      showToast("An error occurred during login. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={
        <>
          Don&apos;t have an account?{" "}
          <a className="font-semibold text-primary" href="/register">
            Get started free
          </a>
        </>
      }
      subtitle="Sign in to manage inventory, record sales, and review AI insight previews."
      title="Log in to TrackIt"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input label="Email" name="email" placeholder="owner@business.ng" required type="email" disabled={loading} />
        <Input
          label="Password"
          name="password"
          placeholder="Enter your password"
          required
          type={showPassword ? "text" : "password"}
          disabled={loading}
          icon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted hover:text-text"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <label className="flex items-center gap-3 text-sm text-muted">
          <input className="h-4 w-4 rounded border-border text-primary focus:ring-primary" name="remember" type="checkbox" disabled={loading} />
          Remember me
        </label>
        <Button className="w-full" size="lg" type="submit" loading={loading}>
          {loading ? "Signing In..." : "Log In"}
        </Button>
      </form>
    </AuthShell>
  );
}
