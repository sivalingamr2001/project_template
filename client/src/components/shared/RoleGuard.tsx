import type { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../lib/types';
import { Lock } from 'lucide-react';

interface RoleGuardProps {
  allowed: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowed, children, fallback }: RoleGuardProps) {
  const { currentRole } = useApp();

  if (!currentRole || !allowed.includes(currentRole)) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-8 bg-destructive/10 rounded-lg border border-destructive/20">
          <Lock className="text-destructive mr-2" size={20} />
          <p className="text-destructive font-medium">
            Access Denied: This feature is only available for {allowed.join(', ')}
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
