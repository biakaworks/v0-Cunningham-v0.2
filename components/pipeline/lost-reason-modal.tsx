"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LOSS_REASONS } from "@/types/pipeline"

interface LostReasonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}

export function LostReasonModal({ open, onOpenChange, onConfirm }: LostReasonModalProps) {
  const [reason, setReason] = useState("")
  const [otherReason, setOtherReason] = useState("")

  const handleConfirm = () => {
    const finalReason = reason === "Other" ? otherReason : reason
    if (finalReason) {
      onConfirm(finalReason)
      setReason("")
      setOtherReason("")
    }
  }

  const handleCancel = () => {
    setReason("")
    setOtherReason("")
    onOpenChange(false)
  }

  const isValid = reason && (reason !== "Other" || otherReason.trim().length > 0)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark Proposal as Lost</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for losing this proposal. This information helps improve future sales efforts.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="loss-reason">Loss Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="loss-reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {LOSS_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="other-reason">Please specify</Label>
              <Textarea
                id="other-reason"
                placeholder="Enter the reason..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid} variant="destructive">
            Mark as Lost
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
