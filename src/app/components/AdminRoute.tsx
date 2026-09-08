import { useEffect, useState, type ReactNode } from "react";
import { Loader } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../firebase";
import { AdminLogin } from "./AdminLogin";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { logout } = useAuth();
  const [roleLoading, setRoleLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | undefined>();

  useEffect(() => {
    let active = true;

    if (!user) {
      setRoleLoading(false);
      setIsAdmin(false);
      return () => {
        active = false;
      };
    }

    setRoleLoading(true);
    setAccessMessage(undefined);

    getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        if (!active) return;
        const admin = snapshot.exists() && snapshot.data().role === "admin";
        setIsAdmin(admin);
        if (!admin) {
          setAccessMessage(
            "This account does not have admin access. Sign in with an authorized admin account.",
          );
          void logout();
        }
      })
      .catch(() => {
        if (!active) return;
        setIsAdmin(false);
        setAccessMessage("Unable to verify admin access. Please try again.");
      })
      .finally(() => {
        if (active) setRoleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [logout, user]);

  if (authLoading || roleLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader
          size={20}
          className="animate-spin"
          aria-label="Checking admin access"
        />
      </div>
    );
  }

  if (!user) return <AdminLogin message={accessMessage} />;
  if (!isAdmin) return <AdminLogin message={accessMessage} />;

  return <>{children}</>;
}
