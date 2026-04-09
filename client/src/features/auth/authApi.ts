import type { LoginInput, User } from "@/features/auth/auth.types";

const SESSION_KEY = "tanstack-mastery-session";

const demoUsers: User[] = [
  { id: 1, name: "Maya Thompson", email: "admin@mastery.dev", role: "admin" },
  { id: 2, name: "Ari Bennett", email: "user@mastery.dev", role: "user" },
];

function wait(ms = 450) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function loginRequest(input: LoginInput) {
  await wait();

  const user = demoUsers.find((entry) => entry.email === input.email);

  if (!user || input.password.trim().length < 4) {
    throw new Error("Use one of the demo emails and any password with 4+ characters.");
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function getStoredSession() {
  const session = window.localStorage.getItem(SESSION_KEY);
  return session ? (JSON.parse(session) as User) : null;
}

export function logoutRequest() {
  window.localStorage.removeItem(SESSION_KEY);
}
