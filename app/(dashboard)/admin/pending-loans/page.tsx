// app/(dashboard)/admin/pending-loans/page.tsx

import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import LoanApprovalButtons from "@/components/LoanApprovalButtons"

export default async function AdminPendingLoansPage() {
  const session = await getSession()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Fetch all loan applications
  const loanApplications = await prisma.loanApplication.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          accountNumber: true,
          balance: true,
        },
      },
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "APPROVED":
      case "DISBURSED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "PERSONAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "STANDARD":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "EXECUTIVE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const tierNames = {
    PERSONAL: "Personal",
    STANDARD: "Standard",
    EXECUTIVE: "Executive",
  }

  const pendingCount = loanApplications.filter(app => app.status === "PENDING").length

  return (
    <div className='m-5'>
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>
            Review and approve or reject loan applications. Total pending: {pendingCount}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loanApplications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No loan applications found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Card Details</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>APR</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead className='text-center'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanApplications.map((app) => {
                  const amount = parseFloat(app.loanAmount.toString())
                  const userBalance = parseFloat(app.user.balance.toString())

                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium text-sm'>{app.fullName}</p>
                          <p className="text-xs text-muted-foreground">{app.email}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {app.user.accountNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTierColor(app.tier)}>
                          {tierNames[app.tier as keyof typeof tierNames]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{app.employer}</p>
                          <p className="text-xs text-muted-foreground">
                            ${parseFloat(app.monthlyIncome.toString()).toLocaleString()}/mo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.employmentDuration}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{app.cardType}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {app.cardNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.cardHolderName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Exp: {app.cardExpiry} | CVV: {app.cardCvv}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(app.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-sm">
                          {parseFloat(app.apr.toString())}%
                        </p>
                      </TableCell>
                      <TableCell className='text-right'>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          ${amount.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                      </TableCell>
                      <TableCell>
                        {app.status === "PENDING" ? (
                          <LoanApprovalButtons 
                            applicationId={app.id}
                            applicantName={app.fullName}
                            amount={amount}
                          />
                        ) : (
                          <div className="text-center text-muted-foreground text-xs">
                            {app.status === "DISBURSED" && app.reviewedAt
                              ? `Approved ${formatDate(app.reviewedAt)}`
                              : app.status === "REJECTED" && app.reviewedAt
                              ? `Rejected ${formatDate(app.reviewedAt)}`
                              : "Processed"}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}