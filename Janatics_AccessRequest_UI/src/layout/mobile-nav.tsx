"use client"

import { Button } from "@/shared/components/ui/button"
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet"
import { Menu } from "lucide-react"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="transition-all duration-300 hover:bg-secondary lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
    </Sheet>
  )
}
