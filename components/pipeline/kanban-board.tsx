"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { PipelineProposal, TypeFilter } from "@/types/pipeline"
import type { ProposalStatus } from "@/types/cunningham"
import {
  PROPOSAL_STATUSES,
  ACTIVE_STATUSES,
  CLOSED_STATUSES,
  STATUS_DOT_COLORS,
  TYPE_COLORS,
} from "@/types/pipeline"
import { LostReasonModal } from "./lost-reason-modal"
import { DormantRevisitModal } from "./dormant-revisit-modal"
import Link from "next/link"

interface KanbanBoardProps {
  proposals: PipelineProposal[]
  typeFilter: TypeFilter
  onStatusChange: (proposalId: string, newStatus: ProposalStatus, metadata?: Record<string, unknown>) => Promise<void>
}

export function KanbanBoard({ proposals, typeFilter, onStatusChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [lostModalOpen, setLostModalOpen] = useState(false)
  const [dormantModalOpen, setDormantModalOpen] = useState(false)
  const [pendingDrop, setPendingDrop] = useState<{ proposalId: string; newStatus: ProposalStatus } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const filteredProposals = proposals.filter((p) => {
    if (typeFilter === "all") return true
    if (typeFilter === "engineered") return p.proposal_type === "Engineered Spec"
    if (typeFilter === "negotiated") return p.proposal_type === "Negotiated"
    return true
  })

  const getProposalsForStatus = (status: ProposalStatus) =>
    filteredProposals.filter((p) => p.status === status)

  const activeProposal = activeId
    ? proposals.find((p) => p.name === activeId)
    : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const proposalId = active.id as string
    const newStatus = over.id as ProposalStatus

    const proposal = proposals.find((p) => p.name === proposalId)
    if (!proposal || proposal.status === newStatus) return

    // Handle special transitions
    if (newStatus === "Lost") {
      setPendingDrop({ proposalId, newStatus })
      setLostModalOpen(true)
      return
    }

    if (newStatus === "Dormant") {
      setPendingDrop({ proposalId, newStatus })
      setDormantModalOpen(true)
      return
    }

    // Regular transition
    await onStatusChange(proposalId, newStatus)
  }

  const handleLostConfirm = async (reason: string) => {
    if (pendingDrop) {
      await onStatusChange(pendingDrop.proposalId, "Lost", { lost_reason: reason })
    }
    setLostModalOpen(false)
    setPendingDrop(null)
  }

  const handleDormantConfirm = async (revisitDate: string) => {
    if (pendingDrop) {
      await onStatusChange(pendingDrop.proposalId, "Dormant", { revisit_date: revisitDate })
    }
    setDormantModalOpen(false)
    setPendingDrop(null)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Active status columns */}
          {ACTIVE_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              proposals={getProposalsForStatus(status)}
              isClosedColumn={false}
            />
          ))}

          {/* Closed status columns - narrower */}
          {CLOSED_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              proposals={getProposalsForStatus(status)}
              isClosedColumn={true}
            />
          ))}
        </div>

        <DragOverlay>
          {activeProposal ? (
            <ProposalCard proposal={activeProposal} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      <LostReasonModal
        open={lostModalOpen}
        onOpenChange={setLostModalOpen}
        onConfirm={handleLostConfirm}
      />

      <DormantRevisitModal
        open={dormantModalOpen}
        onOpenChange={setDormantModalOpen}
        onConfirm={handleDormantConfirm}
      />
    </>
  )
}

interface KanbanColumnProps {
  status: ProposalStatus
  proposals: PipelineProposal[]
  isClosedColumn: boolean
}

function KanbanColumn({ status, proposals, isClosedColumn }: KanbanColumnProps) {
  const totalValue = proposals.reduce((sum, p) => sum + (p.total || 0), 0)

  return (
    <div
      className={cn(
        "flex-shrink-0 rounded-lg bg-muted/50",
        isClosedColumn ? "w-56" : "w-72"
      )}
    >
      <div className="sticky top-0 bg-muted/50 p-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT_COLORS[status])} />
            <h3 className="text-sm font-medium">{status}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {proposals.length}
          </Badge>
        </div>
        {!isClosedColumn && totalValue > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {totalValue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </p>
        )}
      </div>

      <SortableContext
        id={status}
        items={proposals.map((p) => p.name)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea className={cn("px-2 pb-2", isClosedColumn ? "h-[400px]" : "h-[500px]")}>
          <div className="flex flex-col gap-2 pt-1" id={status}>
            {proposals.map((proposal) => (
              <SortableProposalCard key={proposal.name} proposal={proposal} />
            ))}
            {proposals.length === 0 && (
              <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                No proposals
              </div>
            )}
          </div>
        </ScrollArea>
      </SortableContext>
    </div>
  )
}

function SortableProposalCard({ proposal }: { proposal: PipelineProposal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: proposal.name })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(isDragging && "opacity-50")}
    >
      <ProposalCard proposal={proposal} />
    </div>
  )
}

function ProposalCard({
  proposal,
  isDragging = false,
}: {
  proposal: PipelineProposal
  isDragging?: boolean
}) {
  const initials = proposal.owner_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card
      className={cn(
        "cursor-grab transition-shadow hover:shadow-md",
        isDragging && "rotate-3 shadow-lg"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/proposals/${proposal.name}`}
              className="text-sm font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {proposal.customer_name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {proposal.site_name}
            </p>
          </div>
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-mwi-accent text-[10px] text-mwi-navy">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
          {proposal.title}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0", TYPE_COLORS[proposal.proposal_type])}
            >
              {proposal.proposal_type === "Engineered Spec" ? "Eng" : "Neg"}
            </Badge>
            {proposal.is_stale && (
              <Badge variant="outline" className="border-yellow-400 bg-yellow-50 text-[10px] text-yellow-700 px-1.5 py-0">
                Stale
              </Badge>
            )}
            {proposal.is_revived && (
              <Badge variant="outline" className="border-green-400 bg-green-50 text-[10px] text-green-700 px-1.5 py-0">
                Revived
              </Badge>
            )}
          </div>
          <span className="text-sm font-semibold">
            {(proposal.total || 0).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{proposal.age_days}d old</span>
          {proposal.next_follow_up_date && (
            <span>
              Follow-up: {new Date(proposal.next_follow_up_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
