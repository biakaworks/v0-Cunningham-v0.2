"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import { Kanban, Table2, Map, Plus } from "lucide-react"
import { KanbanBoard, PipelineTable, PipelineMap, NewProposalDialog } from "@/components/pipeline"
import { mockPipelineProposals, getPipelineSummary } from "@/lib/mock-pipeline"
import { updateProposalStatus } from "@/lib/actions/proposals"
import { toast } from "sonner"
import type { ViewMode, TypeFilter } from "@/types/pipeline"
import type { ProposalStatus } from "@/types/cunningham"

export default function PipelinePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [newProposalOpen, setNewProposalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const summary = getPipelineSummary()

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {summary.totalActive} active proposals worth{" "}
            {summary.totalValue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
            {summary.staleCount > 0 && (
              <span className="ml-2 text-yellow-600">
                ({summary.staleCount} stale)
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setNewProposalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Proposal
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Type Filter */}
        <ToggleGroup
          type="single"
          value={typeFilter}
          onValueChange={(v) => v && setTypeFilter(v as TypeFilter)}
          className="justify-start"
        >
          <ToggleGroupItem value="all" aria-label="All proposals">
            All
            <Badge variant="secondary" className="ml-2">
              {summary.totalActive}
            </Badge>
          </ToggleGroupItem>
          <ToggleGroupItem value="engineered" aria-label="Engineered specs">
            Engineered
            <Badge variant="secondary" className="ml-2">
              {summary.engineeredCount}
            </Badge>
          </ToggleGroupItem>
          <ToggleGroupItem value="negotiated" aria-label="Negotiated">
            Negotiated
            <Badge variant="secondary" className="ml-2">
              {summary.negotiatedCount}
            </Badge>
          </ToggleGroupItem>
        </ToggleGroup>

        {/* View Toggle */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as ViewMode)}
        >
          <ToggleGroupItem value="kanban" aria-label="Kanban view">
            <Kanban className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <Table2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="map" aria-label="Map view">
            <Map className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* View Content */}
      {viewMode === "kanban" && (
        <KanbanBoard
          proposals={mockPipelineProposals}
          typeFilter={typeFilter}
          onStatusChange={handleStatusChange}
        />
      )}

      {viewMode === "table" && (
        <PipelineTable
          proposals={mockPipelineProposals}
          typeFilter={typeFilter}
        />
      )}

      {viewMode === "map" && (
        <PipelineMap
          proposals={mockPipelineProposals}
          typeFilter={typeFilter}
        />
      )}

      {/* New Proposal Dialog */}
      <NewProposalDialog
        open={newProposalOpen}
        onOpenChange={setNewProposalOpen}
      />
    </div>
  )
}
