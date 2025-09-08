"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Activity Logs",
      url: "/dashboard/activity-logs",
    },
    {
      title: "Pre Production",
      url: "/dashboard/pre-production",
    },
    {
      title: "Conrod Assembly",
      url: "/dashboard/conrod-assembly",
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
    },
    {
      title: "Billing History",
      url: "/dashboard/billing-history",
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
    },
    {
      title: "Database",
      url: "/dashboard/database",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
        <SidebarMenuItem>
            <div className="flex items-center justify-center py-1">
              <Image src="/image.png" alt="logo" width={100} height={90} />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
