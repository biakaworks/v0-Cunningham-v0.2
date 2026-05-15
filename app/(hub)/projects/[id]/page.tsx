"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ClipboardList,
  DollarSign,
  FolderOpen,
  Camera,
  Plus,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

import { getProjectById, mockProjectOwners } from "@/lib/mock-project-data"
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_ORDER,
  MATERIAL_STATUS_COLORS,
  MILESTONE_STATUS_COLORS,
  type ProjectStatus,
  type SetupItemStatus,
  type MaterialStatus,
  type MilestoneStatus,
  type CloseoutItemStatus,
} from "@/types/project"

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const project = getProjectById(id)
  
  const [activeTab, setActiveTab] = useState("overview")
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false)
  const [blockedReason, setBlockedReason] = useState("")
  const [blockedNextAction, setBlockedNextAction] = useState("")
  const [addMaterialOpen, setAddMaterialOpen] = useState(false)
  const [addLogOpen, setAddLogOpen] = useState(false)
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  
  if (!project) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Project not found</h2>
          <p className="text-muted-foreground">The project you are looking for does not exist.</p>
          <Button asChild className="mt-4">
            <Link href="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  const formatCurrency = (value?: number) => {
    if (value === undefined) return "—"
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
  
  const handleStatusChange = (newStatus: ProjectStatus) => {
    if (newStatus === "Blocked") {
      setBlockedDialogOpen(true)
      return
    }
    
    if (newStatus === "Closed") {
      // Check if required closeout items are complete
      const incompleteRequired = project.closeout_checklist.filter(
        item => item.is_required && item.status === "Required"
      )
      if (incompleteRequired.length > 0) {
        toast.error("Cannot close project", {
          description: "Required closeout items must be completed or waived first",
        })
        return
      }
    }
    
    toast.success("Status Updated", {
      description: `Project status changed to ${newStatus}`,
    })
  }
  
  const handleBlockedSubmit = () => {
    if (!blockedReason || !blockedNextAction) {
      toast.error("Missing information", {
        description: "Both reason and next action are required",
      })
      return
    }
    
    toast.success("Project Blocked", {
      description: "Status updated with reason and next action",
    })
    setBlockedDialogOpen(false)
    setBlockedReason("")
    setBlockedNextAction("")
  }
  
  const openExceptionDialog = (materialId: string) => {
    setSelectedMaterialId(materialId)
    setExceptionDialogOpen(true)
  }
  
  // Calculate summary counts
  const setupIncomplete = project.setup_checklist.filter(
    i => i.status !== "Complete" && i.status !== "Waived"
  ).length
  const openExceptions = project.material_exceptions.filter(
    e => e.resolution_status !== "Resolved"
  ).length
  const closeoutIncomplete = project.closeout_checklist.filter(
    i => i.is_required && i.status === "Required"
  ).length
  
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <span>/</span>
          <span>{project.project_number}</span>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{project.project_name}</h1>
              <Badge className={PROJECT_STATUS_COLORS[project.status]}>
                {project.status}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <Link href={`/customers/${project.customer}`} className="hover:text-foreground hover:underline">
                  {project.customer_name}
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <Link href={`/sites/${project.site}`} className="hover:text-foreground hover:underline">
                  {project.site_name}
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {project.owner_name || "Unassigned"}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select
              value={project.status}
              onValueChange={(value) => handleStatusChange(value as ProjectStatus)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUS_ORDER.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.name}/field`}>
                Field View
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Blocked Banner */}
        {project.status === "Blocked" && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Project Blocked</p>
                <p className="text-sm text-muted-foreground">{project.blocked_reason}</p>
                <p className="mt-1 text-sm">
                  <span className="font-medium">Next Action:</span> {project.blocked_next_action}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Contract Value</div>
              <div className="text-xl font-bold">{formatCurrency(project.contract_value)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="flex items-center gap-2">
                <Progress value={project.percent_complete} className="h-2 flex-1" />
                <span className="text-xl font-bold">{project.percent_complete}%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Setup Tasks</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {project.setup_checklist.length - setupIncomplete}/{project.setup_checklist.length}
                </span>
                {setupIncomplete > 0 && (
                  <Badge variant="secondary">{setupIncomplete} remaining</Badge>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Open Exceptions</div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${openExceptions > 0 ? "text-amber-600" : ""}`}>
                  {openExceptions}
                </span>
                {openExceptions > 0 && (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Schedule</div>
              <div className="text-sm">
                {formatDate(project.start_date)} - {formatDate(project.projected_end_date)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="setup" className="text-xs">
            Setup
            {setupIncomplete > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {setupIncomplete}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="materials" className="text-xs">Materials</TabsTrigger>
          <TabsTrigger value="equipment" className="text-xs">Equipment</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs">Daily Logs</TabsTrigger>
          <TabsTrigger value="exceptions" className="text-xs">
            Exceptions
            {openExceptions > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {openExceptions}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-xs">Billing</TabsTrigger>
          <TabsTrigger value="closeout" className="text-xs">
            Closeout
            {closeoutIncomplete > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {closeoutIncomplete}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Customer</Label>
                    <p className="font-medium">{project.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Site</Label>
                    <p className="font-medium">{project.site_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tank</Label>
                    <p className="font-medium">{project.tank_name || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Owner</Label>
                    <p className="font-medium">{project.owner_name || "Unassigned"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Contract Value</Label>
                    <p className="font-medium">{formatCurrency(project.contract_value)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Contract Date</Label>
                    <p className="font-medium">{formatDate(project.contract_date)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-muted-foreground">Linked Records</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.source_proposal && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/proposals/${project.source_proposal}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          Proposal {project.source_proposal_number}
                        </Link>
                      </Button>
                    )}
                    {project.source_contract && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="#">
                          <FileText className="mr-2 h-4 w-4" />
                          Contract {project.source_contract_number}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Start Date</Label>
                    <p className="font-medium">{formatDate(project.start_date)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Projected End</Label>
                    <p className="font-medium">{formatDate(project.projected_end_date)}</p>
                  </div>
                  {project.actual_end_date && (
                    <div>
                      <Label className="text-muted-foreground">Actual End</Label>
                      <p className="font-medium">{formatDate(project.actual_end_date)}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-muted-foreground">Status History</Label>
                  <div className="mt-2 space-y-2">
                    {project.status_history?.slice(0, 5).map((change, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {change.to_status}
                        </Badge>
                        <span className="text-muted-foreground">
                          {formatDateTime(change.changed_at)} by {change.changed_by}
                        </span>
                      </div>
                    ))}
                    {!project.status_history?.length && (
                      <p className="text-sm text-muted-foreground">No status changes recorded</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Setup Checklist Tab */}
        <TabsContent value="setup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Setup Checklist
              </CardTitle>
              <CardDescription>
                {project.setup_checklist.length - setupIncomplete} of {project.setup_checklist.length} items complete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]" />
                    <TableHead>Item</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.setup_checklist.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={item.status === "Complete"}
                          onCheckedChange={() => {
                            toast.success("Item Updated")
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.owner || "—"}</TableCell>
                      <TableCell>{formatDate(item.due_date)}</TableCell>
                      <TableCell>
                        <Select defaultValue={item.status}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Complete">Complete</SelectItem>
                            <SelectItem value="Waived">Waived</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {item.waived_reason || item.notes || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Materials Tab */}
        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Materials
                </CardTitle>
                <CardDescription>
                  {project.materials.length} items
                </CardDescription>
              </div>
              <Dialog open={addMaterialOpen} onOpenChange={setAddMaterialOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Material
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Material</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Item</Label>
                      <Input placeholder="Material name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Vendor</Label>
                        <Input placeholder="Vendor name" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Quantity</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Cost Estimate</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Expected Delivery</Label>
                        <Input type="date" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddMaterialOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      toast.success("Material Added")
                      setAddMaterialOpen(false)
                    }}>
                      Add Material
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Cost Est.</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.materials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No materials added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    project.materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.item}</TableCell>
                        <TableCell>{material.vendor || "—"}</TableCell>
                        <TableCell>{material.quantity} {material.unit}</TableCell>
                        <TableCell>{formatCurrency(material.cost_estimate)}</TableCell>
                        <TableCell>{formatDate(material.order_date)}</TableCell>
                        <TableCell>{formatDate(material.expected_delivery)}</TableCell>
                        <TableCell>
                          <Badge className={MATERIAL_STATUS_COLORS[material.status]}>
                            {material.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openExceptionDialog(material.id)}>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Flag Exception
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Equipment Tab */}
        <TabsContent value="equipment" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Equipment
                </CardTitle>
                <CardDescription>
                  {project.equipment.length} items
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Return</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.equipment.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No equipment added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    project.equipment.map((equip) => (
                      <TableRow key={equip.id}>
                        <TableCell className="font-medium">{equip.item}</TableCell>
                        <TableCell>{equip.vendor}</TableCell>
                        <TableCell>{formatDate(equip.delivery_date)}</TableCell>
                        <TableCell>{formatDate(equip.return_date)}</TableCell>
                        <TableCell>{equip.location || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{equip.status}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate text-muted-foreground">
                          {equip.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Daily Logs Tab */}
        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Daily Logs
                </CardTitle>
                <CardDescription>
                  {project.daily_logs.length} entries
                </CardDescription>
              </div>
              <Dialog open={addLogOpen} onOpenChange={setAddLogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Daily Log
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Daily Log</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>Date</Label>
                        <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Crew</Label>
                        <Input placeholder="Crew name" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Weather</Label>
                        <Input placeholder="Conditions" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Work Completed</Label>
                      <Textarea placeholder="Describe work completed today..." rows={3} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Issues</Label>
                      <Textarea placeholder="Any issues or delays..." rows={2} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Next Steps</Label>
                      <Textarea placeholder="Planned work for tomorrow..." rows={2} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddLogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      toast.success("Daily Log Added")
                      setAddLogOpen(false)
                    }}>
                      Save Log
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {project.daily_logs.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No daily logs yet
                    </p>
                  ) : (
                    project.daily_logs.map((log) => (
                      <Card key={log.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-base">
                                {formatDate(log.date)}
                              </CardTitle>
                              <Badge variant="outline">{log.crew}</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {log.weather}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Work Completed</p>
                            <p className="text-sm text-muted-foreground">{log.work_completed}</p>
                          </div>
                          {log.issues && (
                            <div>
                              <p className="text-sm font-medium text-amber-600">Issues</p>
                              <p className="text-sm text-muted-foreground">{log.issues}</p>
                            </div>
                          )}
                          {log.next_steps && (
                            <div>
                              <p className="text-sm font-medium">Next Steps</p>
                              <p className="text-sm text-muted-foreground">{log.next_steps}</p>
                            </div>
                          )}
                          {log.photos && log.photos.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Camera className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {log.photos.length} photos
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Exceptions Tab */}
        <TabsContent value="exceptions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Material Delivery Exceptions
              </CardTitle>
              <CardDescription>
                {openExceptions} open, {project.material_exceptions.length - openExceptions} resolved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.material_exceptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No exceptions recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    project.material_exceptions.map((exc) => (
                      <TableRow key={exc.id}>
                        <TableCell className="font-medium">{exc.item}</TableCell>
                        <TableCell>{exc.vendor}</TableCell>
                        <TableCell>{formatDate(exc.expected_date)}</TableCell>
                        <TableCell>{formatDate(exc.actual_date)}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{exc.issue_type}</Badge>
                        </TableCell>
                        <TableCell>{exc.owner || "—"}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={exc.resolution_status === "Resolved" ? "default" : "secondary"}
                          >
                            {exc.resolution_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {exc.resolution_status !== "Resolved" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toast.success("Exception resolved")}
                            >
                              Resolve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Billing Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Milestone</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Sync</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.billing_milestones.map((milestone) => (
                        <TableRow key={milestone.id}>
                          <TableCell className="font-medium">{milestone.milestone_name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(milestone.amount)}</TableCell>
                          <TableCell>{formatDate(milestone.due_date)}</TableCell>
                          <TableCell>
                            {milestone.qb_invoice_number || milestone.invoice_reference || "—"}
                          </TableCell>
                          <TableCell>
                            <Select defaultValue={milestone.status}>
                              <SelectTrigger className="w-[130px]">
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
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {milestone.qb_last_sync ? formatDateTime(milestone.qb_last_sync) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            
            {/* Job Cost Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle>Job Cost Snapshot</CardTitle>
                <CardDescription>Financial summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contract Value</span>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(project.contract_value)}</span>
                    <Badge variant="outline" className="ml-2 text-xs text-blue-600">Actual</Badge>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Material Cost</span>
                  <div className="text-right">
                    <span className="font-medium">
                      {formatCurrency(project.materials.reduce((sum, m) => sum + (m.cost_estimate || 0), 0))}
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs text-green-600">Estimated</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Equipment Cost</span>
                  <div className="text-right">
                    <span className="font-medium">
                      {formatCurrency(project.equipment.reduce((sum, e) => sum + ((e.daily_rate || 0) * 30), 0))}
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs text-green-600">Estimated</Badge>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Margin</span>
                  <div className="text-right">
                    <span className="font-medium text-muted-foreground">••••</span>
                    <Badge variant="outline" className="ml-2 text-xs text-gray-500">Restricted</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Data sources: Contract from Proposal, Costs from sub-tables
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Closeout Tab */}
        <TabsContent value="closeout" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Closeout Checklist
              </CardTitle>
              <CardDescription>
                {project.closeout_checklist.filter(i => i.status === "Complete" || i.status === "Waived").length} of {project.closeout_checklist.length} items complete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]" />
                    <TableHead>Item</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.closeout_checklist.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={item.status === "Complete"}
                          disabled={item.status === "Waived"}
                          onCheckedChange={() => {
                            toast.success("Item completed")
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.is_required ? (
                          <Badge variant="destructive">Required</Badge>
                        ) : (
                          <Badge variant="secondary">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === "Complete" ? "default" : item.status === "Waived" ? "secondary" : "outline"}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.completed_date ? (
                          <span className="text-sm">{formatDate(item.completed_date)}</span>
                        ) : item.waived_reason ? (
                          <span className="text-sm text-muted-foreground">Waived: {item.waived_reason}</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {item.status === "Required" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast.success("Item waived")}
                          >
                            Waive
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {closeoutIncomplete > 0 && (
                <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  <AlertCircle className="mr-2 inline-block h-4 w-4" />
                  {closeoutIncomplete} required items must be completed or waived before closing this project.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Documents
                </CardTitle>
                <CardDescription>
                  All documents attached to this project
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <p className="py-8 text-center text-muted-foreground">
                No documents uploaded yet
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Blocked Status Dialog */}
      <Dialog open={blockedDialogOpen} onOpenChange={setBlockedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Project</DialogTitle>
            <DialogDescription>
              Please provide a reason and next action for blocking this project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Reason for Blocking</Label>
              <Textarea
                placeholder="Why is this project being blocked?"
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Next Action</Label>
              <Input
                placeholder="What needs to happen to unblock?"
                value={blockedNextAction}
                onChange={(e) => setBlockedNextAction(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockedDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlockedSubmit}>
              Block Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Flag Exception Dialog */}
      <Dialog open={exceptionDialogOpen} onOpenChange={setExceptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Material Exception</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Issue Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Missing">Missing</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                  <SelectItem value="Short">Short</SelectItem>
                  <SelectItem value="Overage">Overage</SelectItem>
                  <SelectItem value="Wrong Item">Wrong Item</SelectItem>
                  <SelectItem value="Changed">Changed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea placeholder="Describe the issue..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExceptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success("Exception flagged")
              setExceptionDialogOpen(false)
            }}>
              Flag Exception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
