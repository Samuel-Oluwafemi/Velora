import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import SignInForm from "./auth/SignInForm";
import SignUpForm from "./auth/SignUpForm";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";
import AccountDashboard from "./auth/AccountDashboard";

export function AccountPage({
  onNavigate,
}: {
  onNavigate: (p: string) => void;
}) {
  const { user, loading } = useAuth();

  // get the location and navigate functions from react-router-dom
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";

// State to manage the current view (signin, signup, forgot)
  const [view, setView] = useState<"signin" | "signup" | "forgot">("signin");

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader size={18} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-6 pt-5 md:pt-20 pb-2 md:pb-10">
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
          {user
            ? "My Account"
            : view === "signup"
              ? "Create Account"
              : view === "forgot"
                ? "Reset Password"
                : "Sign In"}
        </h1>

        {user ? (
          <AccountDashboard />
        ) : (
          // Render the appropriate form based on the current view state
          <div>
            {view === "signin" && (
              <SignInForm onSwitch={setView} onSuccess={() => navigate(from,
                {
                  state: {
                    toast: "Signed in successfully.",
                  },
                }
              )} />
            )}
            {view === "signup" && (
              <SignUpForm onSwitch={setView} onSuccess={() => navigate(from, 
                {
                  state: {
                    toast: "Account created successfully Welcome to VELORA.",
                  },
                }
              )} />
            )}
            {view === "forgot" && <ForgotPasswordForm onSwitch={setView} />}
          </div>
        )}
      </div>
    </div>
  );
}
