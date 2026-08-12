import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";

export default function ForgotPasswordForm({ onSwitch }: { onSwitch: (view: "signin" | "signup" | "forgot") => void }) {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setMessage(null);
    try {
      await resetPassword(email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setLocalError((err as Error).message || "Failed to send reset email");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && <div className="text-sm text-green-600">{message}</div>}
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
      <button type="submit" disabled={loading} className="w-full py-3.5 bg-foreground text-primary-foreground">
        {loading ? "Sending..." : "Send reset email"}
      </button>

      <div className="mt-4 text-center text-sm">
        <button type="button" onClick={() => onSwitch("signin")} className="underline">
          Back to Sign In
        </button>
      </div>
    </form>
  );
}
