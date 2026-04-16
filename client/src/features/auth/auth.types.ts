export interface User {
  employeeId: number;
  name: string;
  email: string;
  departmentId: number;
  departmentName: string;
  role: string;
  departmentHod?: {
    employeeId: number;
    name: string;
    email: string;
  } | null;
}

export interface LoginInput {
  employeeId: number;
  password: string;
}

export interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  roles: string[];
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
}
