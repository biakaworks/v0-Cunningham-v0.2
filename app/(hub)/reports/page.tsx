'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronRight,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { mockReports, getReportQueueSummary } from '@/lib/mock-inspection-data'
import type { ReportStatus, FacilityReport } from '@/types/inspection'
import { cn } from '@/lib/utils'

// =============================================================================
// Reports Queue Page
// =============================================================================

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const summary = getReportQueueSummary()

  // Filter reports
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = searchQuery === '' || 
      report.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.tankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-muted-foreground">
            Facility condition report drafting queue
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="Draft"
          count={summary.draft}
          className="border-l-4 border-l-gray-400"
        />
        <SummaryCard
          title="In Review"
          count={summary.inReview}
          className="border-l-4 border-l-amber-500"
        />
        <SummaryCard
          title="Approved"
          count={summary.approved}
          className="border-l-4 border-l-green-500"
        />
        <SummaryCard
          title="Delivered"
          count={summary.delivered}
          className="border-l-4 border-l-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
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
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="In Review">In Review</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p>No reports found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Site / Tank</TableHead>
                  <TableHead>Inspection Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map(report => (
                  <TableRow key={report.name}>
                    <TableCell className="font-mono text-sm">
                      {report.name}
                    </TableCell>
                    <TableCell>{report.customerName}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.siteName}</div>
                        <div className="text-sm text-muted-foreground">{report.tankName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(report.inspectionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                    <TableCell>{report.ownerName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(report.modifiedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/reports/${report.name}`}>
                          Open
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Summary Card
// =============================================================================

function SummaryCard({ 
  title, 
  count,
  className 
}: { 
  title: string
  count: number
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
          <FileText className="h-8 w-8 text-muted-foreground/50" />
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Status Badge
// =============================================================================

function StatusBadge({ status }: { status: ReportStatus }) {
  const config: Record<ReportStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    'Draft': { variant: 'secondary', className: '' },
    'In Review': { variant: 'outline', className: 'border-amber-500 text-amber-700' },
    'Approved': { variant: 'outline', className: 'border-green-500 text-green-700' },
    'Delivered': { variant: 'default', className: 'bg-blue-500' },
    'Archived': { variant: 'secondary', className: 'bg-gray-100 text-gray-600' },
  }

  const { variant, className } = config[status] || { variant: 'secondary', className: '' }

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  )
}
