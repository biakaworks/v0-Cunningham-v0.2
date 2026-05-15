"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Camera,
  Wrench,
  ClipboardCheck,
  DollarSign,
  Calendar,
  User,
  MessageSquare,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export type ActivityType =
  | "inspection"
  | "proposal"
  | "service_visit"
  | "report"
  | "note"
  | "photo"
  | "status_change"
  | "payment"
  | "document"
  | "project"

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description?: string
  timestamp: string
  user?: string
  status?: "success" | "warning" | "error" | "pending"
  linkTo?: string
  metadata?: Record<string, string | number>
}

interface ActivityTimelineProps {
  title?: string
  activities: ActivityItem[]
  isLoading?: boolean
  maxHeight?: number
  className?: string
}

const activityIcons: Record<ActivityType, typeof FileText> = {
  inspection: ClipboardCheck,
  proposal: DollarSign,
  service_visit: Wrench,
  report: FileText,
  note: MessageSquare,
  photo: Camera,
  status_change: AlertTriangle,
  payment: DollarSign,
  document: FileText,
  project: Calendar,
}

const activityColors: Record<ActivityType, string> = {
  inspection: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  proposal: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  service_visit: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  report: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  note: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  photo: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  status_change: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  payment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  document: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  project: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
}

const statusIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
  pending: Clock,
}

const statusColors = {
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
  pending: "text-muted-foreground",
}

export function ActivityTimeline({
  title = "Activity Timeline",
  activities,
  isLoading = false,
  maxHeight = 400,
  className,
}: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-1 p-4 pt-0">
            {activities.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No activity recorded yet
              </p>
            ) : (
              activities.map((activity, index) => (
                <ActivityEntry
                  key={activity.id}
                  activity={activity}
                  isLast={index === activities.length - 1}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function ActivityEntry({
  activity,
  isLast,
}: {
  activity: ActivityItem
  isLast: boolean
}) {
  const Icon = activityIcons[activity.type]
  const StatusIcon = activity.status ? statusIcons[activity.status] : null

  const content = (
    <div className="group relative flex gap-3 pb-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="bg-border absolute left-4 top-8 h-full w-px" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          activityColors[activity.type]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">{activity.title}</p>
          {StatusIcon && (
            <StatusIcon
              className={cn(
                "h-4 w-4 shrink-0",
                statusColors[activity.status!]
              )}
            />
          )}
        </div>

        {activity.description && (
          <p className="text-muted-foreground text-sm">{activity.description}</p>
        )}

        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
            })}
          </span>

          {activity.user && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {activity.user}
            </span>
          )}

          {activity.metadata &&
            Object.entries(activity.metadata).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs font-normal">
                {key}: {value}
              </Badge>
            ))}
        </div>
      </div>
    </div>
  )

  if (activity.linkTo) {
    return (
      <a
        href={activity.linkTo}
        className="block rounded-lg transition-colors hover:bg-muted/50"
      >
        {content}
      </a>
    )
  }

  return content
}

// Utility to merge different record types into timeline activities
export function mergeActivities(
  ...activityArrays: ActivityItem[][]
): ActivityItem[] {
  const merged = activityArrays.flat()
  return merged.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

// Helper to create activity from inspection
export function inspectionToActivity(inspection: {
  name: string
  inspection_date: string
  inspector?: string
  overall_condition?: string
}): ActivityItem {
  return {
    id: `inspection-${inspection.name}`,
    type: "inspection",
    title: `Inspection conducted`,
    description: inspection.overall_condition
      ? `Overall condition: ${inspection.overall_condition}`
      : undefined,
    timestamp: inspection.inspection_date,
    user: inspection.inspector,
    linkTo: `/inspections/${inspection.name}`,
    status: "success",
  }
}

// Helper to create activity from proposal
export function proposalToActivity(proposal: {
  name: string
  creation: string
  proposal_value?: number
  status?: string
}): ActivityItem {
  return {
    id: `proposal-${proposal.name}`,
    type: "proposal",
    title: `Proposal created`,
    description: proposal.proposal_value
      ? `Value: ${proposal.proposal_value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}`
      : undefined,
    timestamp: proposal.creation,
    linkTo: `/proposals/${proposal.name}`,
    status:
      proposal.status === "Won"
        ? "success"
        : proposal.status === "Lost"
        ? "error"
        : "pending",
    metadata: proposal.status ? { Status: proposal.status } : undefined,
  }
}

// Helper to create activity from service visit
export function serviceVisitToActivity(visit: {
  name: string
  visit_date: string
  technician?: string
  work_performed?: string
}): ActivityItem {
  return {
    id: `visit-${visit.name}`,
    type: "service_visit",
    title: `Service visit completed`,
    description: visit.work_performed,
    timestamp: visit.visit_date,
    user: visit.technician,
    linkTo: `/service/${visit.name}`,
    status: "success",
  }
}
