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

export interface ProjectData {
  budgetId?: number
  projectnumber: string
  projectname: string
  project_category?: string
  sub_category?: string
  product_no?: string
  last_update_date?: string
  [key: string]: any
}
