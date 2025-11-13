import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { ReactNode } from "react"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Fetch fresh user data including profile picture
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      role: true,
      profilePicture: true, // Fetch the profile picture
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      />
      <SidebarInset>
        <SiteHeader 
          userName={user.name} 
          userRole={user.role}
          profilePicture={user.profilePicture} // Pass the profile picture
        />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}