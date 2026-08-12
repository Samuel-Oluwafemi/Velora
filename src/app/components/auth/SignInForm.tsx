import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";

export default function SignInForm({
  onSwitch,
  onSuccess,
}: {
  onSwitch: (view: "signin" | "signup" | "forgot") => void;
  onSuccess?: () => void;
}) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div>
        <label className="block text-muted-foreground mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-border bg-background text-foreground"
        />
      </div>
      <div>
        <label className="block text-muted-foreground mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-border bg-background text-foreground"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-foreground text-primary-foreground"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <div className="mt-4 text-center text-sm">
        <button
          type="button"
          onClick={() => onSwitch("forgot")}
          className="underline cursor-pointer"
        >
          Forgot password?
        </button>
        <div className="mt-2">
          New here?{" "}
          <button
            type="button"
            onClick={() => onSwitch("signup")}
            className="underline"
          >
            Create account
          </button>
        </div>
      </div>
    </form>
  );
}
