import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Eye, EyeOff, Loader } from "lucide-react";

export default function SignInForm({
  onSwitch,
  onSuccess,
}: {
  onSwitch: (view: "signin" | "signup" | "forgot") => void;
  onSuccess?: () => void;
}) {
  const { login, loginLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setLocalError((err as Error).message || "Failed to sign in");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {localError && <div className="text-sm text-red-600">{localError}</div>}
      {/* email */}
      <div>
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

      {/* Password */}
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

      {/* Forgot password */}
      <div className="mt-4 text-left text-sm">
        <button
          type="button"
          onClick={() => onSwitch("forgot")}
          className="underline cursor-pointer hover:text-blue-700"
        >
          Forgot password?
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={loginLoading}
          className="w-full py-3.5 bg-foreground text-primary-foreground cursor-pointer 
          hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
            transition duration-200 flex justify-center gap-2 items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loginLoading ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Create account */}
        <div className="mt-2">
          New here?{" "}
          <button
            type="button"
            onClick={() => onSwitch("signup")}
            className="underline cursor-pointer hover:text-blue-700 focus:outline-none 
            focus:ring-1 focus:ring-black focus:ring-offset-1
            transition duration-200"
          >
            Create account
          </button>
        </div>
      </div>
    </form>
  );
}
