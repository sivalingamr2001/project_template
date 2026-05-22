import { User2Icon, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/core/auth";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card/90 z-20 shrink-0 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        {/* LEFT SECTION */}
        <div className="flex min-w-0 items-center gap-3 md:gap-5">
          {/* PAGE TITLE */}
          <div className="space-y-2">
            <h1 className="text-primary text-3xl font-bold tracking-tight">
              Requisition For Component Developement Form
            </h1>
            <p className="text-muted-foreground">Manage component development requisitions</p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* PROFILE */}
          <div className="flex items-center gap-3">
            {/* AVATAR */}
            <div>
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt="User Avatar" />
                <AvatarFallback>
                  <User2Icon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </div>
            {/* USER INFO */}
            <div className="hidden leading-tight md:block">
              <p className="text-foreground text-sm font-semibold">{user?.name || "-"}</p>

              <p className="text-muted-foreground text-xs">{user?.email || "-"}</p>
            </div>
          </div>

          <div>
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2 rounded-full">
              <LogOut className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
