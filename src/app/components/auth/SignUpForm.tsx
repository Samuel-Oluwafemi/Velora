import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Eye, EyeOff, Loader } from "lucide-react";
import { Reveal } from "../Motion";

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
    <Reveal>
    <form onSubmit={handleSubmit} className="space-y-5">
      {localError && <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{localError}</div>}
      <div>
        {/* Name */}
        <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Full name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter full name"
          className="w-full border border-border bg-background px-4 py-3.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
        />

        {/* Email */}
        <label className="mb-2 mt-4 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full border border-border bg-background px-4 py-3.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Password</label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full border border-border bg-background px-4 py-3.5 pr-12 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
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
  <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
    Confirm password
  </label>

  <div className="relative">
    <input
      type={showConfirmPassword ? "text" : "password"}
      value={confirm}
      onChange={(e) => setConfirm(e.target.value)}
      required
      placeholder="••••••••"
      autoComplete="new-password"
      className="w-full border border-border bg-background px-4 py-3.5 pr-12 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
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
        className="flex w-full cursor-pointer items-center justify-center gap-2 bg-foreground py-3.5 text-xs uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Already part of VELORA?{" "}
        <button
          type="button"
          onClick={() => onSwitch("signin")}
          className="text-foreground underline underline-offset-4 transition-colors hover:text-accent"
        >
          Sign In
        </button>
      </div>
    </form>
    </Reveal>
  );
}
