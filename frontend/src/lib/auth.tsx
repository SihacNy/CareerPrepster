"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { USER_STORAGE_KEY, CV_DRAFT_STORAGE_KEY, HISTORY_STORAGE_KEY } from "@/lib/storageKeys";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: "google" | "github";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isBackendSession: boolean;
  loginWithGoogleCredential: (credential: string) => void;
  loginWithProfile: (profile: { id: string; name: string; email: string; avatarUrl?: string }, options?: { backendSession?: boolean }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to decode JWT token without external dependencies
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // True only when the backend confirmed the session via /auth/me or the
  // Google token exchange succeeded. A localStorage-restored profile is NOT a
  // real session, so cloud writes must not be attempted with it.
  const [isBackendSession, setIsBackendSession] = useState<boolean>(false);

  // Restore user from backend session first, with localStorage fallback
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const { authApi } = await import("@/lib/api");
        const res = await authApi.getMe();
        if (isMounted && res?.user) {
          const remoteUser: User = {
            id: res.user.id,
            name: res.user.name || "Student",
            email: res.user.email,
            avatarUrl: res.user.avatarUrl || undefined,
            provider: "google",
          };
          setUser(remoteUser);
          setIsBackendSession(true);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(remoteUser));
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Not authenticated on backend or offline; fallback to localStorage
      }

      if (isMounted) {
        setIsBackendSession(false);
        try {
          const savedUser = localStorage.getItem(USER_STORAGE_KEY);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        } catch (e) {
          console.warn("Could not restore user from storage:", e);
        } finally {
          setIsLoading(false);
        }
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithGoogleCredential = async (credential: string) => {
    const payload = decodeJwt(credential);

    // 1. Try to register/login on the backend so a User row is created in
    //    MySQL and the HttpOnly session cookie is set.
    try {
      const { authApi } = await import("@/lib/api");
      const res = await authApi.loginWithGoogle(credential);
      if (res?.user) {
        const newUser: User = {
          id: res.user.id,
          name: res.user.name || payload?.name || payload?.email?.split("@")[0] || "Student",
          email: res.user.email || payload?.email || "",
          avatarUrl: res.user.avatarUrl || payload?.picture || undefined,
          provider: "google",
        };
        setUser(newUser);
        setIsBackendSession(true);
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        } catch (e) {
          console.error("Failed to save user session:", e);
        }
        return;
      }
    } catch (err) {
      // Backend offline or token rejected: fall back to a client-only profile
      console.info("Backend session sync skipped; using client-only profile.", err);
    }

    if (!payload) return;

    const fallbackUser: User = {
      id: payload.sub || String(Date.now()),
      name: payload.name || payload.email?.split("@")[0] || "Student",
      email: payload.email || "",
      avatarUrl: payload.picture,
      provider: "google",
    };
    setUser(fallbackUser);
    setIsBackendSession(false);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
    } catch (e) {
      console.error("Failed to save user session:", e);
    }
  };

  const loginWithProfile = (profile: { id: string; name: string; email: string; avatarUrl?: string }, options?: { backendSession?: boolean }) => {
    const newUser: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      provider: "google",
    };

    setUser(newUser);
    setIsBackendSession(Boolean(options?.backendSession));
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error("Failed to save user session:", e);
    }
  };

  const logout = () => {
    setUser(null);
    setIsBackendSession(false);
    try {
      // Clear the session and all locally persisted CV data so a different
      // account signing in on this browser never inherits the previous user's draft.
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(CV_DRAFT_STORAGE_KEY);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      import("@/lib/api").then(({ authApi }) => {
        authApi.logout().catch(() => {});
      });
    } catch (e) {
      console.error("Failed to clear user session:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isBackendSession,
        loginWithGoogleCredential,
        loginWithProfile,
        logout,
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
