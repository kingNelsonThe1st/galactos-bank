"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft, AlertCircle } from "lucide-react"

export default function IMFVerificationPage() {
  const router = useRouter()
  const [imfCode, setImfCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleVerifyCode = async () => {
    // Validate input (4 digits)
    if (!imfCode || imfCode.length !== 4) {
      setError('Please enter the 4-digit IMF code')
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/user/verify-imf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imfCode })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid IMF code')
        setLoading(false)
        return
      }

      // Code verified successfully!
      console.log('IMF Verified! Now completing the transfer...')
      
      // Get the transfer data that was stored (includes PIN)
      const transferDataStr = sessionStorage.getItem('transferData')
      
      if (!transferDataStr) {
        setError('Transfer data not found. Please try again.')
        setLoading(false)
        return
      }

      const transferData = JSON.parse(transferDataStr)
      console.log("Transfer data being sent:", transferData)
      
      // ✅ FIXED: Now retry the transfer with ALL fields including recipientName and bankName
      const transferResponse = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverAccountNumber: transferData.receiverAccountNumber,
          amount: transferData.amount,
          description: transferData.description,
          recipientName: transferData.recipientName, // ✅ NOW INCLUDED
          bankName: transferData.bankName,           // ✅ NOW INCLUDED
          pin: transferData.pin, // Use the saved PIN
          imfVerified: true // Tell API that IMF is verified
        })
      })

      const transferResult = await transferResponse.json()
      console.log("Transfer result:", transferResult)

      if (!transferResponse.ok) {
        setError(transferResult.error || 'Transfer failed. Please try again.')
        setLoading(false)
        return
      }

      // Transfer successful! Store result and redirect to success page
      sessionStorage.setItem('transferResult', JSON.stringify(transferResult))
      sessionStorage.setItem('imfVerified', 'true')
      
      console.log('Transfer completed! Redirecting to success page...')
      
      // Now redirect to success page
      router.push('/user/transfer/transfer-sucess')
      
    } catch (err) {
      console.error('Error:', err)
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, max 4 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setImfCode(value)
    setError("") // Clear error on input
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 p-4 lg:p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
          <ShieldAlert className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">IMF Verification Required</h1>
        <p className="mt-2 text-muted-foreground">
          Your account requires IMF code verification to complete this transaction
        </p>
      </div>

      <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Account Restricted
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Due to security measures, your account requires an IMF (International Monetary Fund) 
                verification code to proceed with transfers. Please contact your admin support at help.galactostrustbacorp@gmail.com to obtain this code.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter IMF Code</CardTitle>
          <CardDescription>
            Enter the 4-digit code provided by your administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="imfCode">IMF Verification Code</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-lg">
                IMF-
              </div>
              <Input
                id="imfCode"
                type="text"
                placeholder="0000"
                maxLength={4}
                value={imfCode}
                onChange={handleInputChange}
                className="pl-16 text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter only the 4 digits (e.g., if code is IMF-8798, enter 8798)
            </p>
          </div>

          <Button
            onClick={handleVerifyCode}
            disabled={loading || imfCode.length !== 4}
            className="w-full"
            size="lg"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => router.push('/user/transfer')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel Transfer
        </Button>
      </div>

      <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                How to get your IMF code:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>Contact your bank support for IMF enquiry</li>
                <li>Support email at support.galactostrustbacorp@gmail.com</li>
                <li>Or navigate to menubar and click on support.</li>
                <li>Enter the 4-digit number portion only</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-300 bg-gray-50 dark:bg-gray-900">
        <CardContent className="pt-6">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <strong>Security Notice:</strong> Never share your account credentials. 
            GalactosTrust staff will provide the IMF code but will never ask for your password.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}