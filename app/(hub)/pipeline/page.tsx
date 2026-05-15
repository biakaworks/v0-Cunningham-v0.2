"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, LayoutGrid, Table2, Settings, Clock } from "lucide-react"
import { KanbanBoard, NewProposalDialog } from "@/components/pipeline"
import { mockPipelineProposals, pipelineOwners, getPipelineSummary } from "@/lib/mock-pipeline"
import { updateProposalStatus } from "@/lib/actions/proposals"
import { toast } from "sonner"
import type { TypeFilter, PipelineStatus } from "@/types/pipeline"
import { cn } from "@/lib/utils"

export default function PipelinePage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [selectedOwners, setSelectedOwners] = useState<string[]>([])
  const [staleOnly, setStaleOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newProposalOpen, setNewProposalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const summary = getPipelineSummary()

  const handleStatusChange = async (
    proposalId: string,
    newStatus: PipelineStatus,
    metadata?: Record<string, unknown>
  ) => {
    startTransition(async () => {
      const result = await updateProposalStatus(proposalId, newStatus as string, metadata)
      
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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchable = [
        p.customer_name,
        p.site_name,
        p.tank_name,
        p.title,
        p.scope_summary,
      ].filter(Boolean).join(" ").toLowerCase()
      if (!searchable.includes(query)) return false
    }
    
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pipeline</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
            <span>{summary.totalActive} active projects</span>
            <span>·</span>
            <span className="font-medium text-foreground">
              {summary.totalValue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                notation: "compact",
                maximumFractionDigits: 0,
              })} in flight
            </span>
            {summary.staleCount > 0 && (
              <>
                <Clock className="h-3.5 w-3.5 text-red-500 ml-1" />
                <span className="text-red-500">{summary.staleCount} stale</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewProposalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="mr-1.5 h-4 w-4" />
            New Lead
          </Button>
          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-r-none bg-muted">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-l">
              <Table2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-l-none border-l">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 pb-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-40 h-9"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTypeFilter(typeFilter === "negotiated" ? "all" : "negotiated")}
            className={cn(
              "h-9 px-3 rounded-md",
              typeFilter === "negotiated" && "bg-muted border-primary"
            )}
          >
            Negotiated
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTypeFilter(typeFilter === "engineered" ? "all" : "engineered")}
            className={cn(
              "h-9 px-3 rounded-md",
              typeFilter === "engineered" && "bg-muted border-primary"
            )}
          >
            Eng-Spec
          </Button>
        </div>

        {/* Owner Avatar Pills */}
        <div className="flex items-center gap-1">
          {pipelineOwners.map((owner) => (
            <button
              key={owner.id}
              onClick={() => toggleOwner(owner.id)}
              className={cn(
                "flex items-center gap-1.5 h-9 px-2 pr-3 rounded-full border transition-all",
                selectedOwners.includes(owner.id)
                  ? "bg-muted border-primary"
                  : "bg-background border-border hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                owner.id === 'ron' && "bg-gray-200 text-gray-700",
                owner.id === 'joshua' && "bg-orange-100 text-orange-700",
                owner.id === 'mike' && "bg-blue-100 text-blue-700",
                owner.id === 'curtis' && "bg-green-100 text-green-700",
              )}>
                {owner.initials[0]}
              </div>
              <span className="text-sm">{owner.name}</span>
            </button>
          ))}
        </div>

        {/* Stale Only Toggle */}
        <div className="flex items-center gap-2 ml-2">
          <Switch
            id="stale-only"
            checked={staleOnly}
            onCheckedChange={setStaleOnly}
          />
          <label htmlFor="stale-only" className="text-sm text-muted-foreground cursor-pointer">
            Stale only
          </label>
        </div>

        {/* Clear filters */}
        {(typeFilter !== "all" || selectedOwners.length > 0 || staleOnly || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter("all")
              setSelectedOwners([])
              setStaleOnly(false)
              setSearchQuery("")
            }}
            className="text-xs text-muted-foreground h-9"
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
