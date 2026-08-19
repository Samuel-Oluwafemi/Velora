import { useAuth } from "../../../contexts/AuthContext";

export default function AccountDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="text-center">
      <p className="mb-4">
        Signed in as <strong>{user?.email}</strong>
      </p>
      <button
        onClick={() => void logout()}
        className="px-4 py-2 bg-foreground text-primary-foreground cursor-pointer
        hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
        transition duration-200"
      >
        Logout
      </button>
    </div>
  );
}
