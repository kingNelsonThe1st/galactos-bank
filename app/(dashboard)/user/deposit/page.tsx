"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconCreditCard, IconBuildingBank } from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DepositPage() {
  const router = useRouter()
  const [isDepositing, setIsDepositing] = useState(false)
  const [error, setError] = useState("")
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    amount: ""
  })
  const [bankData, setBankData] = useState({
    accountNumber: "",
    routingNumber: "",
    amount: ""
  })

  // Fetch user balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/user/balance')
        const data = await response.json()
        
        if (response.ok) {
          setCurrentBalance(data.balance)
        } else {
          setError("Failed to load balance")
        }
      } catch {
        setError("Error loading balance")
      } finally {
        setBalanceLoading(false)
      }
    }

    fetchBalance()
  }, [])

  const handleCardDeposit = async () => {
    setError("")
    
    if (!cardData.amount || parseFloat(cardData.amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!cardData.cardNumber || !cardData.cardName || !cardData.expiryDate || !cardData.cvv) {
      setError("Please fill in all card details")
      return
    }

    setIsDepositing(true)

    try {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cardData.amount,
          method: 'Card',
          paymentDetails: `Card ending in ${cardData.cardNumber.slice(-4)}`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Deposit failed')
        setIsDepositing(false)
        return
      }

      // Store deposit result and redirect to success page
      sessionStorage.setItem("depositResult", JSON.stringify(data))
      router.push('/user/deposit/success')
    } catch {
      setError('Network error. Please try again.')
      setIsDepositing(false)
    }
  }

  const handleBankDeposit = async () => {
    setError("")
    
    if (!bankData.amount || parseFloat(bankData.amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!bankData.accountNumber || !bankData.routingNumber) {
      setError("Please fill in all bank details")
      return
    }

    setIsDepositing(true)

    try {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bankData.amount,
          method: 'Bank Transfer',
          paymentDetails: `Account: ${bankData.accountNumber}`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Deposit failed')
        setIsDepositing(false)
        return
      }

      // Store deposit result and redirect to success page
      sessionStorage.setItem("depositResult", JSON.stringify(data))
      router.push('/user/deposit/success')
    } catch {
      setError('Network error. Please try again.')
      setIsDepositing(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-muted-foreground">
          Add money to your account
        </p>
      </div>

      {error && (
        <Alert className="border-red-600 bg-red-50 dark:bg-red-950">
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
          <CardDescription className="text-2xl font-bold text-foreground">
            {balanceLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : currentBalance !== null ? (
              `$${currentBalance.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`
            ) : (
              <span className="text-destructive">Error loading balance</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="card" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card">
            <IconCreditCard className="mr-2 h-4 w-4" />
            Card
          </TabsTrigger>
          <TabsTrigger value="bank">
            <IconBuildingBank className="mr-2 h-4 w-4" />
            Bank Transfer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="card">
          <Card>
            <CardHeader>
              <CardTitle>Debit/Credit Card</CardTitle>
              <CardDescription>
                Enter your card details to deposit funds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '') })}
                  maxLength={16}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardData.cardName}
                  onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={3}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardAmount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="cardAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={cardData.amount}
                    onChange={(e) => setCardData({ ...cardData, amount: e.target.value })}
                  />
                </div>
              </div>

              <Button
                onClick={handleCardDeposit}
                className="w-full"
                disabled={isDepositing}
              >
                {isDepositing ? "Processing..." : "Submit Deposit Request"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Transfer</CardTitle>
              <CardDescription>
                Link your bank account for deposits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  placeholder="Enter your account number"
                  value={bankData.accountNumber}
                  onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  placeholder="Enter routing number"
                  value={bankData.routingNumber}
                  onChange={(e) => setBankData({ ...bankData, routingNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAmount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="bankAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={bankData.amount}
                    onChange={(e) => setBankData({ ...bankData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Deposits require admin approval and may take 1-3 business days to process
                </p>
              </div>

              <Button
                onClick={handleBankDeposit}
                className="w-full"
                disabled={isDepositing}
              >
                {isDepositing ? "Processing..." : "Submit Deposit Request"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Approval Required:</strong> All deposit requests must be reviewed and approved by an administrator. 
            You will be notified once your deposit is processed.
          </p>
        </CardContent>
      </Card>

      <Card className="border-gray-300 bg-gray-50 dark:bg-gray-900">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Secure Transactions:</strong> All deposits are encrypted and processed securely. 
            Your financial information is protected with bank-level security.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}