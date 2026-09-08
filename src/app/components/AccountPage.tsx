import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import SignInForm from "./auth/SignInForm";
import SignUpForm from "./auth/SignUpForm";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";
import AccountDashboard from "./auth/AccountDashboard";
import { Reveal } from "./Motion";

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
    <div className="bg-background min-h-screen flex items-center justify-center px-5 py-28 md:px-10 md:py-36">
      <Reveal className={user ? "w-full max-w-4xl" : "w-full max-w-md"}>
        <div className={user ? "" : "border border-border bg-card p-7 shadow-[0_18px_50px_rgba(26,26,26,0.06)] md:p-10"}>
        <h1
          className="text-foreground mb-8 mt-9 md:mt-0 text-center"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem",
            fontWeight: 300,
          }}
        >
          {user
            ? ""
            : view === "signup"
              ? "Create Account"
              : view === "forgot"
                ? "Reset Password"
                : "Sign In"}
        </h1>

        {!user && <p className="mb-8 text-center text-sm leading-6 text-muted-foreground">A quieter way to keep track of your orders, saved details, and everyday essentials.</p>}

        {user ? (
          <AccountDashboard />
        ) : (
          // Render the appropriate form based on the current view state
          <div>
            {/* SIGN IN */}
            {view === "signin" && (
              <SignInForm
                onSwitch={setView}
                onSuccess={() => {
                  // If the user came from checkout,
                  // send them back to checkout without showing
                  // the normal sign-in success toast.
                  if (from === "/checkout") {
                    navigate(from);
                    return;
                  }

                  // Normal sign-in:
                  // go back to the original page and show a toast.
                  navigate(from, {
                    state: {
                      toast: "Signed in successfully",
                    },
                  });
                }}
              />
            )}

            {/* SIGN UP */}
            {view === "signup" && (
              <SignUpForm
                onSwitch={setView}
                onSuccess={() => {
                  // If the user came from checkout,
                  // send them back to checkout without showing
                  // the account-created toast.
                  if (from === "/checkout") {
                    navigate(from);
                    return;
                  }

                  // Normal account creation:
                  // go back to the original page and show a toast.
                  navigate(from, {
                    state: {
                      toast: "Account created successfully",
                    },
                  });
                }}
              />
            )}
            {view === "forgot" && <ForgotPasswordForm onSwitch={setView} />}
          </div>
        )}
        </div>
      </Reveal>
    </div>
  );
}
