import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserRole, User } from '../lib/types';
import { MOCK_USERS } from '../lib/constants';

export type Page =
  | 'LOGIN'
  | 'EMPLOYEE_DASHBOARD'
  | 'EMPLOYEE_REQUESTS'
  | 'EMPLOYEE_REQUEST_DETAIL'
  | 'USER_PROFILE'
  | 'HOD_APPROVALS'
  | 'IT_QUEUE'
  | 'IT_ACTIVE_ACCESS'
  | 'ANALYTICS';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  currentPage: Page;
  isAuthenticated: boolean;
  selectedRequestId?: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setCurrentRole: (role: UserRole) => void;
  setCurrentPage: (page: Page) => void;
  setSelectedRequestId: (id?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<UserRole | null>(null);
  const [currentPage, setCurrentPageState] = useState<Page>('LOGIN');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>();

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    setCurrentPageState(
      role === 'EMPLOYEE' ? 'EMPLOYEE_DASHBOARD' : role === 'HOD' ? 'HOD_APPROVALS' : 'IT_QUEUE'
    );
  };

  const login = (username: string, password: string): boolean => {
    // Mock authentication
    const credentials = {
      employee: { password: 'pass', role: 'EMPLOYEE' as const },
      hod: { password: 'pass', role: 'HOD' as const },
      it: { password: 'pass', role: 'IT_INFRA' as const },
    };

    if (credentials[username as keyof typeof credentials]?.password === password) {
      const role = credentials[username as keyof typeof credentials].role;
      setCurrentRole(role);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRoleState(null);
    setCurrentPageState('LOGIN');
  };

  const setCurrentPage = (page: Page) => {
    setCurrentPageState(page);
  };

  const currentUser = currentRole === 'HOD'
    ? MOCK_USERS.hod
    : currentRole === 'IT_INFRA'
      ? MOCK_USERS.it
      : currentRole === 'EMPLOYEE'
        ? MOCK_USERS.employee
        : null;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        currentPage,
        isAuthenticated,
        selectedRequestId,
        login,
        logout,
        setCurrentRole,
        setCurrentPage,
        setSelectedRequestId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
