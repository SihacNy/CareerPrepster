"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  loginWithGoogleCredential: (credential: string) => void;
  loginWithProfile: (profile: { id: string; name: string; email: string; avatarUrl?: string }) => void;
  logout: () => void;
}

const USER_STORAGE_KEY = "careerprepster_user_v1";

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
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(remoteUser));
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Not authenticated on backend or offline; fallback to localStorage
      }

      if (isMounted) {
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

  const loginWithGoogleCredential = (credential: string) => {
    const payload = decodeJwt(credential);
    if (!payload) return;

    const newUser: User = {
      id: payload.sub || String(Date.now()),
      name: payload.name || payload.email?.split("@")[0] || "Student",
      email: payload.email || "",
      avatarUrl: payload.picture,
      provider: "google",
    };

    setUser(newUser);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error("Failed to save user session:", e);
    }
  };

  const loginWithProfile = (profile: { id: string; name: string; email: string; avatarUrl?: string }) => {
    const newUser: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      provider: "google",
    };

    setUser(newUser);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error("Failed to save user session:", e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
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
