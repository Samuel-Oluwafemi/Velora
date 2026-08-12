import { useAuth } from "../../../contexts/AuthContext";

export default function AccountDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="text-center">
      <p className="mb-4">Signed in as <strong>{user?.email}</strong></p>
      <button
        onClick={() => void logout()}
        className="px-4 py-2 bg-foreground text-primary-foreground"
      >
        Logout
      </button>
    </div>
  );
}
