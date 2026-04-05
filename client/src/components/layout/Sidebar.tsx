import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { LayoutDashboard, ClipboardList, CheckCircle, BarChart3, LogOut } from 'lucide-react';
import type { Page } from '../../context/AppContext';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  page: Page | 'LOGOUT';
  roles: string[];
}

export function Sidebar() {
  const { currentRole, currentPage, setCurrentPage, logout } = useApp();
  const { requests } = useData();

  const getPendingCount = () => {
    if (currentRole === 'HOD') {
      return requests.filter(r => r.items.some(i => i.status === 'PENDING')).length;
    }
    if (currentRole === 'IT_INFRA') {
      return requests.filter(r => r.items.some(i => i.status === 'APPROVED_HOD')).length;
    }
    return 0;
  };

  const navItems: NavItem[] = [
    ...(currentRole === 'EMPLOYEE' ? [
      { label: 'Dashboard', icon: <LayoutDashboard size={20} />, page: 'EMPLOYEE_DASHBOARD', roles: ['EMPLOYEE'] },
      { label: 'My Requests', icon: <ClipboardList size={20} />, page: 'EMPLOYEE_REQUESTS', roles: ['EMPLOYEE'] },
    ] : []),
    ...(currentRole === 'HOD' ? [
      { label: 'Approvals', icon: <CheckCircle size={20} />, page: 'HOD_APPROVALS', roles: ['HOD'] },
    ] : []),
    ...(currentRole === 'IT_INFRA' ? [
      { label: 'Queue', icon: <ClipboardList size={20} />, page: 'IT_QUEUE', roles: ['IT_INFRA'] },
      { label: 'Active Access', icon: <BarChart3 size={20} />, page: 'IT_ACTIVE_ACCESS', roles: ['IT_INFRA'] },
    ] : []),
    ...(currentRole !== 'EMPLOYEE' ? [
      { label: 'Analytics', icon: <BarChart3 size={20} />, page: 'ANALYTICS', roles: ['HOD', 'IT_INFRA'] },
    ] : []),
    { label: 'Logout', icon: <LogOut size={20} />, page: 'LOGOUT', roles: ['EMPLOYEE', 'HOD', 'IT_INFRA'] },
  ];

  return (
    <div className="w-64 bg-secondary border-r border-border flex flex-col p-[10px]">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-primary">Access Portal</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => {
          const isActive = currentPage === item.page;
          const pendingCount = (item.page === 'HOD_APPROVALS' || item.page === 'IT_QUEUE') ? getPendingCount() : 0;

          return (
            <button
              key={item.page}
              onClick={() => item.page === 'LOGOUT' ? logout() : setCurrentPage(item.page)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-primary/10'
              }`}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
              {pendingCount > 0 && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  isActive ? 'bg-primary-foreground text-primary' : 'bg-accent text-accent-foreground'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Access Request Portal v1.0
        </p>
      </div>
    </div>
  );
}
