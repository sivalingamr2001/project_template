import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, UserCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationBell } from '../shared/NotificationBell';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { currentUser, currentRole, setCurrentRole, setCurrentPage, logout } = useApp();

  return (
    <div className="bg-background border-b border-border px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Role: {currentRole === 'EMPLOYEE' ? 'Requester' : currentRole === 'HOD' ? 'HOD' : 'IT Rep'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem onClick={() => setCurrentRole('EMPLOYEE')}>
              Requester / Employee
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentRole('HOD')}>
              Head of Department
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentRole('IT_INFRA')}>
              IT Representative
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <UserCircle2 className="h-4 w-4" />
              <span>{currentUser?.name ?? 'Profile'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setCurrentPage('USER_PROFILE')}>
              <UserCircle2 className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} variant="destructive">
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
