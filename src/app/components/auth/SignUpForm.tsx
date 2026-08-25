import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Eye, EyeOff, Loader } from "lucide-react";

export default function SignUpForm({
  onSwitch,
  onSuccess,
}: {
  onSwitch: (view: "signin" | "signup" | "forgot") => void;
  onSuccess?: () => void;
}) {
  const { signup, signupLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirm) {
      setLocalError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    try {
      await signup(name, email, password);
      onSuccess?.();
    } catch (err) {
      setLocalError((err as Error).message || "Failed to create account");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {localError && <div className="text-sm text-red-600">{localError}</div>}
      <div>
        {/* Name */}
        <label className="block text-muted-foreground mb-2">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter full name"
          className="w-full px-4 py-3 border border-border bg-background text-foreground"
        />

        {/* Email */}
        <label className="block text-muted-foreground mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-4 py-3 border border-border bg-background text-foreground"
        />
      </div>

      <div>
        <label className="block text-muted-foreground mb-2">Password</label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full px-4 py-3 pr-12 border border-border bg-background text-foreground"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground 
            transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
  <label className="block text-muted-foreground mb-2">
    Confirm Password
  </label>

  <div className="relative">
    <input
      type={showConfirmPassword ? "text" : "password"}
      value={confirm}
      onChange={(e) => setConfirm(e.target.value)}
      required
      placeholder="••••••••"
      autoComplete="new-password"
      className="w-full px-4 py-3 pr-12 border border-border bg-background text-foreground"
    />

    <button
      type="button"
      onClick={() => setShowConfirmPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2
      text-muted-foreground hover:text-foreground
      transition-colors cursor-pointer"
      aria-label={
        showConfirmPassword
          ? "Hide confirm password"
          : "Show confirm password"
      }
    >
      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>

      {/* Submit */}
      <button
        type="submit"
        disabled={signupLoading}
        className="w-full py-3.5 flex justify-center gap-2 items-center bg-foreground curosr-pointer 
        text-primary-foreground cursor-pointer hover:bg-black focus:outline-none focus:ring-2 
        focus:ring-black focus:ring-offset-2 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {signupLoading ? (
          <>
            <Loader size={18} className="animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          "Create Account"
        )}
      </button>

      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitch("signin")}
          className="underline cursor-pointer hover:text-blue-700"
        >
          Sign In
        </button>
      </div>
    </form>
  );
}
