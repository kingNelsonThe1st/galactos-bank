// components/LoanApprovalButtons.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface LoanApprovalButtonsProps {
  applicationId: string
  applicantName: string
  amount: number
}

export default function LoanApprovalButtons({ 
  applicationId, 
  applicantName,
  amount 
}: LoanApprovalButtonsProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const response = await fetch("/api/admin/loan/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          action: "approve",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve loan")
      }

      toast.success("Loan approved and funds disbursed!")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to approve loan")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    setIsRejecting(true)
    try {
      const response = await fetch("/api/admin/loan/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          action: "reject",
          rejectionReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject loan")
      }

      toast.success("Loan application rejected")
      setShowRejectDialog(false)
      setRejectionReason("")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to reject loan")
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowRejectDialog(true)}
          disabled={isApproving || isRejecting}
        >
          Reject
        </Button>
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
        >
          {isApproving ? "Approving..." : "Approve"}
        </Button>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Loan Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this loan application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border bg-muted/50 p-4 text-sm">
              <p>
                <strong>Applicant:</strong> {applicantName}
              </p>
              <p>
                <strong>Amount:</strong> ${amount.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectionReason("")
              }}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isRejecting}
              variant="destructive"
            >
              {isRejecting ? "Rejecting..." : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}