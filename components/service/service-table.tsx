'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowUpDown, 
  ExternalLink,
  AlertTriangle,
  Calendar,
  Check,
} from 'lucide-react'

import type { ServiceDueItem, ServiceDueListStatus } from '@/types/service'
import { SERVICE_STATUS_OPTIONS, OUTREACH_STATUS_OPTIONS } from '@/types/service'
import { updateServiceSchedule } from '@/lib/actions/service'

interface ServiceTableProps {
  items: ServiceDueItem[]
  sortBy: keyof ServiceDueItem
  sortDir: 'asc' | 'desc'
  onSort: (column: keyof ServiceDueItem) => void
  selectedItems: string[]
  onSelectionChange: (items: string[]) => void
}

function formatDate(date?: string): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function getDaysUntilColor(days: number): string {
  if (days < 0) return 'text-status-red font-semibold'
  if (days <= 14) return 'text-status-yellow font-semibold'
  if (days <= 30) return 'text-foreground'
  return 'text-status-green'
}

function getDaysUntilText(days: number): string {
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day'
  return `${days} days`
}

function getStatusBadgeColor(status: ServiceDueListStatus): string {
  switch (status) {
    case 'due':
      return 'bg-status-yellow text-foreground'
    case 'scheduled':
      return 'bg-mwi-navy text-white'
    case 'completed':
      return 'bg-status-green text-white'
    case 'skipped':
    case 'deferred':
    case 'canceled':
      return 'bg-muted text-muted-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function ServiceTable({
  items,
  sortBy,
  sortDir,
  onSort,
  selectedItems,
  onSelectionChange,
}: ServiceTableProps) {
  const [isPending, startTransition] = useTransition()
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(items.map(item => item.customer))
    } else {
      onSelectionChange([])
    }
  }
  
  const handleSelectItem = (customerId: string, checked: boolean) => {
    if (checked) {
      // Add customer if not already selected
      if (!selectedItems.includes(customerId)) {
        onSelectionChange([...selectedItems, customerId])
      }
    } else {
      onSelectionChange(selectedItems.filter(id => id !== customerId))
    }
  }
  
  const handleStatusChange = (itemName: string, newStatus: ServiceDueListStatus) => {
    startTransition(async () => {
      const result = await updateServiceSchedule(itemName, { status: newStatus })
      if (result.success) {
        toast.success('Status Updated', {
          description: `Service status changed to ${newStatus}`,
        })
      } else {
        toast.error('Error', {
          description: result.error || 'Failed to update status',
        })
      }
    })
  }
  
  const SortableHeader = ({ column, label }: { column: keyof ServiceDueItem; label: string }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => onSort(column)}
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  )

  const allSelected = items.length > 0 && items.every(item => selectedItems.includes(item.customer))
  const someSelected = items.some(item => selectedItems.includes(item.customer)) && !allSelected

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) (el as unknown as HTMLInputElement).indeterminate = someSelected
                }}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <SortableHeader column="customer_name" label="Customer" />
            <SortableHeader column="site_name" label="Site" />
            <SortableHeader column="tank_name" label="Tank" />
            <SortableHeader column="next_due_date" label="Next Due" />
            <SortableHeader column="days_until" label="Days Until" />
            <SortableHeader column="service_cycle" label="Cycle" />
            <SortableHeader column="crew_name" label="Crew" />
            <TableHead>Status</TableHead>
            <TableHead>Outreach</TableHead>
            <SortableHeader column="last_service_date" label="Last Service" />
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No service items found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.name}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.customer)}
                    onCheckedChange={(checked) => handleSelectItem(item.customer, !!checked)}
                    aria-label={`Select ${item.customer_name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Link 
                    href={`/customers/${item.customer}`}
                    className="hover:underline text-mwi-water-blue"
                  >
                    {item.customer_name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link 
                    href={`/sites/${item.site}`}
                    className="hover:underline text-mwi-water-blue"
                  >
                    {item.site_name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link 
                    href={`/sites/${item.site}/tanks/${item.tank}`}
                    className="hover:underline"
                  >
                    {item.tank_name}
                  </Link>
                </TableCell>
                <TableCell>{formatDate(item.next_due_date)}</TableCell>
                <TableCell>
                  <div className={`flex items-center gap-1 ${getDaysUntilColor(item.days_until)}`}>
                    {item.days_until < 0 && <AlertTriangle className="h-4 w-4" />}
                    {getDaysUntilText(item.days_until)}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.service_cycle}
                </TableCell>
                <TableCell>
                  {item.crew_name || (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={item.status}
                    onValueChange={(value) => handleStatusChange(item.name, value as ServiceDueListStatus)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue>
                        <Badge className={getStatusBadgeColor(item.status)}>
                          {item.status}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={
                      item.outreach_status === 'scheduled' || item.outreach_status === 'replied'
                        ? 'border-status-green text-status-green'
                        : item.outreach_status === 'no-response' || item.outreach_status === 'declined'
                        ? 'border-status-red text-status-red'
                        : item.outreach_status === 'sent'
                        ? 'border-status-yellow text-status-yellow'
                        : ''
                    }
                  >
                    {OUTREACH_STATUS_OPTIONS.find(o => o.value === item.outreach_status)?.label || item.outreach_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(item.last_service_date)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <Link href={`/sites/${item.site}/tanks/${item.tank}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
