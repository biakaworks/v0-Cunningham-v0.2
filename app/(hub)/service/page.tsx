"use client"

import { useState, useMemo } from "react"
import { ServiceTable } from "@/components/service/service-table"
import { ServiceFiltersBar } from "@/components/service/service-filters"
import { OutreachPanel } from "@/components/service/outreach-panel"
import { 
  mockServiceDueItems, 
  getServiceFilterOptions,
  filterServiceItems,
  sortServiceItems
} from "@/lib/mock-service-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarClock, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Download,
  MapPin
} from "lucide-react"
import Link from "next/link"
import type { ServiceFilters, ServiceDueItem } from "@/types/service"
import { DEFAULT_SERVICE_FILTERS } from "@/types/service"

export default function ServicePage() {
  const [filters, setFilters] = useState<ServiceFilters>(DEFAULT_SERVICE_FILTERS)
  const [sortBy, setSortBy] = useState<keyof ServiceDueItem>('days_until')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([])

  const filterOptions = getServiceFilterOptions()

  // Calculate summary from mock data
  const summary = useMemo(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    
    return {
      overdue: mockServiceDueItems.filter(item => item.days_until < 0).length,
      dueThisMonth: mockServiceDueItems.filter(item => {
        const dueDate = new Date(item.next_due_date)
        return dueDate.getMonth() === thisMonth && dueDate.getFullYear() === thisYear && item.days_until >= 0
      }).length,
      dueNext90Days: mockServiceDueItems.filter(item => item.days_until >= 0 && item.days_until <= 90).length,
      scheduled: mockServiceDueItems.filter(item => item.status === 'scheduled').length,
    }
  }, [])

  const filteredItems = useMemo(() => {
    const filtered = filterServiceItems(mockServiceDueItems, filters)
    return sortServiceItems(filtered, sortBy, sortDir)
  }, [filters, sortBy, sortDir])

  const handleSort = (column: keyof ServiceDueItem) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_SERVICE_FILTERS)
  }

  const handleExportCSV = () => {
    const headers = ["Customer", "Site", "Tank", "Due Date", "Days Until", "Cycle", "Crew", "Status", "Outreach", "Last Service"]
    const rows = filteredItems.map(item => [
      item.customer_name,
      item.site_name,
      item.tank_name,
      item.next_due_date,
      item.days_until.toString(),
      item.service_cycle,
      item.crew_name || "Unassigned",
      item.status,
      item.outreach_status,
      item.last_service_date || "N/A"
    ])
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `service-due-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Get selected customer names for the outreach panel
  const selectedCustomerNames = useMemo(() => {
    const uniqueCustomers = new Map<string, string>()
    filteredItems.forEach(item => {
      if (selectedCustomerIds.includes(item.customer)) {
        uniqueCustomers.set(item.customer, item.customer_name)
      }
    })
    return Array.from(uniqueCustomers.values())
  }, [filteredItems, selectedCustomerIds])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Service Due</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Recurring maintenance and inspection schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/map?filter=service-due">
              <MapPin className="h-4 w-4 mr-2" />
              View on Map
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-destructive">{summary.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-warning">{summary.dueThisMonth}</p>
                <p className="text-xs text-muted-foreground">Due This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{summary.dueNext90Days}</p>
                <p className="text-xs text-muted-foreground">Next 90 Days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-success">{summary.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outreach Panel */}
      <OutreachPanel 
        selectedCustomerIds={selectedCustomerIds}
        selectedCustomerNames={selectedCustomerNames}
        onClearSelection={() => setSelectedCustomerIds([])}
      />

      {/* Filters */}
      <ServiceFiltersBar 
        filters={filters} 
        onFiltersChange={setFilters}
        filterOptions={filterOptions}
        onReset={handleResetFilters}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {mockServiceDueItems.length} items
        </p>
        {selectedCustomerIds.length > 0 && (
          <Badge variant="secondary">
            {selectedCustomerIds.length} customer{selectedCustomerIds.length !== 1 ? 's' : ''} selected
          </Badge>
        )}
      </div>

      {/* Service Table */}
      <ServiceTable 
        items={filteredItems}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        selectedItems={selectedCustomerIds}
        onSelectionChange={setSelectedCustomerIds}
      />
    </div>
  )
}
