"use client"

import Logo from "@/assets/jana.png"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { NAVIGATION_ITEMS } from "@/shared/lib/navigationItems"
import { PORTAL_CONFIG } from "@/shared/lib/portalConfig"
import { cn } from "@/shared/lib/utils"
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"

type SidebarProps = {
  variant?: "desktop" | "mobile"
  isCollapsed?: boolean
}

export function AppSidebar({ variant = "desktop", isCollapsed = false }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const location = useLocation()

  useEffect(() => {
    if (!isCollapsed) {
      const activeParent = NAVIGATION_ITEMS.find(item => 
        item.children?.some(child => location.pathname === child.path)
      )
      if (activeParent && !openMenus.includes(activeParent.id)) {
        setOpenMenus(prev => [...prev, activeParent.id])
      }
    }
  }, [location.pathname, isCollapsed])

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "overflow-y-auto bg-card p-4 transition-all duration-300",
          !isCollapsed && "lg:border-r lg:border-border border-r",
          variant === "desktop" ? "fixed top-0 left-0 z-30 hidden h-screen lg:block" : "h-full w-full",
          isCollapsed ? "w-20 px-3" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className={cn("mb-8 flex items-center gap-2", isCollapsed ? "justify-center" : "px-2")}>
          <Link to={PORTAL_CONFIG.brand.homePath} className="flex items-center gap-3">
            {!isCollapsed ? (
              <div className="flex flex-col gap-1">
                <img src={Logo} alt="Janatics" className="h-5 w-fit" />
                <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Budget Portal</p>
              </div>
            ) : (
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-xs">J</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => {
            const hasChildren = item.children && item.children.length > 0
            const isOpen = openMenus.includes(item.id)
            const isActive = location.pathname.startsWith(item.path)

            // --- 1. COLLAPSED RENDER (Icon Only) ---
            if (isCollapsed) {
              if (hasChildren) {
                return (
                  <DropdownMenu key={item.id}>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "flex w-full h-11 items-center justify-center rounded-xl transition-all",
                        isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary"
                      )}>
                        <item.icon className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" sideOffset={10} className="w-48">
                      <DropdownMenuLabel className="text-xs">{item.label}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {item.children?.map((child) => (
                        <DropdownMenuItem key={child.path} asChild>
                          <Link to={child.path} className="flex items-center gap-2 py-2 cursor-pointer">
                            {child.icon && <child.icon className="h-4 w-4" />}
                            <span className="text-sm">{child.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Link to={item.path} className={cn(
                      "flex h-11 w-full items-center justify-center rounded-xl transition-all",
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                    )}>
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            // --- 2. EXPANDED RENDER (Full Sidebar) ---
            return (
              <div key={item.id} className="w-full">
                {hasChildren ? (
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive ? "text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive && "text-primary")} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )}

                {/* Sub-items (Accordion style) */}
                {hasChildren && isOpen && (
                  <div className="mt-1 ml-4 space-y-1 border-l border-border/50 pl-4 animate-in slide-in-from-top-1 duration-200">
                    {item.children?.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                          location.pathname === child.path ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        {child.icon && <child.icon className="h-3.5 w-3.5" />}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </TooltipProvider>
  )
}

export default AppSidebar
