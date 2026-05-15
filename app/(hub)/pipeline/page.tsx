"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { KanbanBoard, NewProposalDialog } from "@/components/pipeline"
import { mockPipelineProposals, getPipelineSummary } from "@/lib/mock-pipeline"
import { updateProposalStatus } from "@/lib/actions/proposals"
import { toast } from "sonner"
import type { TypeFilter } from "@/types/pipeline"
import type { ProposalStatus } from "@/types/cunningham"
import { cn } from "@/lib/utils"

// Get unique owners from proposals
const getOwners = () => {
  const ownerMap = new Map<string, { name: string; initials: string }>()
  mockPipelineProposals.forEach((p) => {
    if (!ownerMap.has(p.owner)) {
      const initials = p.owner_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
      ownerMap.set(p.owner, { name: p.owner_name, initials })
    }
  })
  return Array.from(ownerMap.entries()).map(([id, data]) => ({ id, ...data }))
}

export default function PipelinePage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [selectedOwners, setSelectedOwners] = useState<string[]>([])
  const [staleOnly, setStaleOnly] = useState(false)
  const [newProposalOpen, setNewProposalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const summary = getPipelineSummary()
  const owners = getOwners()

  const handleStatusChange = async (
    proposalId: string,
    newStatus: ProposalStatus,
    metadata?: Record<string, unknown>
  ) => {
    startTransition(async () => {
      const result = await updateProposalStatus(proposalId, newStatus, metadata)
      
      if (result.success) {
        toast.success("Status Updated", {
          description: result.message || `Proposal moved to ${newStatus}`,
        })
      } else {
        toast.error("Error", {
          description: result.error || "Failed to update status",
        })
      }
    })
  }

  const toggleOwner = (ownerId: string) => {
    setSelectedOwners((prev) =>
      prev.includes(ownerId)
        ? prev.filter((id) => id !== ownerId)
        : [...prev, ownerId]
    )
  }

  // Filter proposals
  const filteredProposals = mockPipelineProposals.filter((p) => {
    // Type filter
    if (typeFilter === "engineered" && p.proposal_type !== "Engineered Spec") return false
    if (typeFilter === "negotiated" && p.proposal_type !== "Negotiated") return false
    
    // Owner filter
    if (selectedOwners.length > 0 && !selectedOwners.includes(p.owner)) return false
    
    // Stale filter
    if (staleOnly && !p.is_stale) return false
    
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {summary.totalActive} active projects{" "}
            <span className="text-foreground font-medium">
              {summary.totalValue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                notation: "compact",
                maximumFractionDigits: 0,
              })} in flight
            </span>
            {summary.staleCount > 0 && (
              <Badge variant="outline" className="ml-2 border-yellow-400 bg-yellow-50 text-yellow-700">
                {summary.staleCount} stale
              </Badge>
            )}
          </p>
        </div>
        <Button onClick={() => setNewProposalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Lead
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Type Filter */}
        <ToggleGroup
          type="single"
          value={typeFilter}
          onValueChange={(v) => v && setTypeFilter(v as TypeFilter)}
          className="justify-start"
        >
          <ToggleGroupItem value="negotiated" aria-label="Negotiated" className="text-sm">
            Negotiated
          </ToggleGroupItem>
          <ToggleGroupItem value="engineered" aria-label="Engineered specs" className="text-sm">
            Eng-Spec
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Owner Avatars */}
        <div className="flex items-center gap-1">
          {owners.map((owner) => (
            <button
              key={owner.id}
              onClick={() => toggleOwner(owner.id)}
              className={cn(
                "relative rounded-full transition-all",
                selectedOwners.includes(owner.id)
                  ? "ring-2 ring-primary ring-offset-2"
                  : "opacity-60 hover:opacity-100"
              )}
              title={owner.name}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-xs font-medium">
                  {owner.initials}
                </AvatarFallback>
              </Avatar>
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Stale Only Toggle */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={staleOnly}
            onCheckedChange={(checked) => setStaleOnly(checked === true)}
          />
          <span className="text-muted-foreground">Stale only</span>
        </label>

        {/* Clear filters */}
        {(typeFilter !== "all" || selectedOwners.length > 0 || staleOnly) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter("all")
              setSelectedOwners([])
              setStaleOnly(false)
            }}
            className="text-xs text-muted-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        proposals={filteredProposals}
        typeFilter={typeFilter}
        onStatusChange={handleStatusChange}
      />

      {/* New Proposal Dialog */}
      <NewProposalDialog
        open={newProposalOpen}
        onOpenChange={setNewProposalOpen}
      />
    </div>
  )
}
