import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import ProfilePictureUpload from "./components/ProfilePictureUpload"

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      accountNumber: true,
      balance: true,
      emailVerified: true,
      profilePicture: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  // Split name into first and last
  const nameParts = user.name.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''
  
  // Get initials
  const initials = user.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const userProfile = {
    firstName,
    lastName,
    email: user.email,
    phone: user.phone || '',
    accountNumber: user.accountNumber,
    balance: parseFloat(user.balance.toString()),
    dateJoined: new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    country: user.country || '',
    emailVerified: user.emailVerified,
    profilePicture: user.profilePicture,
    initials,
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload or update your profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilePictureUpload 
            currentPicture={userProfile.profilePicture}
            initials={userProfile.initials}
            userName={user.name}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={userProfile.firstName} 
                readOnly 
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={userProfile.lastName} 
                readOnly 
                className="bg-muted"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input 
                id="email" 
                type="email" 
                value={userProfile.email} 
                readOnly 
                className="bg-muted flex-1"
              />
              {userProfile.emailVerified ? (
                <span className="inline-flex items-center px-3 text-sm text-green-600 bg-green-50 rounded-md">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-3 text-sm text-yellow-600 bg-yellow-50 rounded-md">
                  Not Verified
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={userProfile.phone || 'Not provided'} 
              readOnly 
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input 
              id="country" 
              value={userProfile.country || 'Not provided'} 
              readOnly 
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input 
              readOnly 
              value={userProfile.accountNumber} 
              className="bg-muted font-mono" 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Current Balance</Label>
            <Input 
              readOnly 
              value={`$${userProfile.balance.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`}
              className="bg-muted font-semibold text-lg" 
            />
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <Input 
              readOnly 
              value="Digital Banking Account" 
              className="bg-muted" 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            To update your personal information, please contact support or visit your nearest branch.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 