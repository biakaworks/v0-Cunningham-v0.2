'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  ClipboardCheck, 
  Clock, 
  Send, 
  AlertCircle,
  FileCheck,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SyncStatusBadge, HeaderSyncIndicator } from '@/components/inspections/sync-indicator'
import { StartInspectionDialog } from '@/components/inspections/start-inspection-dialog'
import { useOfflineSync } from '@/hooks/use-offline-sync'
import { 
  mockInspections, 
  getInspectionQueueSummary 
} from '@/lib/mock-inspection-data'
import type { Inspection, InspectionStatus, InspectionUserRole } from '@/types/inspection'
import { cn } from '@/lib/utils'

// =============================================================================
// Inspections Queue Page
// =============================================================================

export default function InspectionsPage() {
  // In real app, this would come from auth context
  const [userRole] = useState<InspectionUserRole>('field')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false)
  
  const { 
    isOnline, 
    isSyncing, 
    queueDepth, 
    lastSyncedAt, 
    items,
    flushQueue,
    retryItem,
    getInspectionSyncState 
  } = useOfflineSync()

  const summary = getInspectionQueueSummary()

  // Filter inspections based on search and status
  const filteredInspections = mockInspections.filter(inspection => {
    const matchesSearch = searchQuery === '' || 
      inspection.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.tankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Group inspections by status for field view
  const groupedInspections = {
    inProgress: filteredInspections.filter(i => i.status === 'In Progress'),
    scheduled: filteredInspections.filter(i => i.status === 'Draft' && !i.contextConfirmed),
    submitted: filteredInspections.filter(i => i.status === 'Office Review' || i.status === 'Submitted'),
    corrections: filteredInspections.filter(i => i.status === 'Corrections Requested'),
  }

  // Group for office view
  const officeQueue = filteredInspections.filter(i => 
    i.status === 'Office Review' || i.status === 'Submitted'
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inspections</h1>
          <p className="text-muted-foreground">
            {userRole === 'field' ? 'My Inspections' : 'Review Queue'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <HeaderSyncIndicator
            isOnline={isOnline}
            isSyncing={isSyncing}
            queueDepth={queueDepth}
            lastSyncedAt={lastSyncedAt}
            items={items}
            onFlush={flushQueue}
            onRetryItem={retryItem}
          />
          
          {userRole === 'field' && (
            <Button onClick={() => setIsStartDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start Inspection
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards - Field View Only */}
      {userRole === 'field' && (
        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="In Progress"
            count={summary.inProgress}
            icon={ClipboardCheck}
            className="border-l-4 border-l-blue-500"
          />
          <SummaryCard
            title="Scheduled"
            count={summary.scheduled}
            icon={Clock}
            className="border-l-4 border-l-gray-400"
          />
          <SummaryCard
            title="Submitted"
            count={summary.submitted}
            icon={Send}
            className="border-l-4 border-l-amber-500"
          />
          <SummaryCard
            title="Corrections"
            count={summary.correctionsRequested}
            icon={AlertCircle}
            className="border-l-4 border-l-red-500"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inspections..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Scheduled</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Office Review">Submitted</SelectItem>
            <SelectItem value="Corrections Requested">Corrections</SelectItem>
            <SelectItem value="Ready for Report">Ready for Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content - Different views for Field vs Office */}
      {userRole === 'field' ? (
        <FieldView 
          groupedInspections={groupedInspections}
          getInspectionSyncState={getInspectionSyncState}
        />
      ) : (
        <OfficeView 
          inspections={officeQueue}
        />
      )}

      {/* Start Inspection Dialog */}
      <StartInspectionDialog
        open={isStartDialogOpen}
        onOpenChange={setIsStartDialogOpen}
      />
    </div>
  )
}

// =============================================================================
// Summary Card
// =============================================================================

function SummaryCard({ 
  title, 
  count, 
  icon: Icon,
  className 
}: { 
  title: string
  count: number
  icon: React.ElementType
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold">{count}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Field View - Tabbed sections
// =============================================================================

function FieldView({ 
  groupedInspections,
  getInspectionSyncState 
}: { 
  groupedInspections: Record<string, Inspection[]>
  getInspectionSyncState: (id: string) => { status: string; lastSyncedAt?: string; error?: string }
}) {
  return (
    <Tabs defaultValue="inProgress" className="space-y-4">
      <TabsList>
        <TabsTrigger value="inProgress" className="gap-2">
          In Progress
          {groupedInspections.inProgress.length > 0 && (
            <Badge variant="secondary">{groupedInspections.inProgress.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="scheduled" className="gap-2">
          Scheduled
          {groupedInspections.scheduled.length > 0 && (
            <Badge variant="secondary">{groupedInspections.scheduled.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="submitted" className="gap-2">
          Submitted
          {groupedInspections.submitted.length > 0 && (
            <Badge variant="secondary">{groupedInspections.submitted.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="corrections" className="gap-2">
          Corrections
          {groupedInspections.corrections.length > 0 && (
            <Badge variant="destructive">{groupedInspections.corrections.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inProgress">
        <InspectionTable 
          inspections={groupedInspections.inProgress}
          getInspectionSyncState={getInspectionSyncState}
          emptyMessage="No inspections in progress"
        />
      </TabsContent>

      <TabsContent value="scheduled">
        <InspectionTable 
          inspections={groupedInspections.scheduled}
          getInspectionSyncState={getInspectionSyncState}
          emptyMessage="No scheduled inspections"
        />
      </TabsContent>

      <TabsContent value="submitted">
        <InspectionTable 
          inspections={groupedInspections.submitted}
          getInspectionSyncState={getInspectionSyncState}
          emptyMessage="No submitted inspections"
        />
      </TabsContent>

      <TabsContent value="corrections">
        <InspectionTable 
          inspections={groupedInspections.corrections}
          getInspectionSyncState={getInspectionSyncState}
          emptyMessage="No corrections requested"
          showCorrections
        />
      </TabsContent>
    </Tabs>
  )
}

// =============================================================================
// Office View - Review queue
// =============================================================================

function OfficeView({ inspections }: { inspections: Inspection[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <InspectionTable 
          inspections={inspections}
          emptyMessage="No inspections awaiting review"
          showReviewAction
        />
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Inspection Table
// =============================================================================

function InspectionTable({ 
  inspections,
  getInspectionSyncState,
  emptyMessage,
  showCorrections,
  showReviewAction,
}: { 
  inspections: Inspection[]
  getInspectionSyncState?: (id: string) => { status: string; lastSyncedAt?: string; error?: string }
  emptyMessage: string
  showCorrections?: boolean
  showReviewAction?: boolean
}) {
  if (inspections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ClipboardCheck className="h-12 w-12 mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Site / Tank</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          {getInspectionSyncState && <TableHead>Sync</TableHead>}
          {showCorrections && <TableHead>Corrections</TableHead>}
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inspections.map(inspection => {
          const syncState = getInspectionSyncState?.(inspection.name)
          
          return (
            <TableRow key={inspection.name}>
              <TableCell className="font-mono text-sm">
                {inspection.name}
              </TableCell>
              <TableCell>{inspection.customerName}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{inspection.siteName}</div>
                  <div className="text-sm text-muted-foreground">{inspection.tankName}</div>
                </div>
              </TableCell>
              <TableCell>
                {new Date(inspection.serviceDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <StatusBadge status={inspection.status} />
              </TableCell>
              {syncState && (
                <TableCell>
                  <SyncStatusBadge syncState={syncState as any} />
                </TableCell>
              )}
              {showCorrections && (
                <TableCell>
                  <Badge variant="destructive">
                    {inspection.corrections.length} items
                  </Badge>
                </TableCell>
              )}
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/inspections/${inspection.name}`}>
                    {showReviewAction ? 'Review' : 'Open'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// =============================================================================
// Status Badge
// =============================================================================

function StatusBadge({ status }: { status: InspectionStatus }) {
  const config: Record<InspectionStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    'Draft': { variant: 'secondary', className: '' },
    'In Progress': { variant: 'default', className: 'bg-blue-500' },
    'Submitted': { variant: 'outline', className: 'border-amber-500 text-amber-700' },
    'Office Review': { variant: 'outline', className: 'border-amber-500 text-amber-700' },
    'Corrections Requested': { variant: 'destructive', className: '' },
    'Ready for Report': { variant: 'outline', className: 'border-green-500 text-green-700' },
    'Report Generated': { variant: 'secondary', className: 'bg-green-100 text-green-800' },
  }

  const { variant, className } = config[status] || { variant: 'secondary', className: '' }

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  )
}
