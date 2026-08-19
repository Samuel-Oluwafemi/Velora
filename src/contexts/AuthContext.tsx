import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth, db } from "../app/firebase"; // auth talks to firebase auth, db talks to Firestore
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// AuthContextType defines the shape of the authentication context, including the current user, loading states for various operations, and methods for login, signup, logout, and password reset. It also includes an error state to handle any issues that arise during authentication processes.
interface AuthContextType {
  user: AuthUser | null;
  // Firebase's initial auth check
  loading: boolean;
  // Individual operations
  signupLoading: boolean;
  loginLoading: boolean;
  resetPasswordLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;

  signup: (name: string, email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  resetPassword: (email: string) => Promise<void>;

  clearError: () => void;
}

// AuthContext provides authentication state and methods to the rest of the app. It manages user state, loading states for various auth operations, and error handling. It uses Firebase Authentication for user management and Firestore for storing additional user data.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("Failed to set auth persistence", err);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser: FirebaseUser | null) => {
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          });
        } else {
          setUser(null);
        }

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    setError(null);
    setLoginLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      throw err;
    } finally {
      setLoginLoading(false);
    }
  }

  async function signup(name: string, email: string, password: string) {
    setError(null);
    setSignupLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        role: "customer",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");

      throw err;
    } finally {
      setSignupLoading(false);
    }
  }

  async function logout() {
    setError(null);

    try {
      await signOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
      throw err;
    }
  }

  async function resetPassword(email: string) {
    setError(null);
    setResetPasswordLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email",
      );

      throw err;
    } finally {
      setResetPasswordLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signupLoading,
        loginLoading,
        resetPasswordLoading,
        error,
        login,
        signup,
        logout,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
