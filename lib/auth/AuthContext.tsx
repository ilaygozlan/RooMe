import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSession, signInMock, signOutMock, signUpMock } from "./mockAuth";

type User = { id: string; email: string; displayName: string } | null;
type Ctx = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};
const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then(u => setUser(u)).finally(() => setLoading(false));
  }, []);

  const value = useMemo<Ctx>(() => ({
    user,
    loading,
    async login(email, password) {
      const u = await signInMock(email, password);
      setUser(u);
    },
    async signup(email, password, displayName) {
      const u = await signUpMock(email, password, displayName);
      setUser(u);
    },
    async logout() {
      await signOutMock();
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}



