'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { customers } from '@/lib/data'
import { parseGpsCoords } from '@/lib/geo'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectType = 'Negotiated' | 'Engineered-spec'
type ServiceType =
  | 'Visual Inspection'
  | 'Washout & Inspection — Standpipe'
  | 'Washout & Inspection — Clear Well'
  | 'Maintenance Coating'
  | 'Sandblast & Reline'
  | 'Leak/Weld Repair'
type Stage = 'Lead' | 'Inspection' | 'Proposal' | 'Scheduled' | 'In Progress' | 'Billed'

interface KanbanProject {
  id: string
  customerName: string
  siteName: string
  projectType: ProjectType
  serviceType: ServiceType
  value: number
  owner: string
  ownerInitials: string
  stage: Stage
  daysInStage: number
  isStale: boolean
  needsAttention?: boolean
  attentionReason?: string
  scheduledDate?: string
  lastContact?: string
  expectedClose?: string
  nextAction?: string
  nextActionOverdue?: boolean
  tankSpecs?: string
  location?: string
  lastServiceDate?: string
  proposalStatus?: 'Draft' | 'Sent' | 'Negotiating' | 'Accepted' | 'Declined'
  crewAssigned?: string
  startDate?: string
  endDate?: string
  invoiceStatus?: 'Pending' | 'Sent' | 'Paid'
}

// ─── Stage Descriptions ───────────────────────────────────────────────────────

const stageDescriptions: Record<Stage, string> = {
  Lead: 'New inquiry, renewal trigger, or RFP captured',
  Inspection: 'Field work scheduled, in progress, or report being drafted',
  Proposal: 'Proposal sent to customer or bid submitted',
  Scheduled: 'Won — on the work calendar with crews assigned',
  'In Progress': 'Crews are on site executing',
  Billed: 'Work complete — invoice sent to customer',
}

// ─── Stage Actions ────────────────────────────────────────────────────────────

const stageActions: Record<Stage, { primary: string; icon?: 'external' }> = {
  Lead: { primary: 'Schedule inspection' },
  Inspection: { primary: 'Open in field tool', icon: 'external' },
  Proposal: { primary: 'Send proposal' },
  Scheduled: { primary: 'Assign crew' },
  'In Progress': { primary: 'Mark complete' },
  Billed: { primary: 'View invoice in QuickBooks', icon: 'external' },
}

// ─── Demo Data (Replace with Frappe API) ──────────────────────────────────────

const initialProjects: KanbanProject[] = [
  // Lead stage
  {
    id: 'p1',
    customerName: 'City of Springfield',
    siteName: 'Tower #2',
    projectType: 'Negotiated',
    serviceType: 'Visual Inspection',
    value: 1100,
    owner: 'Joshua',
    ownerInitials: 'JC',
    stage: 'Lead',
    daysInStage: 4,
    isStale: false,
    nextAction: 'Contact customer to schedule site visit',
  },
  {
    id: 'p2',
    customerName: 'MO DNR — Marshall',
    siteName: 'Standpipe',
    projectType: 'Engineered-spec',
    serviceType: 'Sandblast & Reline',
    value: 187000,
    owner: 'Joshua',
    ownerInitials: 'JC',
    stage: 'Lead',
    daysInStage: 18,
    isStale: true,
    nextAction: 'Follow up on RFP requirements',
    nextActionOverdue: true,
  },
  {
    id: 'p3',
    customerName: 'Neosho Municipal',
    siteName: 'Water Tower #1',
    projectType: 'Negotiated',
    serviceType: 'Washout & Inspection — Standpipe',
    value: 2800,
    owner: 'Joshua',
    ownerInitials: 'JC',
    stage: 'Lead',
    daysInStage: 2,
    isStale: false,
  },
  // Inspection stage
  {
    id: 'p4',
    customerName: 'City of Joplin',
    siteName: 'Tower #4 — Azure Lane',
    projectType: 'Negotiated',
    serviceType: 'Washout & Inspection — Standpipe',
    value: 2500,
    owner: 'Curtis',
    ownerInitials: 'CM',
    stage: 'Inspection',
    daysInStage: 3,
    isStale: false,
    scheduledDate: '2025-02-05',
    nextAction: 'Complete field inspection',
  },
  {
    id: 'p5',
    customerName: 'Branson Water',
    siteName: 'Clear Well',
    projectType: 'Negotiated',
    serviceType: 'Washout & Inspection — Clear Well',
    value: 5950,
    owner: 'Curtis',
    ownerInitials: 'CM',
    stage: 'Inspection',
    daysInStage: 12,
    isStale: true,
    nextAction: 'Finalize inspection report',
    nextActionOverdue: true,
  },
  {
    id: 'p6',
    customerName: 'Monett Utilities',
    siteName: 'North Tank',
    projectType: 'Negotiated',
    serviceType: 'Visual Inspection',
    value: 1100,
    owner: 'Mike',
    ownerInitials: 'MT',
    stage: 'Inspection',
    daysInStage: 5,
    isStale: false,
  },
  // Proposal stage
  {
    id: 'p7',
    customerName: 'Town of Lebanon',
    siteName: 'Hilltop Tank',
    projectType: 'Negotiated',
    serviceType: 'Maintenance Coating',
    value: 14200,
    owner: 'Joshua',
    ownerInitials: 'JC',
    stage: 'Proposal',
    daysInStage: 8,
    isStale: false,
    proposalStatus: 'Sent',
    nextAction: 'Follow up with customer on proposal',
  },
  {
    id: 'p8',
    customerName: 'AR Highway Dept',
    siteName: 'Site 47',
    projectType: 'Engineered-spec',
    serviceType: 'Sandblast & Reline',
    value: 312000,
    owner: 'Joshua',
    ownerInitials: 'JC',
    stage: 'Proposal',
    daysInStage: 22,
    isStale: false,
    proposalStatus: 'Negotiating',
    needsAttention: true,
    attentionReason: 'Waiting on customer signature',
  },
  {
    id: 'p9',
    customerName: 'Pittsburg Township',
    siteName: 'Main Tower',
    projectType: 'Negotiated',
    serviceType: 'Washout & Inspection — Standpipe',
    value: 3200,
    owner: 'Joshua',
    ownerInitials: 'JC',
    stage: 'Proposal',
    daysInStage: 14,
    isStale: false,
    proposalStatus: 'Sent',
  },
  // Scheduled stage
  {
    id: 'p10',
    customerName: 'City of Carthage',
    siteName: 'East Tower',
    projectType: 'Negotiated',
    serviceType: 'Washout & Inspection — Standpipe',
    value: 2500,
    owner: 'Mike',
    ownerInitials: 'MT',
    stage: 'Scheduled',
    daysInStage: 6,
    isStale: false,
    crewAssigned: 'Crew A',
    startDate: '2025-02-10',
  },
  {
    id: 'p11',
    customerName: 'OK Rural Water',
    siteName: 'Tank 12',
    projectType: 'Engineered-spec',
    serviceType: 'Maintenance Coating',
    value: 48000,
    owner: 'Mike',
    ownerInitials: 'MT',
    stage: 'Scheduled',
    daysInStage: 4,
    isStale: false,
    crewAssigned: 'Crew B',
    startDate: '2025-02-15',
  },
  // In Progress stage
  {
    id: 'p12',
    customerName: 'Joplin Industrial Park',
    siteName: 'Process Tank',
    projectType: 'Negotiated',
    serviceType: 'Leak/Weld Repair',
    value: 8400,
    owner: 'Mike',
    ownerInitials: 'MT',
    stage: 'In Progress',
    daysInStage: 9,
    isStale: false,
    crewAssigned: 'Crew A',
    startDate: '2025-01-20',
    endDate: '2025-02-01',
  },
  {
    id: 'p13',
    customerName: 'KS Municipal',
    siteName: 'Standpipe #3',
    projectType: 'Engineered-spec',
    serviceType: 'Sandblast & Reline',
    value: 221000,
    owner: 'Mike',
    ownerInitials: 'MT',
    stage: 'In Progress',
    daysInStage: 18,
    isStale: true,
    crewAssigned: 'Crew C',
    startDate: '2025-01-08',
    endDate: '2025-01-25',
    nextAction: 'Project past expected completion',
    nextActionOverdue: true,
  },
  // Billed stage
  {
    id: 'p14',
    customerName: 'City of Webb City',
    siteName: 'Tower',
    projectType: 'Negotiated',
    serviceType: 'Visual Inspection',
    value: 1100,
    owner: 'Becky',
    ownerInitials: 'BM',
    stage: 'Billed',
    daysInStage: 12,
    isStale: false,
    invoiceStatus: 'Sent',
  },
  {
    id: 'p15',
    customerName: 'MO 109 Authority',
    siteName: 'Clear Well',
    projectType: 'Engineered-spec',
    serviceType: 'Washout & Inspection — Clear Well',
    value: 5950,
    owner: 'Becky',
    ownerInitials: 'BM',
    stage: 'Billed',
    daysInStage: 38,
    isStale: true,
    invoiceStatus: 'Sent',
    nextAction: 'Follow up on unpaid invoice',
    nextActionOverdue: true,
  },
  {
    id: 'p16',
    customerName: 'Grove OK Water',
    siteName: 'Tank #2',
    projectType: 'Negotiated',
    serviceType: 'Maintenance Coating',
    value: 18500,
    owner: 'Melissa',
    ownerInitials: 'MJ',
    stage: 'Billed',
    daysInStage: 5,
    isStale: false,
    invoiceStatus: 'Paid',
  },
]

const stages: Stage[] = ['Lead', 'Inspection', 'Proposal', 'Scheduled', 'In Progress', 'Billed']
const owners = ['Ron', 'Joshua', 'Mike', 'Curtis', 'Becky', 'Melissa']

// ─── Format Helpers ───────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  return `$${value.toLocaleString()}`
}

function formatFullCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}

// ─── Sortable Card Component ──────────────────────────────────────────────────

function SortableCard({
  project,
  onClick,
}: {
  project: KanbanProject
  onClick: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
      {...attributes}
      {...listeners}
    >
      <ProjectCard
        project={project}
        onClick={onClick}
        isDragging={isDragging}
      />
    </div>
  )
}

// ─── Project Card Component ───────────────────────────────────────────────────

function ProjectCard({
  project,
  onClick,
  isDragging,
  isOverlay,
}: {
  project: KanbanProject
  onClick?: () => void
  isDragging?: boolean
  isOverlay?: boolean
}) {
  const daysColor =
    project.daysInStage >= 14
      ? 'text-destructive'
      : project.daysInStage >= 7
      ? 'text-amber-600'
      : 'text-muted-foreground'

  return (
    <Card
      className={cn(
        'relative transition-shadow hover:shadow-md',
        isOverlay && 'shadow-lg rotate-2',
        isDragging && 'ring-2 ring-accent'
      )}
      onClick={() => {
        if (!isDragging) onClick?.()
      }}
    >
      {/* Status dot */}
      {(project.isStale || project.needsAttention) && (
        <div
          className={cn(
            'absolute top-2 right-2 h-2.5 w-2.5 rounded-full',
            project.isStale ? 'bg-destructive' : 'bg-amber-500'
          )}
          title={project.isStale ? 'Stale' : project.attentionReason}
        />
      )}

      <CardContent className="p-3 space-y-2">
        {/* Top row: type + value */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant={project.projectType === 'Negotiated' ? 'outline' : 'default'}
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wide',
              project.projectType === 'Engineered-spec' && 'bg-amber-500 hover:bg-amber-500 text-white border-amber-500'
            )}
          >
            {project.projectType === 'Engineered-spec' ? 'Eng-Spec' : 'Negotiated'}
          </Badge>
          <span className="text-sm font-semibold tabular-nums">
            {formatFullCurrency(project.value)}
          </span>
        </div>

        {/* Customer + site */}
        <div>
          <p className="font-semibold text-sm leading-tight">{project.customerName}</p>
          <p className="text-xs text-muted-foreground">{project.siteName}</p>
        </div>

        {/* Service type */}
        <Badge variant="secondary" className="text-[10px] font-medium">
          {project.serviceType}
        </Badge>

        <Separator />

        {/* Footer: owner + days */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-slate-200 text-slate-700 font-semibold">
                {project.ownerInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{project.owner}</span>
          </div>
          <span className={cn('text-xs font-medium', daysColor)}>
            {project.daysInStage}d in stage
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Kanban Column Component ──────────────────────────────────────────────────

function KanbanColumn({
  stage,
  projects,
  onCardClick,
}: {
  stage: Stage
  projects: KanbanProject[]
  onCardClick: (project: KanbanProject) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  })
  const totalValue = projects.reduce((sum, p) => sum + p.value, 0)

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column header */}
      <div className="rounded-t-lg bg-muted/50 px-3 py-3 border border-b-0 border-border">
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold text-sm">{stage}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">{projects.length}</span>
            <span className="text-xs font-medium">{formatCurrency(totalValue)}</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
          {stageDescriptions[stage]}
        </p>
      </div>

      {/* Column content */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-b-lg border border-t-0 border-border p-2 transition-colors',
          isOver ? 'bg-accent/10 border-accent' : 'bg-muted/20'
        )}
      >
        <div className="space-y-2">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded-lg mb-3" />
              <p className="text-xs text-muted-foreground">
                {stage === 'Lead'
                  ? 'No new leads. Add one to get started.'
                  : 'No projects in this stage.'}
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <SortableCard
                key={project.id}
                project={project}
                onClick={() => onCardClick(project)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Stage Colors for Map ─────────────────────────────────────────────────────

const stageColors: Record<Stage, string> = {
  Lead: '#64748b',
  Inspection: '#3b82f6',
  Proposal: '#f59e0b',
  Scheduled: '#8b5cf6',
  'In Progress': '#10b981',
  Billed: '#047857',
}

// ─── Pipeline Table View ──────────────────────────────────────────────────────

type SortField = 'customer' | 'stage' | 'value' | 'daysInStage'
type SortDir = 'asc' | 'desc'

function PipelineTableView({
  projects,
  onProjectClick,
  onClearFilters,
}: {
  projects: KanbanProject[]
  onProjectClick: (project: KanbanProject) => void
  onClearFilters: () => void
}) {
  const [sortField, setSortField] = useState<SortField>('stage')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'customer':
          comparison = a.customerName.localeCompare(b.customerName)
          break
        case 'stage':
          comparison = stages.indexOf(a.stage) - stages.indexOf(b.stage)
          if (comparison === 0) comparison = b.daysInStage - a.daysInStage
          break
        case 'value':
          comparison = a.value - b.value
          break
        case 'daysInStage':
          comparison = a.daysInStage - b.daysInStage
          break
      }
      return sortDir === 'asc' ? comparison : -comparison
    })
  }, [projects, sortField, sortDir])

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        )}
      </div>
    </TableHead>
  )

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No projects match the current filters.</p>
          <Button variant="link" onClick={onClearFilters}>Reset filters</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <SortHeader field="customer">Customer / Site</SortHeader>
              <TableHead>Project Type</TableHead>
              <TableHead>Service Type</TableHead>
              <SortHeader field="stage">Stage</SortHeader>
              <SortHeader field="value">
                <span className="text-right w-full">Value</span>
              </SortHeader>
              <TableHead>Owner</TableHead>
              <SortHeader field="daysInStage">Days</SortHeader>
              <TableHead className="w-12">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.map((project) => {
              const daysColor =
                project.daysInStage >= 14
                  ? 'text-destructive font-medium'
                  : project.daysInStage >= 7
                  ? 'text-amber-600'
                  : ''

              return (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => onProjectClick(project)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{project.customerName}</p>
                      <p className="text-xs text-muted-foreground">{project.siteName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={project.projectType === 'Negotiated' ? 'outline' : 'default'}
                      className={cn(
                        'text-[10px]',
                        project.projectType === 'Engineered-spec' && 'bg-amber-500 hover:bg-amber-500 text-white border-amber-500'
                      )}
                    >
                      {project.projectType === 'Engineered-spec' ? 'ENG-SPEC' : 'NEGOTIATED'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-sm">
                    {project.serviceType}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">{project.stage}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatFullCurrency(project.value)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[9px] bg-slate-200 text-slate-700">
                          {project.ownerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{project.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell className={daysColor}>{project.daysInStage}d</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {project.isStale && (
                        <div className="h-2 w-2 rounded-full bg-destructive" title="Stale" />
                      )}
                      {project.needsAttention && !project.isStale && (
                        <div className="h-2 w-2 rounded-full bg-amber-500" title={project.attentionReason} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

// ─── Pipeline Map View ────────────────────────────────────────────────────────

interface ProjectMarker {
  id: string
  lat: number
  lng: number
  customerName: string
  siteName: string
  stage: Stage
  value: number
  daysInStage: number
  isStale: boolean
  serviceType: string
  project: KanbanProject
}

function PipelineMapView({
  projects,
  onProjectClick,
  onClearFilters,
}: {
  projects: KanbanProject[]
  onProjectClick: (project: KanbanProject) => void
  onClearFilters: () => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)

  const { markers, unmatchedCount } = useMemo(() => {
    const result: ProjectMarker[] = []
    let unmatched = 0

    for (const project of projects) {
      const customer = customers.find((c) =>
        c.shortName.toLowerCase().includes(project.customerName.toLowerCase().split(' ')[0]) ||
        project.customerName.toLowerCase().includes(c.shortName.toLowerCase().split(' ')[0])
      )

      if (!customer) {
        unmatched++
        continue
      }

      const site = customer.sites.find((s) =>
        s.name.toLowerCase().includes(project.siteName.toLowerCase().split(' ')[0]) ||
        project.siteName.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])
      ) || customer.sites[0]

      if (!site) {
        unmatched++
        continue
      }

      const coords = parseGpsCoords(site.gpsCoords)
      if (!coords) {
        unmatched++
        continue
      }

      const [lat, lng] = coords
      if (isNaN(lat) || isNaN(lng) || lat < 24 || lat > 50 || lng < -125 || lng > -66) {
        unmatched++
        continue
      }

      result.push({
        id: project.id,
        lat,
        lng,
        customerName: project.customerName,
        siteName: project.siteName,
        stage: project.stage,
        value: project.value,
        daysInStage: project.daysInStage,
        isStale: project.isStale,
        serviceType: project.serviceType,
        project,
      })
    }

    return { markers: result, unmatchedCount: unmatched }
  }, [projects])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.crossOrigin = ''
        document.head.appendChild(link)
      }

      if (!mapRef.current) return

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const defaultCenter: [number, number] = [39.0, -98.0]
      const defaultZoom = 4

      const map = L.map(mapRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      markers.forEach((marker) => {
        const color = stageColors[marker.stage]
        const daysColor =
          marker.daysInStage >= 14 ? '#ef4444' : marker.daysInStage >= 7 ? '#f59e0b' : '#64748b'

        if (marker.isStale) {
          L.circleMarker([marker.lat, marker.lng], {
            radius: 16,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 0.3,
            fillOpacity: 0.1,
          }).addTo(map)
        }

        const circleMarker = L.circleMarker([marker.lat, marker.lng], {
          radius: 10,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map)

        const popupContent = `
          <div style="min-width: 180px; font-family: system-ui, sans-serif;">
            <p style="font-weight: 600; font-size: 14px; margin: 0 0 2px;">${marker.customerName}</p>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 8px;">${marker.siteName}</p>
            <div style="display: flex; gap: 4px; margin-bottom: 6px;">
              <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">${marker.stage}</span>
            </div>
            <p style="font-size: 12px; margin: 0 0 2px;">${marker.serviceType}</p>
            <p style="font-weight: 600; margin: 4px 0;">${formatFullCurrency(marker.value)}</p>
            <p style="font-size: 11px; color: ${daysColor}; margin: 0 0 8px;">${marker.daysInStage}d in stage</p>
            <button id="open-details-${marker.id}" style="background: none; border: none; color: #1d4ed8; cursor: pointer; font-size: 12px; padding: 0;">Open details →</button>
          </div>
        `

        circleMarker.bindPopup(popupContent)

        circleMarker.on('popupopen', () => {
          const btn = document.getElementById(`open-details-${marker.id}`)
          if (btn) {
            btn.onclick = () => {
              onProjectClick(marker.project)
              map.closePopup()
            }
          }
        })
      })

      if (markers.length > 0) {
        const lats = markers.map((m) => m.lat)
        const lngs = markers.map((m) => m.lng)
        const bounds = L.latLngBounds(
          [Math.min(...lats) - 1, Math.min(...lngs) - 2],
          [Math.max(...lats) + 1, Math.max(...lngs) + 2]
        )
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 6 })
      }

      setTimeout(() => map.invalidateSize(), 100)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isClient, markers, onProjectClick])

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No projects match the current filters.</p>
          <Button variant="link" onClick={onClearFilters}>Reset filters</Button>
        </CardContent>
      </Card>
    )
  }

  if (markers.length === 0 && projects.length > 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">
            None of the visible projects could be matched to a site with GPS coordinates.
          </p>
          <Button variant="link" onClick={onClearFilters}>Try clearing filters</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold">{markers.length} projects on map</h3>
          <p className="text-xs text-muted-foreground">
            Showing only projects with matched site coordinates
          </p>
        </div>
        <div className="relative">
          {!isClient ? (
            <div className="h-[calc(100vh-350px)] sm:h-[calc(100vh-320px)] flex items-center justify-center bg-muted/30">
              <p className="text-muted-foreground text-sm">Loading map...</p>
            </div>
          ) : (
            <div
              ref={mapRef}
              className="h-[calc(100vh-350px)] sm:h-[calc(100vh-320px)]"
              style={{ minHeight: '300px', background: '#f8fafc' }}
            />
          )}

          {/* Stage Legend */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-lg border p-3 shadow-sm z-[1000]">
            <p className="text-xs font-medium mb-2">Stage</p>
            <div className="space-y-1.5">
              {stages.map((stage) => (
                <div key={stage} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: stageColors[stage] }}
                  />
                  <span className="text-xs">{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {unmatchedCount > 0 && (
          <div className="p-3 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground">
              {unmatchedCount} project{unmatchedCount > 1 ? 's' : ''} not shown — missing site coordinates
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Pipeline Page ───────────────────────────────────────────────────────

export default function PipelinePage() {
  const [projects, setProjects] = useState<KanbanProject[]>(initialProjects)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<KanbanProject | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [newLeadOpen, setNewLeadOpen] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterProjectType, setFilterProjectType] = useState<ProjectType | null>(null)
  const [filterOwners, setFilterOwners] = useState<string[]>([])
  const [filterStaleOnly, setFilterStaleOnly] = useState(false)

  // View mode
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'map'>('kanban')

  // Dialogs
  const [skipDialog, setSkipDialog] = useState<{ project: KanbanProject; targetStage: Stage } | null>(null)
  const [backwardDialog, setBackwardDialog] = useState<{ project: KanbanProject; targetStage: Stage; reason: string } | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !p.customerName.toLowerCase().includes(q) &&
          !p.siteName.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      if (filterProjectType && p.projectType !== filterProjectType) return false
      if (filterOwners.length > 0 && !filterOwners.includes(p.owner)) return false
      if (filterStaleOnly && !p.isStale) return false
      return true
    })
  }, [projects, searchQuery, filterProjectType, filterOwners, filterStaleOnly])

  // Stats
  const totalProjects = projects.length
  const totalValue = projects.reduce((sum, p) => sum + p.value, 0)
  const staleCount = projects.filter((p) => p.isStale).length
  const hasActiveFilters = searchQuery || filterProjectType || filterOwners.length > 0 || filterStaleOnly

  // Group by stage
  const projectsByStage = useMemo(() => {
    const grouped: Record<Stage, KanbanProject[]> = {
      Lead: [],
      Inspection: [],
      Proposal: [],
      Scheduled: [],
      'In Progress': [],
      Billed: [],
    }
    filteredProjects.forEach((p) => {
      grouped[p.stage].push(p)
    })
    return grouped
  }, [filteredProjects])

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilterProjectType(null)
    setFilterOwners([])
    setFilterStaleOnly(false)
  }, [])

  // Get active project for drag overlay
  const activeProject = useMemo(() => {
    if (!activeId) return null
    return projects.find((p) => p.id === activeId) || null
  }, [activeId, projects])

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Placeholder for visual feedback during drag
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over) return

      const activeProject = projects.find((p) => p.id === active.id)
      if (!activeProject) return

      let targetStage: Stage | null = null

      if (stages.includes(over.id as Stage)) {
        targetStage = over.id as Stage
      } else {
        for (const stage of stages) {
          if (projectsByStage[stage].some((p) => p.id === over.id)) {
            targetStage = stage
            break
          }
        }
      }

      if (!targetStage || targetStage === activeProject.stage) {
        const stageProjects = projectsByStage[activeProject.stage]
        const oldIndex = stageProjects.findIndex((p) => p.id === active.id)
        const newIndex = stageProjects.findIndex((p) => p.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          setProjects((prev) => {
            const newProjects = [...prev]
            const stageItems = newProjects.filter((p) => p.stage === activeProject.stage)
            const otherItems = newProjects.filter((p) => p.stage !== activeProject.stage)
            const reordered = arrayMove(stageItems, oldIndex, newIndex)
            return [...otherItems, ...reordered]
          })
        }
        return
      }

      const fromIndex = stages.indexOf(activeProject.stage)
      const toIndex = stages.indexOf(targetStage)

      if (toIndex < fromIndex) {
        setBackwardDialog({ project: activeProject, targetStage, reason: '' })
        return
      }

      if (toIndex - fromIndex > 1) {
        setSkipDialog({ project: activeProject, targetStage })
        return
      }

      moveProject(activeProject.id, targetStage)
    },
    [projects, projectsByStage]
  )

  // Move project
  const moveProject = useCallback((projectId: string, targetStage: Stage) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, stage: targetStage, daysInStage: 0, isStale: false }
          : p
      )
    )
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      toast(`${project.customerName} · ${project.siteName} advanced to ${targetStage}`, {
        action: {
          label: 'Undo',
          onClick: () => {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === projectId
                  ? { ...p, stage: project.stage, daysInStage: project.daysInStage, isStale: project.isStale }
                  : p
              )
            )
          },
        },
      })
    }
  }, [projects])

  // Handle card click
  const handleCardClick = useCallback((project: KanbanProject) => {
    setSelectedProject(project)
    setSheetOpen(true)
  }, [])

  // Handle primary action
  const handlePrimaryAction = useCallback(() => {
    if (!selectedProject) return
    const action = stageActions[selectedProject.stage]
    if (action.icon === 'external') {
      toast('Would route to ' + (selectedProject.stage === 'Inspection' ? 'Field Inspection & Instant Report Generator' : 'QuickBooks'))
    } else {
      toast(`Action: ${action.primary}`)
    }
  }, [selectedProject])

  // Handle advance
  const handleAdvance = useCallback(() => {
    if (!selectedProject) return
    const currentIndex = stages.indexOf(selectedProject.stage)
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1]
      moveProject(selectedProject.id, nextStage)
      setSelectedProject((prev) => prev ? { ...prev, stage: nextStage, daysInStage: 0 } : null)
    }
  }, [selectedProject, moveProject])

  return (
    <div className="flex flex-col h-screen">
      {/* Sub-header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {totalProjects} active projects · {formatCurrency(totalValue)} in flight
            {staleCount > 0 && (
              <button
                onClick={() => setFilterStaleOnly(true)}
                className="ml-2 inline-flex items-center gap-1 text-destructive hover:underline"
              >
                <AlertCircle className="h-3 w-3" />
                {staleCount} stale
              </button>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewLeadOpen(true)} className="gap-2 bg-primary">
            <Plus className="h-4 w-4" />
            New Lead
          </Button>
          <div className="flex rounded-md border border-input bg-background">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-none border-x"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('map')}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border bg-background">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 pl-8 h-8 text-sm"
          />
        </div>

        <Button
          variant={filterProjectType === 'Negotiated' ? 'default' : 'outline'}
          size="sm"
          className="h-8"
          onClick={() => setFilterProjectType(filterProjectType === 'Negotiated' ? null : 'Negotiated')}
        >
          Negotiated
        </Button>
        <Button
          variant={filterProjectType === 'Engineered-spec' ? 'default' : 'outline'}
          size="sm"
          className="h-8"
          onClick={() => setFilterProjectType(filterProjectType === 'Engineered-spec' ? null : 'Engineered-spec')}
        >
          Eng-Spec
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {owners.slice(0, 4).map((owner) => (
          <Button
            key={owner}
            variant={filterOwners.includes(owner) ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1.5"
            onClick={() =>
              setFilterOwners((prev) =>
                prev.includes(owner) ? prev.filter((o) => o !== owner) : [...prev, owner]
              )
            }
          >
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[8px] bg-slate-200 text-slate-700">
                {owner[0]}
              </AvatarFallback>
            </Avatar>
            {owner}
          </Button>
        ))}

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <Switch
            id="stale-filter"
            checked={filterStaleOnly}
            onCheckedChange={setFilterStaleOnly}
          />
          <Label htmlFor="stale-filter" className="text-sm cursor-pointer">
            Stale only
          </Label>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {hasActiveFilters && (
          <p className="text-xs text-muted-foreground px-4 py-2">
            Showing {filteredProjects.length} of {totalProjects} projects
          </p>
        )}

        {/* Main canvas */}
        {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredProjects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex gap-3 overflow-x-auto">
              {stages.map((stage) => (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  projects={projectsByStage[stage]}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeProject && (
              <ProjectCard project={activeProject} isOverlay />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {viewMode === 'table' && (
        <PipelineTableView
          projects={filteredProjects}
          onProjectClick={handleCardClick}
          onClearFilters={clearFilters}
        />
      )}

      {viewMode === 'map' && (
        <PipelineMapView
          projects={filteredProjects}
          onProjectClick={handleCardClick}
          onClearFilters={clearFilters}
        />
      )}

      {filteredProjects.length === 0 && hasActiveFilters && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">
            No projects match these filters. Clear filters to see all {totalProjects} projects.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-[640px] flex flex-col">
          {selectedProject && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <SheetTitle className="text-lg">{selectedProject.customerName}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selectedProject.siteName}</p>
                  </div>
                  <Badge
                    variant={selectedProject.projectType === 'Negotiated' ? 'outline' : 'default'}
                    className={cn(
                      selectedProject.projectType === 'Engineered-spec' && 'bg-amber-500 hover:bg-amber-500 text-white border-amber-500'
                    )}
                  >
                    {selectedProject.projectType}
                  </Badge>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="flex-1 mt-4">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="site" className="text-xs">Site</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                  <TabsTrigger value="proposal" className="text-xs">Proposal</TabsTrigger>
                  <TabsTrigger value="project" className="text-xs">Project</TabsTrigger>
                  <TabsTrigger value="billing" className="text-xs">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="flex items-center gap-1">
                    {stages.map((stage, i) => (
                      <div key={stage} className="flex items-center gap-1">
                        <div
                          className={cn(
                            'h-2 w-8 rounded-full',
                            stages.indexOf(selectedProject.stage) >= i
                              ? 'bg-primary'
                              : 'bg-muted'
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current stage: <span className="font-medium text-foreground">{selectedProject.stage}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Value</p>
                      <p className="font-semibold">{formatFullCurrency(selectedProject.value)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px] bg-slate-200 text-slate-700">
                            {selectedProject.ownerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{selectedProject.owner}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Service Type</p>
                      <p className="text-sm">{selectedProject.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Days in Stage</p>
                      <p className={cn(
                        'text-sm font-medium',
                        selectedProject.isStale && 'text-destructive'
                      )}>
                        {selectedProject.daysInStage} days
                        {selectedProject.isStale && ' (stale)'}
                      </p>
                    </div>
                  </div>

                  {selectedProject.nextAction && (
                    <div
                      className={cn(
                        'p-3 rounded-lg border',
                        selectedProject.nextActionOverdue
                          ? 'bg-destructive/10 border-destructive/20'
                          : 'bg-muted border-border'
                      )}
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-1">Next Action</p>
                      <p className={cn(
                        'text-sm font-medium',
                        selectedProject.nextActionOverdue && 'text-destructive'
                      )}>
                        {selectedProject.nextAction}
                        {selectedProject.nextActionOverdue && ' — overdue'}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="site" className="space-y-4 mt-4">
                  <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Map placeholder</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Tank Specs</p>
                    <p className="text-sm">{selectedProject.tankSpecs || 'Not specified'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Last Service Date</p>
                    <p className="text-sm">{selectedProject.lastServiceDate || 'No prior service'}</p>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <p className="text-sm text-muted-foreground">Service history will appear here.</p>
                </TabsContent>

                <TabsContent value="proposal" className="space-y-4 mt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Status:</p>
                    <Badge variant="outline">{selectedProject.proposalStatus || 'Not started'}</Badge>
                  </div>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">PDF preview placeholder</p>
                  </div>
                </TabsContent>

                <TabsContent value="project" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Crew Assigned</p>
                      <p className="text-sm">{selectedProject.crewAssigned || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="text-sm">{selectedProject.startDate || 'Not scheduled'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="text-sm">{selectedProject.endDate || 'Not set'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="billing" className="space-y-4 mt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Invoice Status:</p>
                    <Badge variant="outline">{selectedProject.invoiceStatus || 'Not invoiced'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">QuickBooks link will appear here.</p>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4 border-t mt-auto">
                <Button className="flex-1 gap-2" onClick={handlePrimaryAction}>
                  {stageActions[selectedProject.stage].primary}
                  {stageActions[selectedProject.stage].icon === 'external' && (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Button>
                {stages.indexOf(selectedProject.stage) < stages.length - 1 && (
                  <Button variant="outline" onClick={handleAdvance} className="gap-2">
                    Advance
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* New Lead Dialog */}
      <Dialog open={newLeadOpen} onOpenChange={setNewLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Lead</DialogTitle>
            <DialogDescription>
              Add a new lead to the pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input placeholder="e.g., City of Springfield" />
            </div>
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input placeholder="e.g., Tower #2" />
            </div>
            <div className="space-y-2">
              <Label>Estimated Value</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewLeadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast('Lead created (demo)')
              setNewLeadOpen(false)
            }}>
              Create Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skip Dialog */}
      <Dialog open={!!skipDialog} onOpenChange={() => setSkipDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip stages?</DialogTitle>
            <DialogDescription>
              You&apos;re moving this project from {skipDialog?.project.stage} directly to {skipDialog?.targetStage}.
              Most projects pass through all stages — confirm or cancel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipDialog(null)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (skipDialog) {
                moveProject(skipDialog.project.id, skipDialog.targetStage)
                setSkipDialog(null)
              }
            }}>
              Confirm Skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backward Dialog */}
      <Dialog open={!!backwardDialog} onOpenChange={() => setBackwardDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move backward?</DialogTitle>
            <DialogDescription>
              Please provide a reason for moving this project back to {backwardDialog?.targetStage}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for moving backward..."
              value={backwardDialog?.reason || ''}
              onChange={(e) =>
                setBackwardDialog((prev) =>
                  prev ? { ...prev, reason: e.target.value } : null
                )
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackwardDialog(null)}>
              Cancel
            </Button>
            <Button
              disabled={!backwardDialog?.reason.trim()}
              onClick={() => {
                if (backwardDialog && backwardDialog.reason.trim()) {
                  moveProject(backwardDialog.project.id, backwardDialog.targetStage)
                  setBackwardDialog(null)
                }
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
