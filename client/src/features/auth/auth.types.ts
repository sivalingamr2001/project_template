export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  roles: User["role"][];
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
}
