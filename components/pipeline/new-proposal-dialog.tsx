"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react"
import { LEAD_SOURCES, type LeadSource } from "@/types/pipeline"
import type { ProposalType } from "@/types/cunningham"
import { mockCustomers, mockSites } from "@/lib/mock-data"
import { createProposal } from "@/lib/actions/proposals"

interface NewProposalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  lead_source: LeadSource | ""
  customer: string
  customer_name: string
  site: string
  site_name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  requested_work: string
  due_date: string
  proposal_type: ProposalType | ""
  urgency: "Low" | "Normal" | "High" | "Urgent" | ""
}

const STEPS = [
  { number: 1, title: "Lead Source" },
  { number: 2, title: "Customer" },
  { number: 3, title: "Site" },
  { number: 4, title: "Details" },
  { number: 5, title: "Review" },
]

export function NewProposalDialog({ open, onOpenChange }: NewProposalDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [formData, setFormData] = useState<FormData>({
    lead_source: "",
    customer: "",
    customer_name: "",
    site: "",
    site_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    requested_work: "",
    due_date: "",
    proposal_type: "",
    urgency: "",
  })

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.lead_source
      case 2:
        return !!formData.customer
      case 3:
        return !!formData.site
      case 4:
        return !!formData.requested_work && !!formData.proposal_type
      case 5:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep((s) => (s + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as Step)
    }
  }

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createProposal({
        customer: formData.customer,
        site: formData.site,
        proposal_type: formData.proposal_type as ProposalType,
        title: formData.requested_work.slice(0, 100),
        scope_of_work: formData.requested_work,
        valid_until: formData.due_date || undefined,
      })

      if (result.success && result.data) {
        onOpenChange(false)
        resetForm()
        router.push(`/proposals/${result.data.name}`)
      }
    })
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFormData({
      lead_source: "",
      customer: "",
      customer_name: "",
      site: "",
      site_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      requested_work: "",
      due_date: "",
      proposal_type: "",
      urgency: "",
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const customerSites = formData.customer
    ? mockSites.filter((s) => s.customer === formData.customer)
    : []

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Proposal</DialogTitle>
          <DialogDescription>
            Create a new proposal by following the steps below.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b pb-4">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  currentStep === step.number
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.number
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.number ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "ml-2 hidden text-sm sm:block",
                  currentStep >= step.number
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-4 h-px w-8",
                    currentStep > step.number ? "bg-green-500" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] py-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>How did this lead come in?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {LEAD_SOURCES.map((source) => (
                    <Button
                      key={source}
                      variant={formData.lead_source === source ? "default" : "outline"}
                      className="h-auto py-3"
                      onClick={() => updateField("lead_source", source)}
                    >
                      {source}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Customer</Label>
                <Select
                  value={formData.customer}
                  onValueChange={(value) => {
                    const customer = mockCustomers.find((c) => c.name === value)
                    updateField("customer", value)
                    updateField("customer_name", customer?.customer_name || "")
                    updateField("site", "")
                    updateField("site_name", "")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((customer) => (
                      <SelectItem key={customer.name} value={customer.name}>
                        {customer.customer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                <p>Need to add a new customer?</p>
                <Button variant="link" size="sm" className="mt-1">
                  + Create New Customer
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Site</Label>
                {customerSites.length > 0 ? (
                  <Select
                    value={formData.site}
                    onValueChange={(value) => {
                      const site = customerSites.find((s) => s.name === value)
                      updateField("site", value)
                      updateField("site_name", site?.site_name || "")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a site..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customerSites.map((site) => (
                        <SelectItem key={site.name} value={site.name}>
                          {site.site_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    <p>No sites found for this customer.</p>
                    <Button variant="link" size="sm" className="mt-1">
                      + Create New Site
                    </Button>
                  </div>
                )}
              </div>

              {customerSites.length > 0 && (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  <p>Need to add a new site?</p>
                  <Button variant="link" size="sm" className="mt-1">
                    + Create New Site
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requested_work">Requested Work</Label>
                <Textarea
                  id="requested_work"
                  placeholder="Describe the work being requested..."
                  value={formData.requested_work}
                  onChange={(e) => updateField("requested_work", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Proposal Type</Label>
                  <Select
                    value={formData.proposal_type}
                    onValueChange={(v) => updateField("proposal_type", v as ProposalType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Negotiated">Negotiated</SelectItem>
                      <SelectItem value="Engineered Spec">Engineered Spec</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date (optional)</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => updateField("due_date", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Urgency</Label>
                <div className="flex gap-2">
                  {(["Low", "Normal", "High", "Urgent"] as const).map((level) => (
                    <Button
                      key={level}
                      variant={formData.urgency === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateField("urgency", level)}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="font-medium">Review your proposal</h3>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lead Source</span>
                  <span className="font-medium">{formData.lead_source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{formData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Site</span>
                  <span className="font-medium">{formData.site_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline">{formData.proposal_type}</Badge>
                </div>
                {formData.due_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-medium">
                      {new Date(formData.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <span className="text-muted-foreground">Requested Work</span>
                  <p className="mt-1 text-sm">{formData.requested_work}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isPending}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          
          {currentStep < 5 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Proposal"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
