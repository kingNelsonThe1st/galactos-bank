"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Share2, CheckCircle2, ArrowLeft, Home } from "lucide-react"

// 1. ADD BANKS ARRAY HERE
const banks = [
  { value: "chase-bank", label: "Chase Bank" },
  { value: "bank-of-america", label: "Bank of America" },
  { value: "wells-fargo", label: "Wells Fargo" },
  { value: "citibank", label: "Citibank" },
  { value: "us-bank", label: "U.S. Bank" },
  { value: "pnc-bank", label: "PNC Bank" },
  { value: "capital-one", label: "Capital One" },
  { value: "truist-bank", label: "Truist Bank" },
  { value: "td-bank", label: "TD Bank" },
  { value: "ally-bank", label: "Ally Bank" },
  { value: "barclays", label: "Barclays" },
  { value: "hsbc-uk", label: "HSBC UK" },
  { value: "lloyds-bank", label: "Lloyds Bank" },
  { value: "natwest", label: "NatWest" },
  { value: "santander-uk", label: "Santander UK" },
  { value: "tsb-bank", label: "TSB Bank" },
  { value: "monzo-bank", label: "Monzo Bank" },
  { value: "starling-bank", label: "Starling Bank" },
  { value: "metro-bank", label: "Metro Bank" },
  { value: "revolut", label: "Revolut" },
];

interface TransferResult {
  transaction: {
    reference: string;
    date: string;
    senderAccount?: string;
    receiver: string;
    receiverAccount: string;
    amount: string;
    balanceBefore: string;
    balanceAfter: string;
    bank?: string; // 2. ADD THIS IF YOUR API SENDS IT
  };
}

export default function TransactionReceiptPage() {
  const router = useRouter()
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null)
  const [recipientBank, setRecipientBank] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // 3. ADD HELPER FUNCTION HERE
  const getBankLabel = (bankValue: string): string => {
    const bank = banks.find(b => b.value === bankValue);
    return bank ? bank.label : bankValue;
  };

  useEffect(() => {
    const result = sessionStorage.getItem("transferResult")
    if (!result) {
      router.push("/dashboard/transfer")
      return
    }
    const parsedResult = JSON.parse(result)
    setTransferResult(parsedResult)

    // 4. GET BANK FROM TRANSFER DATA (stored before pin page)
    const transferData = sessionStorage.getItem("transferData")
    if (transferData) {
      const parsed = JSON.parse(transferData)
      setRecipientBank(parsed.bank || "")
    }
    
    setLoading(false)
  }, [router])

  const handleDownload = () => {
    if (!transferResult) return
    
    // Create receipt text
    const receiptText = `
TRANSACTION RECEIPT
===================
Transaction ID: ${transferResult.transaction.reference}
Date: ${new Date(transferResult.transaction.date).toLocaleString()}
Type: Transfer

SENDER INFORMATION
Account: ${transferResult.transaction.senderAccount || 'Your Account'}

RECIPIENT INFORMATION  
Name: ${transferResult.transaction.receiver}
Bank: ${recipientBank ? getBankLabel(recipientBank) : 'N/A'}
Account: ${transferResult.transaction.receiverAccount}

PAYMENT DETAILS
Amount: $${parseFloat(transferResult.transaction.amount).toFixed(2)}
Previous Balance: $${parseFloat(transferResult.transaction.balanceBefore).toFixed(2)}
New Balance: $${parseFloat(transferResult.transaction.balanceAfter).toFixed(2)}

Status: COMPLETED
    `.trim()

    // Create and download file
    const blob = new Blob([receiptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${transferResult.transaction.reference}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    if (!transferResult) return

    if (navigator.share) {
      navigator.share({
        title: 'Transaction Receipt',
        text: `Transfer of $${parseFloat(transferResult.transaction.amount).toFixed(2)} to ${transferResult.transaction.receiver} at ${recipientBank ? getBankLabel(recipientBank) : 'their bank'}. Reference: ${transferResult.transaction.reference}`,
      }).catch((err) => console.log('Share failed:', err))
    } else {
      const text = `Transfer Receipt\nAmount: $${parseFloat(transferResult.transaction.amount).toFixed(2)}\nTo: ${transferResult.transaction.receiver}\nBank: ${recipientBank ? getBankLabel(recipientBank) : 'N/A'}\nReference: ${transferResult.transaction.reference}`
      navigator.clipboard.writeText(text)
      alert('Receipt details copied to clipboard!')
    }
  }

  const handleBackToDashboard = () => {
    sessionStorage.removeItem("transferResult")
    sessionStorage.removeItem("transferData") // Clean up transfer data too
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!transferResult) {
    return null
  }

  const receiptData = {
    transactionId: transferResult.transaction.reference,
    status: "Completed",
    date: new Date(transferResult.transaction.date).toLocaleDateString(),
    time: new Date(transferResult.transaction.date).toLocaleTimeString(),
    recipient: {
      name: transferResult.transaction.receiver,
      bank: recipientBank,
      accountNumber: transferResult.transaction.receiverAccount,
    },
    amount: parseFloat(transferResult.transaction.amount),
    balanceBefore: parseFloat(transferResult.transaction.balanceBefore),
    balanceAfter: parseFloat(transferResult.transaction.balanceAfter),
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Transaction Receipt</h1>
        <p className="text-muted-foreground">
          Receipt for transaction {receiptData.transactionId}
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Transaction Details</CardTitle>
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 dark:bg-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {receiptData.status}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-sm font-medium">{receiptData.transactionId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transaction Type</p>
              <p className="font-medium">Transfer</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{receiptData.date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">{receiptData.time}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 text-lg font-semibold">Recipient Information</h3>
            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Account Name</span>
                <span className="font-medium">{receiptData.recipient.name}</span>
              </div>
              {/* 5. ADD THIS BANK DISPLAY */}
              {receiptData.recipient.bank && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bank</span>
                  <span className="font-medium">{getBankLabel(receiptData.recipient.bank)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Account Number</span>
                <span className="font-mono text-sm font-medium">{receiptData.recipient.accountNumber}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 text-lg font-semibold">Payment Details</h3>
            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transfer Amount</span>
                <span className="font-medium">${receiptData.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Fee</span>
                <span className="font-medium">$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance Before</span>
                <span className="font-medium">${receiptData.balanceBefore.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Balance After</span>
                <span className="font-bold text-primary">${receiptData.balanceAfter.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button onClick={handleBackToDashboard} className="w-full" size="lg">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-blue-800 dark:text-blue-200">
            This is an official receipt for your transaction. Keep it for your records. 
            If you have any questions, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}