export interface LoginFormData {
  identifier: string; // email or user id
  password: string;
}

export interface LoginProps {
  onLogin: (identifier: string) => void;
}
