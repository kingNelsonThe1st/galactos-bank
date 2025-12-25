"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconInnerShadowTop,
  IconReport,
  IconHelpCircle,
  IconUsers,
  IconCoins,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Admin navigation
const adminData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
  ],
  documents: [
    {
      name: "Withdrawals",
      url: "/admin/withdrawals",
      icon: IconDatabase,
    },
    {
      name: "Deposits",
      url: "/admin/deposits",
      icon: IconReport,
    },
    {
      name: "Pending Txns",
      url: "/admin/transactions/pending",
      icon: IconReport,
    },
    {
      name: "Transfers",
      url: "/admin/transfers",
      icon: IconFileWord,
    },

    {
      name: "Pending Loans",
      url: "/admin/pending-loans",
      icon: IconCoins,
    },
  ],
}

// User navigation
const userData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/user",
      icon: IconDashboard,
    },
    {
      title: "My Account",
      url: "/user/profile",
      icon: IconUsers,
    },
    {
      title: "Transactions",
      url: "/user/transactions",
      icon: IconChartBar,
    },
  ],
  documents: [
    {
      name: "My Deposits",
      url: "/user/transactions",
      icon: IconReport,
    },
    
    {
      name: "My Withdrawals",
      url: "/user/transactions",
      icon: IconDatabase,
    },

    {
      name: "Loans",
      url: "/user/loans",
      icon: IconCoins,
    },
  ],
}

const navSecondary = [
  {
    title: "Support",
    url: "mailto:help.galactostrustbacorp@gmail.com?subject=Support Request - GalactosTrust Bank",
    icon: IconHelpCircle,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar?: string
    role: "ADMIN" | "USER"
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // Choose navigation based on user role
  const data = user.role === "ADMIN" ? adminData : userData

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href={user.role === "ADMIN" ? "/admin" : "/dashboard"}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  GalactosTrust Inc.
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ ...user, avatar: user.avatar ?? "" }} />
      </SidebarFooter>
    </Sidebar>
  )
}