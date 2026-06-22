import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api } from "./api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: { user: AuthUser } | null;
  ready: boolean;

  signIn: (email: string, password: string) => Promise<void>;

  signUp: (name: string, email: string, password: string) => Promise<void>;

  signInWithGoogle: () => Promise<void>;

  signOut: () => Promise<void>;

  updateProfile: (patch: Partial<AuthUser>) => Promise<void>;

  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getMe();

      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
      });
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);

    setUser(data.user);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const data = await api.signup(name, email, password);

    setUser(data.user);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    throw new Error("Google Sign-In is not implemented.");
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error(error);
    }

    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch: Partial<AuthUser>) => {
    const data = await api.updateMe({
      name: patch.name,
      phone: patch.phone,
      avatarUrl: patch.avatarUrl,
    });

    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,

      session: user ? { user } : null,

      ready,

      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateProfile,
      refresh,
    }),
    [user, ready, signIn, signUp, signInWithGoogle, signOut, updateProfile, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
