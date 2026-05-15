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
import { Input } from "@/components/ui/input"

interface DormantRevisitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (revisitDate: string) => void
}

export function DormantRevisitModal({ open, onOpenChange, onConfirm }: DormantRevisitModalProps) {
  const [revisitDate, setRevisitDate] = useState("")

  // Default to 3 months from now
  const getDefaultDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 3)
    return date.toISOString().split("T")[0]
  }

  const handleConfirm = () => {
    if (revisitDate) {
      onConfirm(revisitDate)
      setRevisitDate("")
    }
  }

  const handleCancel = () => {
    setRevisitDate("")
    onOpenChange(false)
  }

  // Set default date when modal opens
  const handleOpenChange = (open: boolean) => {
    if (open && !revisitDate) {
      setRevisitDate(getDefaultDate())
    }
    onOpenChange(open)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark Proposal as Dormant</AlertDialogTitle>
          <AlertDialogDescription>
            This proposal will be moved to dormant status but retained for future revival. 
            Please set a date to revisit this opportunity.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="revisit-date">Revisit Date</Label>
            <Input
              id="revisit-date"
              type="date"
              value={revisitDate}
              onChange={(e) => setRevisitDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              You will be reminded to follow up on this proposal on the selected date.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!revisitDate}>
            Mark as Dormant
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
