"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Filter,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Building2,
  X,
  ExternalLink,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import { getAllBillingMilestones, getBillingSummary, mockProjectOwners } from "@/lib/mock-project-data"
import { MILESTONE_STATUS_COLORS, type MilestoneStatus, type BillingListItem } from "@/types/project"

export default function BillingPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [customerFilter, setCustomerFilter] = useState<string>("all")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")
  const [selectedMilestone, setSelectedMilestone] = useState<BillingListItem | null>(null)
  const [reconciliationNote, setReconciliationNote] = useState("")
  
  const milestones = getAllBillingMilestones()
  const summary = getBillingSummary()
  
  // Get unique projects and customers for filters
  const projects = useMemo(() => {
    const unique = new Map<string, string>()
    milestones.forEach(m => unique.set(m.project_number, m.project_name))
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
  }, [milestones])
  
  const customers = useMemo(() => {
    const unique = new Map<string, string>()
    milestones.forEach(m => unique.set(m.customer, m.customer_name))
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
  }, [milestones])
  
  // Filter milestones
  const filteredMilestones = useMemo(() => {
    let filtered = milestones
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(m =>
        m.milestone_name.toLowerCase().includes(searchLower) ||
        m.project_name.toLowerCase().includes(searchLower) ||
        m.customer_name.toLowerCase().includes(searchLower)
      )
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(m => m.status === statusFilter)
    }
    
    if (projectFilter !== "all") {
      filtered = filtered.filter(m => m.project_number === projectFilter)
    }
    
    if (customerFilter !== "all") {
      filtered = filtered.filter(m => m.customer === customerFilter)
    }
    
    if (ownerFilter !== "all") {
      filtered = filtered.filter(m => m.owner === ownerFilter)
    }
    
    return filtered
  }, [milestones, search, statusFilter, projectFilter, customerFilter, ownerFilter])
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }
  
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }
  
  const handleStatusChange = (milestoneId: string, newStatus: MilestoneStatus) => {
    toast.success("Status Updated", {
      description: `Milestone status changed to ${newStatus}`,
    })
  }
  
  const handleAddReconciliationNote = () => {
    if (!reconciliationNote.trim()) return
    
    toast.success("Note Added", {
      description: "Reconciliation note saved",
    })
    setReconciliationNote("")
  }
  
  const handleRefreshSync = (milestoneId: string) => {
    toast.info("Syncing...", {
      description: "Refreshing QuickBooks data",
    })
    // Simulate sync
    setTimeout(() => {
      toast.success("Sync Complete", {
        description: "QuickBooks data refreshed",
      })
    }, 1500)
  }
  
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage billing milestones across all projects
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Bill</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.ready_to_bill_count}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.ready_to_bill_amount)} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoiced</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.invoiced_count}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.invoiced_amount)} outstanding
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.paid_amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Collected this period
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
      </div>
      
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search milestones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Not Ready">Not Ready</SelectItem>
              <SelectItem value="Ready to Bill">Ready to Bill</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Invoiced">Invoiced</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
        </div>
      </div>
      
      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Milestone</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Last Sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMilestones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No milestones found
                </TableCell>
              </TableRow>
            ) : (
              filteredMilestones.map((milestone) => (
                <TableRow
                  key={milestone.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedMilestone(milestone)}
                >
                  <TableCell>
                    <Link
                      href={`/projects/${milestone.project_number}`}
                      className="font-medium text-foreground hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {milestone.project_name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {milestone.project_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {milestone.customer_name}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{milestone.milestone_name}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(milestone.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={MILESTONE_STATUS_COLORS[milestone.status]}>
                      {milestone.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(milestone.due_date)}</TableCell>
                  <TableCell>
                    {milestone.qb_invoice_number || milestone.invoice_reference || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {milestone.qb_last_sync ? formatDateTime(milestone.qb_last_sync) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      {/* Milestone Detail Sheet */}
      <Sheet open={!!selectedMilestone} onOpenChange={(open) => !open && setSelectedMilestone(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedMilestone && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedMilestone.milestone_name}</SheetTitle>
                <SheetDescription>
                  {selectedMilestone.project_name}
                </SheetDescription>
              </SheetHeader>
              
              <ScrollArea className="h-[calc(100vh-120px)] pr-4">
                <div className="mt-6 space-y-6">
                  {/* Amount & Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedMilestone.amount)}</p>
                    </div>
                    <Select
                      value={selectedMilestone.status}
                      onValueChange={(value) => handleStatusChange(selectedMilestone.id, value as MilestoneStatus)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Ready">Not Ready</SelectItem>
                        <SelectItem value="Ready to Bill">Ready to Bill</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Invoiced">Invoiced</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  {/* Details */}
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Due Date</Label>
                        <p className="font-medium">{formatDate(selectedMilestone.due_date)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Owner</Label>
                        <p className="font-medium">{selectedMilestone.owner || "—"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* QuickBooks Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">QuickBooks Invoice</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefreshSync(selectedMilestone.id)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedMilestone.invoice_reference ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Invoice #</span>
                            <span className="font-medium">
                              {selectedMilestone.qb_invoice_number || selectedMilestone.invoice_reference}
                            </span>
                          </div>
                          {selectedMilestone.qb_invoice_status && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Status</span>
                              <Badge variant="outline">{selectedMilestone.qb_invoice_status}</Badge>
                            </div>
                          )}
                          {selectedMilestone.qb_payment_status && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Payment</span>
                              <Badge variant="outline">{selectedMilestone.qb_payment_status}</Badge>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last Sync</span>
                            <span className="text-sm">{formatDateTime(selectedMilestone.qb_last_sync)}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No invoice linked yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Separator />
                  
                  {/* Linked Records */}
                  <div>
                    <Label className="text-muted-foreground">Linked Records</Label>
                    <div className="mt-2 space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href={`/projects/${selectedMilestone.project_number}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          Project: {selectedMilestone.project_name}
                          <ExternalLink className="ml-auto h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href={`/customers/${selectedMilestone.customer}`}>
                          <Building2 className="mr-2 h-4 w-4" />
                          Customer: {selectedMilestone.customer_name}
                          <ExternalLink className="ml-auto h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Reconciliation Notes */}
                  <div>
                    <Label className="text-muted-foreground">Reconciliation Notes</Label>
                    <div className="mt-2 space-y-2">
                      <Textarea
                        placeholder="Add a note..."
                        value={reconciliationNote}
                        onChange={(e) => setReconciliationNote(e.target.value)}
                        rows={3}
                      />
                      <Button
                        size="sm"
                        onClick={handleAddReconciliationNote}
                        disabled={!reconciliationNote.trim()}
                      >
                        Add Note
                      </Button>
                    </div>
                    
                    {selectedMilestone.notes && (
                      <div className="mt-4 rounded-lg bg-muted p-3">
                        <p className="text-sm">{selectedMilestone.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
