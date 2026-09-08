import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Loader } from "lucide-react";
import { Reveal } from "../Motion";

// ForgotPasswordForm is a React component that provides a form for users to request a password reset email. It uses the useAuth hook to access authentication methods and state, including the resetPassword function and loading state. The component manages local state for the email input, success message, and error messages. When the form is submitted, it attempts to send a password reset email and displays appropriate feedback to the user.
export default function ForgotPasswordForm({
  onSwitch,
}: {
  onSwitch: (view: "signin" | "signup" | "forgot") => void;
}) {
  const { resetPassword, resetPasswordLoading } = useAuth();
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
    <Reveal>
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="mb-2 text-center text-sm leading-6 text-muted-foreground">Enter the email attached to your account and we will send a secure reset link.</p>
      {message && <div className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">{message}</div>}
      {localError && <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{localError}</div>}
      {/* Email */}
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full border border-border bg-background px-4 py-3.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={resetPasswordLoading}
        className="flex w-full cursor-pointer items-center justify-center gap-2 bg-foreground py-3.5 text-xs uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {resetPasswordLoading ? (
          <>
            <Loader size={18} className="animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          "Send reset email"
        )}
      </button>

      {/* Back to sign in */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => onSwitch("signin")}
          className="text-foreground underline underline-offset-4 transition-colors hover:text-accent"
        >
          Back to Sign In
        </button>
      </div>
    </form>
    </Reveal>
  );
}
