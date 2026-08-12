import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";

export default function SignUpForm({
  onSwitch,
  onSuccess,
}: {
  onSwitch: (view: "signin" | "signup" | "forgot") => void;
  onSuccess?: () => void;
}) {
  const { signup, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
      await signup(email, password);
      onSuccess?.();
    } catch (err) {
      setLocalError((err as Error).message || "Failed to create account");
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
      <div>
        <label className="block text-muted-foreground mb-2">Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full px-4 py-3 border border-border bg-background text-foreground"
        />
      </div>

      <button type="submit" disabled={loading} className="w-full py-3.5 bg-foreground text-primary-foreground">
        {loading ? "Creating..." : "Create account"}
      </button>

      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <button type="button" onClick={() => onSwitch("signin")} className="underline">
          Sign In
        </button>
      </div>
    </form>
  );
}
