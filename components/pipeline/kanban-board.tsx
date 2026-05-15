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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { PipelineProposal, TypeFilter } from "@/types/pipeline"
import type { ProposalStatus } from "@/types/cunningham"
import {
  ACTIVE_STATUSES,
  CLOSED_STATUSES,
} from "@/types/pipeline"
import { LostReasonModal } from "./lost-reason-modal"
import { DormantRevisitModal } from "./dormant-revisit-modal"
import Link from "next/link"

// Stage descriptions
const STAGE_DESCRIPTIONS: Record<ProposalStatus, string> = {
  Lead: "New inquiry, renewal trigger, or RFP captured",
  Inspection: "Field work scheduled, in progress, or report being drafted",
  Proposal: "Proposal sent to customer or bid submitted",
  Negotiation: "Customer reviewing, follow-ups in progress",
  Scheduled: "Won — on the work calendar with crews assigned",
  "In Progress": "Crews are on site executing",
  Billed: "Work complete — invoice sent to customer",
  Paid: "Payment received — project closed",
  Lost: "Did not win the work",
  Dormant: "On hold — revisit later",
}

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

  const getProposalsForStatus = (status: ProposalStatus) =>
    proposals.filter((p) => p.status === status)

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
        <div className="flex gap-3 overflow-x-auto pb-4">
          {/* Active status columns */}
          {ACTIVE_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              proposals={getProposalsForStatus(status)}
              description={STAGE_DESCRIPTIONS[status]}
            />
          ))}

          {/* Closed status columns */}
          {CLOSED_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              proposals={getProposalsForStatus(status)}
              description={STAGE_DESCRIPTIONS[status]}
              isClosedColumn
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
  description: string
  isClosedColumn?: boolean
}

function KanbanColumn({ status, proposals, description, isClosedColumn = false }: KanbanColumnProps) {
  const totalValue = proposals.reduce((sum, p) => sum + (p.total || 0), 0)

  return (
    <div
      className={cn(
        "flex-shrink-0 rounded-lg",
        isClosedColumn ? "w-52" : "w-72"
      )}
      id={status}
    >
      {/* Column Header */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-semibold">{status}</h3>
          <span className="text-sm text-muted-foreground">{proposals.length}</span>
          {!isClosedColumn && totalValue > 0 && (
            <span className="text-sm font-medium text-muted-foreground">
              {totalValue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                notation: "compact",
                maximumFractionDigits: 0,
              })}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {description}
        </p>
      </div>

      <SortableContext
        id={status}
        items={proposals.map((p) => p.name)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea className={cn(isClosedColumn ? "h-[450px]" : "h-[500px]")}>
          <div className="flex flex-col gap-2 pr-2">
            {proposals.map((proposal) => (
              <SortableProposalCard key={proposal.name} proposal={proposal} />
            ))}
            {proposals.length === 0 && (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                No items
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

  const isEngineered = proposal.proposal_type === "Engineered Spec"

  return (
    <Card
      className={cn(
        "cursor-grab transition-shadow hover:shadow-md bg-card",
        isDragging && "rotate-2 shadow-lg"
      )}
    >
      <CardContent className="p-3 space-y-2">
        {/* Type badge and price */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-normal",
              isEngineered
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-gray-50 text-gray-700"
            )}
          >
            {isEngineered ? "Eng-Spec" : "Negotiated"}
          </Badge>
          <span className="text-sm font-semibold">
            {(proposal.total || 0).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        {/* Customer name */}
        <Link
          href={`/proposals/${proposal.name}`}
          className="block text-sm font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {proposal.customer_name}
        </Link>

        {/* Tank/Site */}
        <p className="text-xs text-muted-foreground">
          {proposal.tank_name || proposal.site_name}
        </p>

        {/* Scope */}
        <p className="text-xs text-muted-foreground line-clamp-1">
          {proposal.title}
        </p>

        {/* Owner and days */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-muted text-[9px] font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {proposal.owner_name.split(" ")[0]}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {proposal.days_in_stage || proposal.age_days}d in stage
          </span>
        </div>

        {/* Stale indicator */}
        {proposal.is_stale && (
          <div className="pt-1">
            <Badge variant="outline" className="border-yellow-400 bg-yellow-50 text-yellow-700 text-[10px]">
              Stale
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
