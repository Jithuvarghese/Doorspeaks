import { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000";
const AUTH_STORAGE_KEY = "doorspeaks.auth";

export type UserRole = "TENANT" | "CUSTOMER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type LoginPayload = {
  email: string;
  password: string;
};

function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function storeSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readStoredSession());
    setReady(true);
  }, []);

  async function register(payload: RegisterPayload) {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as { message?: string; token?: string; user?: AuthUser };

    if (!response.ok || !data.token || !data.user) {
      throw new Error(data.message ?? "Registration failed.");
    }

    const nextSession = { token: data.token, user: data.user };
    setSession(nextSession);
    storeSession(nextSession);
  }

  async function login(payload: LoginPayload) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as { message?: string; token?: string; user?: AuthUser };

    if (!response.ok || !data.token || !data.user) {
      throw new Error(data.message ?? "Login failed.");
    }

    const nextSession = { token: data.token, user: data.user };
    setSession(nextSession);
    storeSession(nextSession);
  }

  async function logout() {
    if (session?.token) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` }
      }).catch(() => undefined);
    }

    setSession(null);
    storeSession(null);
  }

  return { session, ready, register, login, logout };
}
