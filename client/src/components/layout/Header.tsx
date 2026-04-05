import { useState } from 'react';
import { NotificationBell } from '../shared/NotificationBell';
import { LogOut, ChevronDown, UserCircle2 } from 'lucide-react';
import { useApp } from '@/hooks/useApp';

export function Header() {
  const { currentUser, logout } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="font-semibold text-foreground">Welcome, {currentUser?.name || 'Guest'}</h2>
        <p className="text-sm text-muted-foreground">{currentUser?.email || ''}</p>
      </div>

      <div className="flex items-center gap-4 relative">
        <NotificationBell />

        <button
          onClick={() => setIsMenuOpen(prev => !prev)}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-secondary hover:bg-secondary/80 transition text-sm font-medium"
          aria-expanded={isMenuOpen}
          aria-controls="profile-menu"
        >
          <UserCircle2 size={16} />
          Profile
          <ChevronDown size={14} />
        </button>

        {isMenuOpen && (
          <div
            id="profile-menu"
            className="absolute right-0 mt-10 w-40 bg-background border border-border rounded-lg shadow-lg z-20"
          >
            <button
              onClick={() => {
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-primary/10"
            >
              View Profile
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="w-full text-left px-4 py-2 hover:bg-primary/10"
            >
              <span className="flex items-center gap-2">
                <LogOut size={14} /> Logout
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
