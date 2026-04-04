import type { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { LayoutDashboard, ClipboardList, CheckCircle, BarChart3 } from 'lucide-react';
import type { Page } from '../../context/AppContext';

interface NavItem {
  label: string;
  icon: ReactNode;
  page: Page;
}

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { currentRole, currentPage, setCurrentPage } = useApp();
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
    ...(currentRole === 'EMPLOYEE'
      ? [
          { label: 'Dashboard', icon: <LayoutDashboard size={20} />, page: 'EMPLOYEE_DASHBOARD' as const },
          { label: 'My Requests', icon: <ClipboardList size={20} />, page: 'EMPLOYEE_REQUESTS' as const },
        ]
      : []),
    ...(currentRole === 'HOD'
      ? [
          { label: 'Approvals', icon: <CheckCircle size={20} />, page: 'HOD_APPROVALS' as const },
        ]
      : []),
    ...(currentRole === 'IT_INFRA'
      ? [
          { label: 'Queue', icon: <ClipboardList size={20} />, page: 'IT_QUEUE' as const },
          { label: 'Active Access', icon: <BarChart3 size={20} />, page: 'IT_ACTIVE_ACCESS' as const },
        ]
      : []),
    ...(currentRole !== 'EMPLOYEE'
      ? [
          { label: 'Analytics', icon: <BarChart3 size={20} />, page: 'ANALYTICS' as const },
        ]
      : []),
  ];

  return (
    <aside
      className={`shrink-0 bg-secondary border-r border-border flex flex-col p-[10px] transition-all duration-200 ${
        collapsed ? 'w-24' : 'w-64'
      }`}
    >
      <div className={`p-4 border-b border-border ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
            AP
          </div>
        ) : (
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-primary">Access Portal</h1>
            <p className="text-xs text-muted-foreground">Employee access workspace</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => {
          const isActive = currentPage === item.page;
          const pendingCount = (item.page === 'HOD_APPROVALS' || item.page === 'IT_QUEUE') ? getPendingCount() : 0;

          return (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-lg transition ${
                collapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-2.5'
              } ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-primary/10'
              }`}
            >
              <span className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                {item.icon}
                {!collapsed && item.label}
              </span>
              {!collapsed && pendingCount > 0 && (
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
    </aside>
  );
}
