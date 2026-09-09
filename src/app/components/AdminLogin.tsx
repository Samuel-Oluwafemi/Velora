import { useState } from "react";
import { Eye, EyeOff, Loader, ShieldCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function AdminLogin({ message }: { message?: string }) {
  const { login, loginLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate("/admin", {
        replace: true,
        state: { toast: "Admin signed in successfully" },
      });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Unable to sign in",
      );
    }
  }

  return (
    <main className="bg-background min-h-screen flex items-center justify-center px-6">
      <section className="w-full max-w-md bg-card border border-border p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-accent flex items-center justify-center">
            <ShieldCheck
              size={20}
              strokeWidth={1.5}
              className="text-foreground"
            />
          </div>
          <div>
            <p
              className="tracking-[0.25em] uppercase text-foreground"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.1rem",
              }}
            >
              VELORA
            </p>
            <p
              className="text-muted-foreground"
              style={{ fontSize: "0.75rem" }}
            >
              Admin access
            </p>
          </div>
        </div>

        <h1
          className="text-foreground mb-2"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem",
            fontWeight: 300,
          }}
        >
          Sign in to Admin
        </h1>
        <p
          className="text-muted-foreground mb-7"
          style={{ fontSize: "0.82rem" }}
        >
          Use the email and password for your authorized admin account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {message && (
            <p
              className="text-amber-800 border border-amber-200 bg-amber-50 px-3 py-2"
              role="status"
              style={{ fontSize: "0.8rem" }}
            >
              {message}
            </p>
          )}
          {error && (
            <p
              className="text-red-700 border border-red-200 bg-red-50 px-3 py-2"
              role="alert"
              style={{ fontSize: "0.8rem" }}
            >
              {error}
            </p>
          )}

          <label
            className="block text-muted-foreground"
            style={{ fontSize: "0.78rem" }}
          >
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="mt-2 w-full px-4 py-3 border border-border bg-background text-foreground"
              placeholder="you@example.com"
            />
          </label>

          <label
            className="block text-muted-foreground"
            style={{ fontSize: "0.78rem" }}
          >
            Password
            <span className="relative block mt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 border border-border bg-background text-foreground"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3.5 bg-foreground text-primary-foreground disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {loginLoading && <Loader size={16} className="animate-spin" />}
            {loginLoading ? "Signing in" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
