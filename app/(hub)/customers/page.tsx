"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DataTable, StatusBadge, DateCell } from "@/components/records"
import type { Column } from "@/components/records"
import { getCustomers, getSites, mockTanks } from "@/lib/mock-data"
import type { Customer } from "@/types/cunningham"
import { Plus, Building2, Filter, X, MapPin, Droplets } from "lucide-react"

export default function CustomersPage() {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const customers = getCustomers()

  // Apply filters
  const filteredCustomers = customers.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (typeFilter !== "all" && c.customer_type !== typeFilter) return false
    return true
  })

  // Enrich with counts
  const enrichedCustomers = filteredCustomers.map((c) => {
    const sites = getSites(c.name)
    const siteIds = sites.map((s) => s.name)
    const tanks = mockTanks.filter((t) => siteIds.includes(t.site!))
    return {
      ...c,
      site_count: sites.length,
      tank_count: tanks.length,
    }
  })

  const columns: Column<Customer & { site_count: number; tank_count: number }>[] = [
    {
      key: "customer_name",
      header: "Customer",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{value as string}</p>
            <p className="text-muted-foreground text-xs">{row.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "customer_type",
      header: "Type",
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{value as string}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={value as string}
          variant={value === "Active" ? "default" : "secondary"}
        />
      ),
    },
    {
      key: "site_count",
      header: "Sites",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <MapPin className="text-muted-foreground h-3 w-3" />
          <span>{value as number}</span>
        </div>
      ),
    },
    {
      key: "tank_count",
      header: "Tanks",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Droplets className="text-muted-foreground h-3 w-3" />
          <span>{value as number}</span>
        </div>
      ),
    },
    {
      key: "primary_contact",
      header: "Contact",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-sm">{value as string || "-"}</p>
          {row.phone && (
            <p className="text-muted-foreground text-xs">{row.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "modified",
      header: "Last Updated",
      sortable: true,
      render: (value) => <DateCell value={value as string} />,
    },
  ]

  const handleRowClick = (row: Customer) => {
    router.push(`/customers/${row.name}`)
  }

  const activeFilters = [
    statusFilter !== "all" && { key: "status", value: statusFilter },
    typeFilter !== "all" && { key: "type", value: typeFilter },
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm">
            Manage customer accounts, sites, and tanks
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Create a new customer record. You can add sites and tanks after.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input id="customer_name" placeholder="City of Springfield Water Department" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer_type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Municipality">Municipality</SelectItem>
                    <SelectItem value="Water District">Water District</SelectItem>
                    <SelectItem value="Water Authority">Water Authority</SelectItem>
                    <SelectItem value="Private Utility">Private Utility</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="primary_contact">Primary Contact</Label>
                <Input id="primary_contact" placeholder="John Smith" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="(555) 123-4567" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contact@example.com" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>
                Create Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Municipality">Municipality</SelectItem>
            <SelectItem value="Water District">Water District</SelectItem>
            <SelectItem value="Water Authority">Water Authority</SelectItem>
            <SelectItem value="Private Utility">Private Utility</SelectItem>
          </SelectContent>
        </Select>

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("all")
              setTypeFilter("all")
            }}
            className="h-9"
          >
            <X className="mr-1 h-4 w-4" />
            Clear filters
          </Button>
        )}

        <div className="text-muted-foreground ml-auto text-sm">
          {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={enrichedCustomers}
        onRowClick={handleRowClick}
        searchPlaceholder="Search customers..."
        emptyMessage="No customers found. Add your first customer to get started."
        rowActions={[
          {
            label: "View Details",
            onClick: (row) => router.push(`/customers/${row.name}`),
          },
          {
            label: "Add Site",
            onClick: (row) => console.log("Add site to", row.name),
          },
          {
            label: "Create Proposal",
            onClick: (row) => console.log("Create proposal for", row.name),
          },
        ]}
      />
    </div>
  )
}
