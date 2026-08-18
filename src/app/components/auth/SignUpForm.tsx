import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Loader} from "lucide-react";

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
        {/* Password */}
        <label className="block text-muted-foreground mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full px-4 py-3 border border-border bg-background text-foreground"
        />
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-muted-foreground mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full px-4 py-3 border border-border bg-background text-foreground"
        />
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
