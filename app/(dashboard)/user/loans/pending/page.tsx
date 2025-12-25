// app/(dashboard)/user/loans/pending/page.tsx

import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock, CheckCircle, XCircle, Banknote } from "lucide-react"

export default async function LoanPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect("/login")
  }

  const params = await searchParams
  const applicationId = params.id

  if (!applicationId) {
    redirect("/user/loans")
  }

  const application = await prisma.loanApplication.findUnique({
    where: { id: applicationId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          accountNumber: true,
        },
      },
    },
  })

  if (!application || application.userId !== session.user.id) {
    redirect("/user/loans")
  }

  const statusConfig = {
    PENDING: {
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      title: "Application Under Review",
      description:
        "Your loan application has been submitted successfully and is currently being reviewed by our team. We'll notify you via email once a decision has been made.",
    },
    APPROVED: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      borderColor: "border-green-200 dark:border-green-800",
      title: "Application Approved!",
      description:
        "Congratulations! Your loan application has been approved. The funds will be credited to your account shortly.",
    },
    REJECTED: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      borderColor: "border-red-200 dark:border-red-800",
      title: "Application Rejected",
      description:
        application.rejectionReason ||
        "Unfortunately, your loan application was not approved at this time.",
    },
    DISBURSED: {
      icon: Banknote,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-200 dark:border-blue-800",
      title: "Funds Disbursed",
      description:
        "The loan amount has been successfully credited to your account. You can now access the funds.",
    },
  }

  const currentStatus = statusConfig[application.status]
  const StatusIcon = currentStatus.icon

  const tierNames = {
    PERSONAL: "Personal Plan",
    STANDARD: "Standard Plan",
    EXECUTIVE: "Executive Plan",
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      DISBURSED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    }

    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Status Card */}
      <Card className={`${currentStatus.borderColor} border-2`}>
        <CardContent className={`${currentStatus.bgColor} p-8 text-center`}>
          <StatusIcon className={`mx-auto h-16 w-16 ${currentStatus.color}`} />
          <h1 className="mt-4 font-bold text-2xl">{currentStatus.title}</h1>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            {currentStatus.description}
          </p>
        </CardContent>
      </Card>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>
                Review your loan application information
              </CardDescription>
            </div>
            {getStatusBadge(application.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-sm">Application ID</p>
              <p className="font-mono text-sm">{application.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Loan Tier</p>
              <p className="font-medium">{tierNames[application.tier]}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">APR</p>
              <p className="font-medium">{parseFloat(application.apr.toString())}%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Loan Amount</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                ${parseFloat(application.loanAmount.toString()).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Applied On</p>
              <p className="font-medium">{formatDate(application.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Payment Type</p>
              <p className="font-medium">{application.paymentType}</p>
            </div>
          </div>

          {/* Timeline */}
          {(application.reviewedAt || application.disbursedAt) && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="mb-2 font-medium text-sm">Timeline</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{formatDate(application.createdAt)}</span>
                </div>
                {application.reviewedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reviewed</span>
                    <span>{formatDate(application.reviewedAt)}</span>
                  </div>
                )}
                {application.disbursedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Disbursed</span>
                    <span>{formatDate(application.disbursedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction Reference */}
          {application.status === "DISBURSED" && application.transactionRef && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="mb-1 font-medium text-sm">Transaction Reference</p>
              <p className="font-mono text-sm">{application.transactionRef}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {application.status === "REJECTED" && application.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <p className="mb-1 font-medium text-sm">Rejection Reason</p>
              <p className="text-sm">{application.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="flex-1" variant="outline">
          <Link href="/user">Go to Dashboard</Link>
        </Button>
        {application.status === "PENDING" && (
          <Button asChild className="flex-1" variant="outline">
            <Link href="/user/loans">View Loan Tiers</Link>
          </Button>
        )}
        {application.status === "REJECTED" && (
          <Button asChild className="flex-1">
            <Link href="/user/loans">Apply Again</Link>
          </Button>
        )}
        {application.status === "DISBURSED" && (
          <Button asChild className="flex-1">
            <Link href="/user/transactions">View Transactions</Link>
          </Button>
        )}
      </div>
    </div>
  )
}