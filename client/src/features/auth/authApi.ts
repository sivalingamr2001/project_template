import type { LoginInput, User } from "@/features/auth/auth.types";

const auth_session = "tanstack-mastery-session";

const demoUsers: User[] = [
  { id: 1001, name: "Anitha", email: "anitha@corp.local", role: "user" },
  { id: 2001, name: "Rahul", email: "rahul@corp.local", role: "user" },
  { id: 1002, name: "Meena", email: "meena@corp.local", role: "user" },
  { id: 2002, name: "Karthik", email: "karthik@corp.local", role: "user" },
  { id: 3001, name: "Sanjay", email: "sanjay@corp.local", role: "admin" },
];

function wait(ms = 450) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function loginRequest(input: LoginInput) {
  await wait();

  const user = demoUsers.find((entry) => entry.email === input.email);

  if (!user || input.password.trim().length < 4) {
    throw new Error(
      "Use one of the demo emails and any password with 4+ characters.",
    );
  }

  window.localStorage.setItem(auth_session, JSON.stringify(user));
  return user;
}

export function getStoredSession() {
  const session = window.localStorage.getItem(auth_session);
  return session ? (JSON.parse(session) as User) : null;
}

export function logoutRequest() {
  window.localStorage.removeItem(auth_session);
}
