import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SiteHeaderProps {
  userName?: string
  userRole?: string
  profilePicture?: string | null
}

export function SiteHeader({ userName, userRole, profilePicture }: SiteHeaderProps) {
  const greeting = userRole === "ADMIN" 
    ? "Hi, Administrator" 
    : `Hi, ${userName || 'User'}`

  // Get initials from userName
  const initials = userName
    ? userName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{greeting}</h1>
        <div className="ml-auto flex items-center gap-3">
          {userRole !== "ADMIN" && (
            <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
              <a
                href="https://galactostrust.com"
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground"
              >
                GalactosTrust Inc.
              </a>
            </Button>
          )}
          
          <Avatar className="h-8 w-8">
            <AvatarImage src={profilePicture || undefined} alt={userName || "User"} />
            <AvatarFallback className="text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}