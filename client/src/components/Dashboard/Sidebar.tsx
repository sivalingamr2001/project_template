import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

interface SidebarProps {
  user: { email: string; name: string };
  onLogout: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  return (
    <div className="flex w-64 flex-col bg-slate-900 p-6 text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">JANATICS</h1>
        <p className="mt-1 text-xs text-slate-400">Requisition System</p>
      </div>

      <nav className="flex-1 space-y-2">
        <div className="mb-4 text-sm font-medium text-slate-400">Menu</div>
        <div className="rounded-lg bg-slate-800 px-3 py-2">Documents</div>
      </nav>

      <div className="border-t border-slate-700 pt-4">
        <div className="mb-4 text-sm">
          <p className="text-slate-400">Logged in as</p>
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
        <Button variant="outline" className="w-full justify-start" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
