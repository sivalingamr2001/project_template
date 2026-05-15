export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginProps {
  onLogin: (email: string) => void;
}
