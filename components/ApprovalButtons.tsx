"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface ApprovalButtonsProps {
  transactionId: string
  hasSufficientBalance: boolean
}

export default function ApprovalButtons({ transactionId, hasSufficientBalance }: ApprovalButtonsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAction = async (action: "APPROVE" | "FAILED") => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/transactions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          action
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API Error:", data)
        setError(data.error || `Failed to ${action.toLowerCase()}`)
        setLoading(false)
        return
      }

      // Success - refresh the page
      router.refresh()
    } catch (err) {
      console.error("Network error:", err)
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <p className="text-xs text-red-600 mr-2">{error}</p>
      )}
      <Button
        onClick={() => handleAction("FAILED")}
        variant="outline"
        size="sm"
        disabled={loading}
      >
        <X className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => handleAction("APPROVE")}
        size="sm"
        disabled={loading || !hasSufficientBalance}
        className="bg-green-600 hover:bg-green-700"
      >
        <Check className="h-4 w-4" />
      </Button>
    </div>
  )
}