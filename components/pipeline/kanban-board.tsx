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
import { ScrollArea } from "@/components/ui/scroll-area"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PipelineProposal, TypeFilter, PipelineStatus } from "@/types/pipeline"
import { ACTIVE_STATUSES, STAGE_DESCRIPTIONS } from "@/types/pipeline"
import { LostReasonModal } from "./lost-reason-modal"
import { DormantRevisitModal } from "./dormant-revisit-modal"
import Link from "next/link"

interface KanbanBoardProps {
  proposals: PipelineProposal[]
  typeFilter: TypeFilter
  onStatusChange: (proposalId: string, newStatus: PipelineStatus, metadata?: Record<string, unknown>) => Promise<void>
}

export function KanbanBoard({ proposals, typeFilter, onStatusChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [lostModalOpen, setLostModalOpen] = useState(false)
  const [dormantModalOpen, setDormantModalOpen] = useState(false)
  const [pendingDrop, setPendingDrop] = useState<{ proposalId: string; newStatus: PipelineStatus } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const getProposalsForStatus = (status: PipelineStatus) =>
    proposals.filter((p) => p.status === status)

  const getColumnStats = (status: PipelineStatus) => {
    const statusProposals = getProposalsForStatus(status)
    return {
      count: statusProposals.length,
      value: statusProposals.reduce((sum, p) => sum + (p.total || 0), 0),
    }
  }

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
    const newStatus = over.id as PipelineStatus

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
          {ACTIVE_STATUSES.map((status) => {
            const stats = getColumnStats(status)
            return (
              <KanbanColumn
                key={status}
                status={status}
                proposals={getProposalsForStatus(status)}
                description={STAGE_DESCRIPTIONS[status]}
                count={stats.count}
                value={stats.value}
              />
            )
          })}
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
  status: PipelineStatus
  proposals: PipelineProposal[]
  description: string
  count: number
  value: number
}

function KanbanColumn({ status, proposals, description, count, value }: KanbanColumnProps) {
  const formattedValue = value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  })

  return (
    <div className="flex-shrink-0 w-[220px]" id={status}>
      {/* Column Header */}
      <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-3 py-2.5 mb-0">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{status}</h3>
          <span className="text-sm text-gray-500">{count}</span>
          {value > 0 && (
            <span className="text-sm font-medium text-gray-600">{formattedValue}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {description}
        </p>
      </div>

      <SortableContext
        id={status}
        items={proposals.map((p) => p.name)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea className="h-[calc(100vh-280px)] border-x border-b border-gray-200 rounded-b-lg bg-gray-50/50">
          <div className="flex flex-col gap-2 p-2">
            {proposals.map((proposal) => (
              <SortableProposalCard key={proposal.name} proposal={proposal} />
            ))}
            {proposals.length === 0 && (
              <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
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
      className={cn(isDragging && "opacity-50")}
    >
      <ProposalCard proposal={proposal} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

function ProposalCard({
  proposal,
  isDragging = false,
  dragHandleProps,
}: {
  proposal: PipelineProposal
  isDragging?: boolean
  dragHandleProps?: Record<string, unknown>
}) {
  const isEngineered = proposal.proposal_type === "Engineered Spec"
  const daysInStage = proposal.days_in_stage ?? proposal.age_days

  return (
    <Card
      className={cn(
        "bg-white border border-gray-200 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "rotate-2 shadow-lg"
      )}
    >
      <CardContent className="p-3 space-y-2">
        {/* Type badge, stale indicator, and price */}
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded",
              isEngineered
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            )}
          >
            {isEngineered ? "ENG-SPEC" : "NEGOTIATED"}
          </span>
          <div className="flex items-center gap-1.5">
            {proposal.is_stale && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
            {proposal.total > 0 && (
              <span className="text-sm font-semibold text-gray-900">
                {proposal.total.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                })}
              </span>
            )}
          </div>
        </div>

        {/* Customer name */}
        <Link
          href={`/proposals/${proposal.name}`}
          className="block text-sm font-semibold text-gray-900 hover:underline leading-tight"
          onClick={(e) => e.stopPropagation()}
        >
          {proposal.customer_name}
        </Link>

        {/* Tank/Site */}
        <p className="text-xs text-gray-500 leading-tight">
          {proposal.tank_name || proposal.site_name}
        </p>

        {/* Scope badge */}
        <div className="pt-0.5">
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] text-blue-700 bg-blue-50 rounded">
            {proposal.scope_summary || proposal.title}
          </span>
        </div>

        {/* Owner and days */}
        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
          <div className="flex items-center gap-1.5" {...(dragHandleProps || {})}>
            <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium",
              proposal.owner === 'joshua' && "bg-orange-100 text-orange-700",
              proposal.owner === 'mike' && "bg-blue-100 text-blue-700",
              proposal.owner === 'curtis' && "bg-green-100 text-green-700",
              proposal.owner === 'ron' && "bg-gray-200 text-gray-700",
              !['joshua', 'mike', 'curtis', 'ron'].includes(proposal.owner) && "bg-gray-100 text-gray-600",
            )}>
              {proposal.owner_initials?.[0] || proposal.owner_name?.[0] || "?"}
            </div>
            <span className="text-xs text-gray-600">{proposal.owner_name}</span>
          </div>
          <span className={cn(
            "text-xs",
            proposal.is_stale ? "text-red-500" : "text-gray-500"
          )}>
            {daysInStage}d in stage
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
