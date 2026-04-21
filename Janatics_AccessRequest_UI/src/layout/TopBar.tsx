"use client"

import { useAuth } from "@/providers/auth-provider"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenu,
} from "@/shared/components/ui/dropdown-menu"
import { Separator } from "@/shared/components/ui/separator"
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useNavigationBlock } from "@/providers/NavigationBlockProvider"
import { DraftConfirmationDialog } from "@/features/budget/components/DraftConfirmationDialog"
import { useState } from "react"
import { useBudget } from "@/providers/Budget/BudgetProvider"

export function Header() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { activeRecord } = useBudget()
  const { isBlocked, blockRecord, onConfirm } = useNavigationBlock()
  const [showBlockDialog, setShowBlockDialog] = useState(false)

  const navigation = [
    { name: "Dashboard", to: "/budget/dashboard", icon: LayoutDashboard },
    { name: "Plan Entry", to: "/budget/plan-entry", icon: FileText },
    { name: "Analytics", to: "/budget/analytics", icon: BarChart3 },
  ]

  const canAccessPlanAndAnalytics = Boolean(activeRecord)

  const handleNavigation = (to: string, isDisabled = false) => {
    if (isDisabled) {
      return
    }

    if (isBlocked) {
      setShowBlockDialog(true)
    } else {
      navigate(to)
    }
  }

  const handleSaveDraft = () => {
    // The draft saving is handled in PlanEntry component
    onConfirm()
    setShowBlockDialog(false)
    // Navigate after confirmation
    setTimeout(() => {
      window.location.reload() // Force reload to clear state
    }, 100)
  }

  const handleClear = () => {
    onConfirm()
    setShowBlockDialog(false)
    // Navigate after confirmation
    setTimeout(() => {
      window.location.reload() // Force reload to clear state
    }, 100)
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto py-2">
        <div className="flex items-center justify-between gap-4 px-4">
          {/* Logo Section */}
          <div className="flex items-center">
            <div className="flex flex-col items-start leading-tight">
              <span className="text-lg font-black tracking-[0.15em] text-primary md:text-xl">
                JANATICS
              </span>
              {/* Line matching description width */}
              <Separator className="my-1 bg-foreground/20" />
              <span className="hidden text-[9px] font-bold tracking-[0.1em] text-muted-foreground uppercase sm:block">
                R&D Manufacturing Budget Portal
              </span>
            </div>
          </div>

          {/* Nav Section */}
          <nav className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
            {navigation.map((item) => {
              const isActive = pathname === item.to
              const isDisabled =
                (item.name === "Plan Entry" || item.name === "Analytics") &&
                !canAccessPlanAndAnalytics
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  disabled={isDisabled}
                  className={`h-8 gap-2 px-4 transition-all duration-200 ${
                    isActive
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                  onClick={() => handleNavigation(item.to, isDisabled)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden font-medium md:inline">
                    {item.name}
                  </span>
                </Button>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-transparent"
                >
                  <Avatar className="h-9 w-9 border border-border transition-transform hover:scale-105">
                    <AvatarImage
                      src="/avatar-placeholder.png"
                      alt="User Avatar"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-semibold">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {blockRecord && (
        <DraftConfirmationDialog
          isOpen={showBlockDialog}
          onClose={() => setShowBlockDialog(false)}
          onSaveDraft={handleSaveDraft}
          onClear={handleClear}
          record={blockRecord}
        />
      )}
    </header>
  )
}
