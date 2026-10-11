import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebase, firebaseReady } from "./firebase";
import { upsertUserProfile } from "./api";

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState>({
  user: null,
  isAdmin: false,
  loading: true,
  logout: async () => {},
});


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }

    const { auth } = getFirebase();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAdmin(false);

      try {
        if (u) {
          const token = await u.getIdTokenResult();
          setIsAdmin(token.claims["admin"] === true);

          upsertUserProfile(u.uid, {
            ...(u.email ? { email: u.email } : {}),
            name: u.displayName ?? "",
          }).catch((error) => {
            console.error("Could not update user profile:", error);
          });
        }
      } catch (error) {
        console.error("Authentication initialization failed:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        isAdmin,
        loading,
        logout: () => signOut(getFirebase().auth),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}



export const useAuth = () => useContext(Ctx);