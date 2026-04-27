import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const savedUser = localStorage.getItem("trackit_user");
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (savedUser) {
    return <Navigate replace to="/dashboard" />;
  }

  const validate = (formData) => {
    const nextErrors = {};
    const fullName = String(formData.get("fullName") || "").trim();
    const businessName = String(formData.get("businessName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!fullName) nextErrors.fullName = "Full name is required.";
    if (!businessName) nextErrors.businessName = "Business name is required.";
    if (!email) nextErrors.email = "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextErrors = validate(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      showToast("Please fix the highlighted fields and try again.", "error");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      localStorage.setItem(
        "trackit_user",
        JSON.stringify({
          business_name: String(formData.get("businessName")),
          email: String(formData.get("email")),
          name: String(formData.get("fullName")),
        }),
      );

      showToast("Your TrackIt workspace is ready.", "success");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);
      showToast("An error occurred during registration. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={
        <>
          Already have an account?{" "}
          <a className="font-semibold text-primary" href="/login">
            Log in
          </a>
        </>
      }
      subtitle="Create your demo account and start testing TrackIt end to end."
      title="Create your free account"
    >
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <Input error={errors.fullName} label="Full Name" name="fullName" placeholder="Ada Okafor" required disabled={loading} />
        <Input error={errors.businessName} label="Business Name" name="businessName" placeholder="Ada Styles" required disabled={loading} />
        <div className="sm:col-span-2">
          <Input error={errors.email} label="Email" name="email" placeholder="owner@business.ng" required type="email" disabled={loading} />
        </div>
        <Input
          error={errors.password}
          label="Password"
          name="password"
          placeholder="Create a password"
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
        <Input
          error={errors.confirmPassword}
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Repeat password"
          required
          type={showConfirmPassword ? "text" : "password"}
          disabled={loading}
          icon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-muted hover:text-text"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <div className="sm:col-span-2">
          <Button className="w-full" size="lg" type="submit" loading={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
