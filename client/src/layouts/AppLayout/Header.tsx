import { User2Icon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
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
            <p className="text-muted-foreground">
              Manage component development requisitions
            </p>
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
              <p className="text-foreground text-sm font-semibold">Jessin Sam</p>

              <p className="text-muted-foreground text-xs">jessin@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
