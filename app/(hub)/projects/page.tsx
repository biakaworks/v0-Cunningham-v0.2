"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown,
  Building2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

import { 
  getProjectListItems, 
  getProjectSummary, 
  mockProjectOwners,
} from "@/lib/mock-project-data"
import { PROJECT_STATUS_COLORS, type ProjectStatus } from "@/types/project"

type SortField = 'project_name' | 'customer_name' | 'contract_value' | 'status' | 'percent_complete' | 'owner_name' | 'start_date'
type SortDirection = 'asc' | 'desc'

export default function ProjectsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")
  const [customerFilter, setCustomerFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>('project_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  
  const projects = getProjectListItems()
  const summary = getProjectSummary()
  
  // Get unique customers for filter
  const customers = useMemo(() => {
    const unique = new Map<string, string>()
    projects.forEach(p => unique.set(p.customer, p.customer_name))
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
  }, [projects])
  
  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(p => 
        p.project_name.toLowerCase().includes(searchLower) ||
        p.project_number.toLowerCase().includes(searchLower) ||
        p.customer_name.toLowerCase().includes(searchLower) ||
        p.site_name.toLowerCase().includes(searchLower)
      )
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter)
    }
    
    // Owner filter
    if (ownerFilter !== "all") {
      filtered = filtered.filter(p => p.owner === ownerFilter)
    }
    
    // Customer filter
    if (customerFilter !== "all") {
      filtered = filtered.filter(p => p.customer === customerFilter)
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal: string | number = a[sortField] ?? ''
      let bVal: string | number = b[sortField] ?? ''
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal as string).toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    
    return filtered
  }, [projects, search, statusFilter, ownerFilter, customerFilter, sortField, sortDirection])
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage active projects, materials, and billing milestones
          </p>
        </div>
        
        <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Projects are typically created automatically when a proposal is marked as Won. 
                Use this form to create a project manually.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" placeholder="Enter project name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Contract Value</Label>
                <Input id="value" type="number" placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="owner">Owner</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjectOwners.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewProjectOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setNewProjectOpen(false)}>
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.active_count}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.active_value)} total value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.blocked_count}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.billing_pending_count}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting final billing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total_value)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.total_count} total projects
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Setup">Setup</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Billing Pending">Billing Pending</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {mockProjectOwners.map(o => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('project_name')}
                >
                  Project
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('customer_name')}
                >
                  Customer / Site
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('contract_value')}
                >
                  Value
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('status')}
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('percent_complete')}
                >
                  Progress
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('owner_name')}
                >
                  Owner
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('start_date')}
                >
                  Schedule
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.name}>
                  <TableCell>
                    <Link 
                      href={`/projects/${project.name}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {project.project_name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {project.project_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{project.customer_name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {project.site_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(project.contract_value)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={PROJECT_STATUS_COLORS[project.status]}>
                        {project.status}
                      </Badge>
                      {project.has_open_exceptions && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" title="Has open exceptions" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={project.percent_complete} className="h-2 w-16" />
                      <span className="text-sm text-muted-foreground">
                        {project.percent_complete}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{project.owner_name || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(project.start_date)}</div>
                      <div className="text-xs text-muted-foreground">
                        to {formatDate(project.projected_end_date)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.name}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.name}/field`}>
                            Field View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/customers/${project.customer}`}>
                            View Customer
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
