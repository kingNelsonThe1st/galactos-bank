import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import ApprovalButtons from "@/components/ApprovalButtons"

export default async function AdminPendingTransactionsPage() {
  const session = await getSession()

  // Check if admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Fetch all pending transactions (transfers and deposits)
  const pendingTransactions = await prisma.transaction.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      sender: {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TRANSFER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "DEPOSIT":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "WITHDRAWAL":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className='m-5'>
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Pending Transactions</CardTitle>
          <CardDescription>
            Review and approve or reject pending transactions. Total pending: {pendingTransactions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending transactions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead className='text-center'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransactions.map((txn) => {
                  // Skip if sender is null
                  if (!txn.sender) return null;

                  const amount = parseFloat(txn.amount.toString())
                  const senderBalance = parseFloat(txn.sender.balance.toString())
                  const isTransfer = txn.type === "TRANSFER"
                  const isDeposit = txn.type === "DEPOSIT"
                  const hasSufficientBalance = isDeposit || senderBalance >= amount

                  return (
                    <TableRow key={txn.id}>
                      <TableCell>
                        <Badge variant="outline" className={getTypeColor(txn.type)}>
                          {txn.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium text-sm'>
                            {txn.sender.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {txn.sender.email}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {txn.sender.accountNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isTransfer && txn.receiverAccount ? (
                          <div>
                            <p className="text-xs text-muted-foreground">To:</p>
                            <p className="font-mono text-sm">
                              {txn.receiverAccount}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {txn.description || 'N/A'}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-mono text-xs text-muted-foreground">
                          {txn.reference}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(txn.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className={`font-semibold text-sm ${!hasSufficientBalance ? 'text-red-600' : ''}`}>
                          ${senderBalance.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                        {!hasSufficientBalance && (
                          <p className="text-xs text-red-600">Insufficient</p>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <p className={`font-semibold ${isDeposit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isDeposit ? '+' : '-'}${amount.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                      </TableCell>
                      <TableCell>
                        <ApprovalButtons 
                          transactionId={txn.id} 
                          hasSufficientBalance={hasSufficientBalance}
                        />
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