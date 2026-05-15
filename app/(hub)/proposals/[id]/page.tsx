"use client"

import { useState, useTransition, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  Send,
  RefreshCw,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { mockPipelineProposals } from "@/lib/mock-pipeline"
import { mockCustomers, mockSites, mockTanks } from "@/lib/mock-data"
import {
  updateProposal,
  updateProposalStatus,
  reviveDormantProposal,
  addFollowUpNote,
} from "@/lib/actions/proposals"
import { toast } from "sonner"
import {
  STATUS_COLORS,
  TYPE_COLORS,
  PROPOSAL_STATUSES,
  LOSS_REASONS,
} from "@/types/pipeline"
import type { ProposalStatus } from "@/types/cunningham"

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [newFollowUp, setNewFollowUp] = useState("")

  // Find proposal from mock data
  const proposal = mockPipelineProposals.find((p) => p.name === id)
  const customer = proposal ? mockCustomers.find((c) => c.name === proposal.customer) : null
  const site = proposal?.site ? mockSites.find((s) => s.name === proposal.site) : null
  const tank = proposal?.tank ? mockTanks.find((t) => t.name === proposal.tank) : null

  if (!proposal) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Proposal Not Found</h2>
          <p className="text-muted-foreground">The proposal you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild className="mt-4">
            <Link href="/pipeline">Back to Pipeline</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleStatusChange = async (newStatus: ProposalStatus) => {
    startTransition(async () => {
      const result = await updateProposalStatus(id, newStatus)
      if (result.success) {
        toast.success("Status Updated", {
          description: result.message || `Proposal moved to ${newStatus}`,
        })
      } else {
        toast.error("Error", { description: result.error })
      }
    })
  }

  const handleRevive = async () => {
    startTransition(async () => {
      const result = await reviveDormantProposal(id)
      if (result.success && result.data) {
        toast.success("Proposal Revived", {
          description: "A new linked proposal has been created.",
        })
        router.push(`/proposals/${result.data.name}`)
      } else {
        toast.error("Error", { description: result.error })
      }
    })
  }

  const handleAddFollowUp = async () => {
    if (!newFollowUp.trim()) return
    startTransition(async () => {
      const result = await addFollowUpNote(id, newFollowUp)
      if (result.success) {
        toast.success("Follow-up Added")
        setNewFollowUp("")
      } else {
        toast.error("Error", { description: result.error })
      }
    })
  }

  const isEngineered = proposal.proposal_type === "Engineered Spec"
  const isClosed = ["Won", "Lost", "Expired", "Dormant"].includes(proposal.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/pipeline">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{proposal.proposal_number}</h1>
              <Badge
                variant="outline"
                className={cn("text-xs", STATUS_COLORS[proposal.status])}
              >
                {proposal.status}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs", TYPE_COLORS[proposal.proposal_type])}
              >
                {proposal.proposal_type}
              </Badge>
              {proposal.is_stale && (
                <Badge variant="outline" className="border-yellow-400 bg-yellow-50 text-xs text-yellow-700">
                  Stale
                </Badge>
              )}
              {proposal.is_revived && (
                <Badge variant="outline" className="border-green-400 bg-green-50 text-xs text-green-700">
                  Revived
                </Badge>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">
              {proposal.customer_name} &bull; {proposal.site_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed && (
            <>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF
              </Button>
              <Button variant="outline" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Send to Customer
              </Button>
            </>
          )}
          {proposal.status === "Dormant" && (
            <Button size="sm" onClick={handleRevive} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Revive Proposal
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isClosed && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange("Won")}>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    Mark as Won
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("Lost")}>
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Mark as Lost
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("Dormant")}>
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    Mark as Dormant
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Proposal
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Proposal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scope">Scope & Pricing</TabsTrigger>
          {isEngineered && <TabsTrigger value="engineered">Engineered Bid</TabsTrigger>}
          <TabsTrigger value="followup">Follow-Up Log</TabsTrigger>
          {isClosed && <TabsTrigger value="outcome">Outcome</TabsTrigger>}
          <TabsTrigger value="linked">Linked Records</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Proposal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Customer</Label>
                    <p className="font-medium">
                      <Link href={`/customers/${proposal.customer}`} className="hover:underline">
                        {proposal.customer_name}
                      </Link>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Site</Label>
                    <p className="font-medium">
                      {proposal.site && (
                        <Link href={`/sites/${proposal.site}`} className="hover:underline">
                          {proposal.site_name}
                        </Link>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Type</Label>
                    <p className="font-medium">{proposal.proposal_type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Owner</Label>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-mwi-accent text-[10px] text-mwi-navy">
                          {proposal.owner_name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{proposal.owner_name}</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-xs">Title</Label>
                  <p className="font-medium">{proposal.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Scope of Work</Label>
                  <p className="text-sm">{proposal.scope_of_work || "-"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Value & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-muted-foreground text-sm">Total Value</p>
                  <p className="text-3xl font-bold">
                    {(proposal.total || 0).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Sent Date</Label>
                    <p className="font-medium">
                      {proposal.sent_date
                        ? new Date(proposal.sent_date).toLocaleDateString()
                        : "Not sent"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Valid Until</Label>
                    <p className="font-medium">
                      {proposal.valid_until
                        ? new Date(proposal.valid_until).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Age</Label>
                    <p className="font-medium">{proposal.age_days} days</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Next Follow-Up</Label>
                    <p className={cn(
                      "font-medium",
                      proposal.next_follow_up_date && new Date(proposal.next_follow_up_date) < new Date() && "text-red-600"
                    )}>
                      {proposal.next_follow_up_date
                        ? new Date(proposal.next_follow_up_date).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scope & Pricing Tab */}
        <TabsContent value="scope" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Line Items</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Line Item
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24 text-right">Qty</TableHead>
                    <TableHead className="w-24">Unit</TableHead>
                    <TableHead className="w-32 text-right">Unit Price</TableHead>
                    <TableHead className="w-32 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Mock line items */}
                  <TableRow>
                    <TableCell>Surface preparation - power tool cleaning</TableCell>
                    <TableCell className="text-right">2,500</TableCell>
                    <TableCell>SF</TableCell>
                    <TableCell className="text-right">$12.00</TableCell>
                    <TableCell className="text-right font-medium">$30,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Zinc-rich primer application</TableCell>
                    <TableCell className="text-right">2,500</TableCell>
                    <TableCell>SF</TableCell>
                    <TableCell className="text-right">$18.00</TableCell>
                    <TableCell className="text-right font-medium">$45,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Epoxy intermediate coat</TableCell>
                    <TableCell className="text-right">2,500</TableCell>
                    <TableCell>SF</TableCell>
                    <TableCell className="text-right">$15.00</TableCell>
                    <TableCell className="text-right font-medium">$37,500</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Polyurethane topcoat</TableCell>
                    <TableCell className="text-right">2,500</TableCell>
                    <TableCell>SF</TableCell>
                    <TableCell className="text-right">$22.00</TableCell>
                    <TableCell className="text-right font-medium">$55,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mobilization/Demobilization</TableCell>
                    <TableCell className="text-right">1</TableCell>
                    <TableCell>LS</TableCell>
                    <TableCell className="text-right">$25,000</TableCell>
                    <TableCell className="text-right font-medium">$25,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>$192,500</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax (0%)</span>
                    <span>$0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {(proposal.total || 0).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engineered Bid Tab (conditional) */}
        {isEngineered && (
          <TabsContent value="engineered" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engineered Bid Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">Bid Source</Label>
                    <p className="font-medium">Bid Ocean</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Bid Due Date</Label>
                    <p className="font-medium">
                      {proposal.bid_due_date
                        ? new Date(proposal.bid_due_date).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Bid Opening</Label>
                    <p className="font-medium">
                      {proposal.bid_opening_date
                        ? new Date(proposal.bid_opening_date).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Engineer of Record</Label>
                    <p className="font-medium">{proposal.engineer_of_record || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Bonding Required</Label>
                    <p className="font-medium">
                      {proposal.bonding_required
                        ? `Yes - ${(proposal.bond_amount || 0).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}`
                        : "No"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Prevailing Wage</Label>
                    <p className="font-medium">{proposal.prevailing_wage ? "Yes" : "No"}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-xs">Required Documents Checklist</Label>
                  <div className="mt-2 space-y-2">
                    {["Bid Bond", "Non-Collusion Affidavit", "E-Verify Certificate", "Insurance Certificate"].map((doc) => (
                      <div key={doc} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{doc}</span>
                      </div>
                    ))}
                    {["Performance Bond", "Payment Bond"].map((doc) => (
                      <div key={doc} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{doc} (pending)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-xs">Submission Status</Label>
                  <Badge variant="outline" className="mt-1">
                    {proposal.status === "Won" ? "Awarded" : proposal.status === "Lost" ? "Not Awarded" : "Submitted"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Follow-Up Log Tab */}
        <TabsContent value="followup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Follow-Up Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new follow-up */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a follow-up note..."
                  value={newFollowUp}
                  onChange={(e) => setNewFollowUp(e.target.value)}
                  className="min-h-20"
                />
                <Button onClick={handleAddFollowUp} disabled={isPending || !newFollowUp.trim()}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>
              <Separator />
              {/* Follow-up history */}
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {proposal.follow_up_notes && (
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-mwi-accent text-[10px] text-mwi-navy">MT</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">Mike Thompson</span>
                        </div>
                        <span className="text-muted-foreground">
                          {proposal.last_follow_up_date
                            ? new Date(proposal.last_follow_up_date).toLocaleDateString()
                            : "Today"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{proposal.follow_up_notes}</p>
                    </div>
                  )}
                  {/* Mock historical notes */}
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-mwi-accent text-[10px] text-mwi-navy">SJ</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">Sarah Johnson</span>
                      </div>
                      <span className="text-muted-foreground">Feb 15, 2024</span>
                    </div>
                    <p className="mt-2 text-sm">Spoke with project manager. They are reviewing with the board next week.</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-mwi-accent text-[10px] text-mwi-navy">MT</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">Mike Thompson</span>
                      </div>
                      <span className="text-muted-foreground">Feb 1, 2024</span>
                    </div>
                    <p className="mt-2 text-sm">Initial proposal sent via email. Confirmed receipt.</p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outcome Tab (for closed proposals) */}
        {isClosed && (
          <TabsContent value="outcome" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Outcome Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground text-xs">Outcome</Label>
                    <Badge
                      variant="outline"
                      className={cn("mt-1", STATUS_COLORS[proposal.status])}
                    >
                      {proposal.status}
                    </Badge>
                  </div>
                  {proposal.status === "Won" && proposal.won_date && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Won Date</Label>
                      <p className="font-medium">{new Date(proposal.won_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {proposal.status === "Lost" && (
                    <>
                      <div>
                        <Label className="text-muted-foreground text-xs">Lost Date</Label>
                        <p className="font-medium">
                          {proposal.lost_date ? new Date(proposal.lost_date).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Loss Reason</Label>
                        <p className="font-medium">{proposal.lost_reason || "-"}</p>
                      </div>
                      {proposal.competitor && (
                        <div>
                          <Label className="text-muted-foreground text-xs">Competitor</Label>
                          <p className="font-medium">{proposal.competitor}</p>
                        </div>
                      )}
                    </>
                  )}
                  {proposal.status === "Dormant" && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground text-xs">Notes</Label>
                      <p className="text-sm">{proposal.notes || "No notes"}</p>
                    </div>
                  )}
                </div>
                {proposal.is_revived && proposal.original_proposal && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm text-green-800">
                      This proposal was revived from{" "}
                      <Link href={`/proposals/${proposal.original_proposal}`} className="font-medium underline">
                        {proposal.original_proposal}
                      </Link>
                    </p>
                  </div>
                )}
                {proposal.revived_to && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      This proposal has been revived as{" "}
                      <Link href={`/proposals/${proposal.revived_to}`} className="font-medium underline">
                        {proposal.revived_to}
                      </Link>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Linked Records Tab */}
        <TabsContent value="linked" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-medium">{proposal.customer_name}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/customers/${proposal.customer}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                {proposal.site && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Site</p>
                        <p className="font-medium">{proposal.site_name}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/sites/${proposal.site}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
                {proposal.tank && tank && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Tank</p>
                        <p className="font-medium">{tank.tank_name}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/sites/${proposal.site}/tanks/${proposal.tank}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resulting Records</CardTitle>
              </CardHeader>
              <CardContent>
                {proposal.status === "Won" ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
                    <p className="mt-2 font-medium text-green-800">Project Created</p>
                    <Button variant="link" size="sm" className="text-green-700">
                      View Project
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                    <p className="text-sm">No resulting records yet.</p>
                    <p className="text-xs">A project will be created when this proposal is won.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Documents</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium">Proposal_{proposal.proposal_number}.pdf</p>
                      <p className="text-xs text-muted-foreground">Generated Feb 1, 2024 &bull; 2.4 MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
                {isEngineered && (
                  <>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">Project_Specifications.pdf</p>
                          <p className="text-xs text-muted-foreground">Uploaded Jan 28, 2024 &bull; 5.1 MB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">Addendum_1.pdf</p>
                          <p className="text-xs text-muted-foreground">Uploaded Feb 5, 2024 &bull; 0.8 MB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
