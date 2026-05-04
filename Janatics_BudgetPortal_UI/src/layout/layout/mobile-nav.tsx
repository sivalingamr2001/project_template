"use client"

import { Menu } from "lucide-react"

import { AppSidebar } from "./AppSidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet"
import { Button } from "@/shared/components/ui/button"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <AppSidebar variant="mobile" />
      </SheetContent>
    </Sheet>
  )
}
