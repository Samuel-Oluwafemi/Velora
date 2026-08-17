import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Loader, FileWarning } from "lucide-react";

export default function ForgotPasswordForm({
  onSwitch,
}: {
  onSwitch: (view: "signin" | "signup" | "forgot") => void;
}) {
  const { resetPassword, actionLoading } = useAuth();
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
      {/* Email */}
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

      {/* Submit */}
      <button
        type="submit"
        disabled={actionLoading}
        className="w-full py-3.5 bg-foreground text-primary-foreground hover:bg-black focus:outline-none 
        focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-200 cursor-pointer
        disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center gap-2 items-center"
      >
        {actionLoading ? (
          <>
            <Loader size={18} className="animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          "Send reset email"
        )}
      </button>

      {/* Back to sign in */}
      <div className="mt-4 text-center text-sm">
        <button
          type="button"
          onClick={() => onSwitch("signin")}
          className="underline hover:text-blue-700 cursor-pointer"
        >
          Back to Sign In
        </button>
      </div>

      {/* Footer */}
      <div className="flex text-center justify-center mt-4 gap-1">
        <FileWarning className="text-purple-600" size={15} />
        <p className="text-center text-gray-600 text-xs">
          Protected admin access only
        </p>
      </div>
    </form>
  );
}
