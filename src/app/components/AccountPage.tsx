export function AccountPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-sm">
        <p
          className="text-muted-foreground uppercase tracking-[0.2em] mb-2 text-center"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}
        >
          VELORA
        </p>
        <h1
          className="text-foreground mb-8 text-center"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem",
            fontWeight: 300,
          }}
        >
          Sign In
        </h1>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label
              className="block text-muted-foreground mb-2"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-border bg-background text-foreground 
              placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label
              className="block text-muted-foreground mb-2"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-border bg-background text-foreground 
              placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-foreground text-primary-foreground hover:bg-accent
             hover:text-foreground transition-colors duration-300 mt-2"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Sign In
          </button>
        </form>
        <p
          className="text-muted-foreground text-center mt-6"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
        >
          New to VELORA?{" "}
          <button className="text-foreground underline underline-offset-2">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
