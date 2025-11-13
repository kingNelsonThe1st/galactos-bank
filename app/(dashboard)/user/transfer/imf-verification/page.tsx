"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Mail, Clock, ArrowLeft } from "lucide-react"

export default function IMFVerificationPage() {
  const router = useRouter()
  const [imfCode, setImfCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sendingCode, setSendingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds

  useEffect(() => {
    // Start countdown
    if (codeSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [codeSent, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRequestCode = async () => {
    setSendingCode(true)
    setError("")

    try {
      const response = await fetch('/api/user/generate-imf', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send code')
        setSendingCode(false)
        return
      }

      setCodeSent(true)
      setTimeLeft(900) // Reset timer
      setSendingCode(false)
    } catch {
      setError('Network error. Please try again.')
      setSendingCode(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!imfCode || imfCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
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
        setError(data.error || 'Invalid code')
        setLoading(false)
        return
      }

      // Code verified successfully - proceed with transfer
      // Store verification success in sessionStorage
      sessionStorage.setItem('imfVerified', 'true')
      
      // Redirect back to PIN page to complete transfer
      router.push('/user/transfer/transfer-sucess')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 p-4 lg:p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
          <ShieldAlert className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">IMF Verification Required</h1>
        <p className="mt-2 text-muted-foreground">
          Your account requires additional verification to complete this transaction
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
                Due to security measures, your account requires IMF (International Monetary Fund) 
                verification code to proceed with transfers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!codeSent ? (
        <Card>
          <CardHeader>
            <CardTitle>Request Verification Code</CardTitle>
            <CardDescription>
              We send a 6-digit code to your registered email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRequestCode}
              className="w-full"
              disabled={sendingCode}
            >
              <Mail className="mr-2 h-4 w-4" />
              {sendingCode ? "Sending..." : "Send IMF Code to Email"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>
              Check your email for the 6-digit IMF code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Code expires in: <strong>{formatTime(timeLeft)}</strong>
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imfCode">IMF Verification Code</Label>
              <Input
                id="imfCode"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={imfCode}
                onChange={(e) => setImfCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRequestCode}
                disabled={sendingCode || timeLeft > 0}
                className="flex-1"
              >
                {sendingCode ? "Sending..." : "Resend Code"}
              </Button>
              <Button
                onClick={handleVerifyCode}
                disabled={loading || imfCode.length !== 6}
                className="flex-1"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => router.push('/user/transfer')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel Transfer
        </Button>
      </div>

      <Card className="border-gray-300 bg-gray-50 dark:bg-gray-900">
        <CardContent className="pt-6">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <strong>Security Notice:</strong> Never share your IMF code with anyone. 
            GalactosTrust staff will never ask for this code.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}