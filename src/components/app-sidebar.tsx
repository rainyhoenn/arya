"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard" style={{ width: "100%", height: "120px!important",}}>
                <Image
                  src="/image.png"
                  alt="logo"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
