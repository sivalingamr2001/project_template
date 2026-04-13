import { useAuthContext } from "@/features/auth";
import { useRouter } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { Boxes, LogOut } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/shared/components/ui/button";

export default function AppLayout() {
  const auth = useAuthContext();
  const router = useRouter();

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "49px" } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b bg-background px-4 py-3">
          <div className="flex flex-col">
            <h1 className="text-md font-bold leading-none">
              Janatics India Pvt. Ltd.
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              R&D Budget Management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="destructive"
              onClick={() => {
                auth.logout();
                void router.navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 h-screen overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
