import type { ComponentType, SVGProps } from "react"

export type NavigationItem = {
  label: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  roles: string[]
}

export type NavigationSection = {
  title: string
  items: NavigationItem[]
}
