import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { IconDots } from '@tabler/icons-react'
import Link from 'next/link'

export default async function UsersPage() {
  const session = await getSession()

  // Check if admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch all users (excluding admin)
  const users = await prisma.user.findMany({
    where: {
      role: "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      accountNumber: true,
      balance: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className='m-5'>
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Users Accounts</CardTitle>
          <CardDescription>
            User accounts list. Manage and edit user information. Total users: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className='text-right'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className='font-medium'>{user.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-sm">{user.accountNumber}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">
                        ${parseFloat(user.balance.toString()).toFixed(2)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{user.phone || 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell className='text-end'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <IconDots className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}/edit`} className="cursor-pointer">
                              Edit User
                            </Link>
                          </DropdownMenuItem>
                          
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}