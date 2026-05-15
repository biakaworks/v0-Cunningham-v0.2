"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DollarSign, MapPin, Briefcase, AlertTriangle, Clock, FileText,
  ClipboardCheck, CreditCard, ChevronRight, Plus, Search, Map,
  Users, Building2, ExternalLink, TrendingUp, AlertCircle
} from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { ActivityTimeline, type ActivityItem } from "@/components/records/activity-timeline"

// =============================================================================
// Mock Dashboard Data
// =============================================================================

const PIPELINE_DATA = {
  engineered: { count: 8, value: 2450000 },
  negotiated: { count: 15, value: 1850000 },
  total: 4300000,
  staleCount: 3,
}

const SERVICE_DUE_DATA = {
  count: 12,
  locations: [
    { lat: 39.78, lng: -89.65, name: "Springfield Tower" },
    { lat: 41.85, lng: -87.65, name: "Chicago North" },
    { lat: 40.12, lng: -88.24, name: "Champaign Main" },
  ]
}

const PROJECT_STATUS_DATA = [
  { status: "Setup", count: 2, color: "#6366f1" },
  { status: "Scheduled", count: 3, color: "#8b5cf6" },
  { status: "Active", count: 5, color: "#22c55e" },
  { status: "Blocked", count: 1, color: "#ef4444" },
  { status: "Completed", count: 8, color: "#64748b" },
  { status: "Billing Pending", count: 2, color: "#f59e0b" },
]

const ATTENTION_ITEMS = {
  overdueFollowUps: [
    { id: "1", title: "Springfield Tower Coating", customer: "City of Springfield", dueDate: "2024-04-10", owner: "Sarah Jones" },
    { id: "2", title: "Riverside Tank Rehab", customer: "Riverside Water", dueDate: "2024-04-08", owner: "John Smith" },
  ],
  staleProposals: [
    { id: "3", title: "Oak Park Interior Coating", customer: "Oak Park Municipal", sentDate: "2024-01-15", value: 185000, owner: "Sarah Jones" },
  ],
  blockedProjects: [
    { id: "4", title: "Greenfield Tank Repair", reason: "Waiting on materials", owner: "Mike Davis" },
  ],
  pendingInspections: [
    { id: "5", title: "Lake View Annual Inspection", tank: "Lake View Tower", submittedDate: "2024-04-14", inspector: "Carlos Mendez" },
  ],
  reportsAwaitingApproval: [
    { id: "6", title: "Springfield Annual Report", customer: "City of Springfield", submittedDate: "2024-04-13", preparedBy: "John Smith" },
  ],
  failedSyncs: [] as { id: string; milestone: string; project: string; error: string }[],
}

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "1", type: "proposal", title: "Proposal created for Riverside Tank Rehab", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), user: "Sarah Jones", status: "pending" },
  { id: "2", type: "inspection", title: "Inspection completed at Springfield Main Tower", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), user: "Carlos Mendez", status: "success" },
  { id: "3", type: "project", title: "Oak Park Rehab marked as Completed", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), user: "Mike Davis", status: "success" },
  { id: "4", type: "payment", title: "Payment received for Greenfield Milestone 2", description: "$45,000", timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), user: "Lisa Chen", status: "success" },
  { id: "5", type: "report", title: "Report submitted for review", timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), user: "John Smith", status: "pending" },
  { id: "6", type: "status_change", title: "Proposal status changed to Won", description: "Maple Heights Tower Coating", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), user: "Sarah Jones", status: "success" },
  { id: "7", type: "service_visit", title: "Service visit scheduled", description: "Westbrook Industrial Standpipe", timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), user: "Mike Davis" },
  { id: "8", type: "document", title: "Contract uploaded", timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), user: "Tom Wilson" },
]

const PIE_COLORS = ["#0B2545", "#13315C"]

export default function DashboardPage() {
  const totalAttentionItems = 
    ATTENTION_ITEMS.overdueFollowUps.length +
    ATTENTION_ITEMS.staleProposals.length +
    ATTENTION_ITEMS.blockedProjects.length +
    ATTENTION_ITEMS.pendingInspections.length +
    ATTENTION_ITEMS.reportsAwaitingApproval.length +
    ATTENTION_ITEMS.failedSyncs.length

  const pieData = [
    { name: "Engineered", value: PIPELINE_DATA.engineered.value },
    { name: "Negotiated", value: PIPELINE_DATA.negotiated.value },
  ]

  const hasBlockedProjects = PROJECT_STATUS_DATA.some(s => s.status === "Blocked" && s.count > 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pulse Overview</h1>
          <p className="text-muted-foreground">Cunningham Operations Hub</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/pipeline?new=true">
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/inspections?new=true">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Start Inspection
            </Link>
          </Button>
        </div>
      </div>

      {/* Above the Fold - 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Open Pipeline Value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Open Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">
                  ${(PIPELINE_DATA.total / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-muted-foreground">Open proposals</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[0] }} />
                    <span>Engineered: {PIPELINE_DATA.engineered.count}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[1] }} />
                    <span>Negotiated: {PIPELINE_DATA.negotiated.count}</span>
                  </div>
                </div>
              </div>
            </div>
            {PIPELINE_DATA.staleCount > 0 && (
              <div className="mt-3 flex items-center gap-2 text-yellow-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{PIPELINE_DATA.staleCount} stale proposals</span>
              </div>
            )}
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/pipeline">Open pipeline <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Service Due This Quarter */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Service Due This Quarter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{SERVICE_DUE_DATA.count}</p>
            <p className="text-sm text-muted-foreground">Customers due for service</p>
            
            {/* Mini Map Placeholder */}
            <div className="mt-4 h-24 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />
              {SERVICE_DUE_DATA.locations.map((loc, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full"
                  style={{
                    left: `${30 + i * 20}%`,
                    top: `${40 + (i % 2) * 20}%`,
                  }}
                />
              ))}
              <Map className="h-6 w-6 text-muted-foreground relative z-10" />
            </div>

            <div className="flex gap-2 mt-3">
              <Button variant="link" className="px-0" asChild>
                <Link href="/service">Open service planning <ChevronRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="link" className="px-0" asChild>
                <Link href="/map">Open full map <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active Projects */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Active Projects
              {hasBlockedProjects && (
                <Badge variant="destructive" className="text-xs ml-auto">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Blocked
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PROJECT_STATUS_DATA} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="status" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {PROJECT_STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/projects">Open projects <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Attention Items */}
      {totalAttentionItems > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Attention Items
              <Badge variant="secondary">{totalAttentionItems}</Badge>
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overdue Follow-Ups */}
            {ATTENTION_ITEMS.overdueFollowUps.length > 0 && (
              <AttentionSection
                title="Overdue Follow-Ups"
                icon={<Clock className="h-4 w-4 text-red-500" />}
                count={ATTENTION_ITEMS.overdueFollowUps.length}
              >
                {ATTENTION_ITEMS.overdueFollowUps.map(item => (
                  <AttentionItem
                    key={item.id}
                    title={item.title}
                    subtitle={`${item.customer} - Due ${format(new Date(item.dueDate), 'MMM d')}`}
                    owner={item.owner}
                    href={`/proposals/${item.id}`}
                  />
                ))}
              </AttentionSection>
            )}

            {/* Stale Proposals */}
            {ATTENTION_ITEMS.staleProposals.length > 0 && (
              <AttentionSection
                title="Stale Proposals"
                icon={<FileText className="h-4 w-4 text-yellow-500" />}
                count={ATTENTION_ITEMS.staleProposals.length}
              >
                {ATTENTION_ITEMS.staleProposals.map(item => (
                  <AttentionItem
                    key={item.id}
                    title={item.title}
                    subtitle={`${item.customer} - Sent ${format(new Date(item.sentDate), 'MMM d')}`}
                    owner={item.owner}
                    href={`/proposals/${item.id}`}
                    badge={`$${(item.value / 1000).toFixed(0)}K`}
                  />
                ))}
              </AttentionSection>
            )}

            {/* Blocked Projects */}
            {ATTENTION_ITEMS.blockedProjects.length > 0 && (
              <AttentionSection
                title="Blocked Projects"
                icon={<AlertCircle className="h-4 w-4 text-red-500" />}
                count={ATTENTION_ITEMS.blockedProjects.length}
              >
                {ATTENTION_ITEMS.blockedProjects.map(item => (
                  <AttentionItem
                    key={item.id}
                    title={item.title}
                    subtitle={item.reason}
                    owner={item.owner}
                    href={`/projects/${item.id}`}
                    variant="destructive"
                  />
                ))}
              </AttentionSection>
            )}

            {/* Inspections Pending Office Review */}
            {ATTENTION_ITEMS.pendingInspections.length > 0 && (
              <AttentionSection
                title="Inspections Pending Office Review"
                icon={<ClipboardCheck className="h-4 w-4 text-blue-500" />}
                count={ATTENTION_ITEMS.pendingInspections.length}
              >
                {ATTENTION_ITEMS.pendingInspections.map(item => (
                  <AttentionItem
                    key={item.id}
                    title={item.title}
                    subtitle={`${item.tank} - Submitted ${format(new Date(item.submittedDate), 'MMM d')}`}
                    owner={item.inspector}
                    href={`/inspections/${item.id}`}
                  />
                ))}
              </AttentionSection>
            )}

            {/* Reports Awaiting Approval */}
            {ATTENTION_ITEMS.reportsAwaitingApproval.length > 0 && (
              <AttentionSection
                title="Reports Awaiting Approval"
                icon={<FileText className="h-4 w-4 text-purple-500" />}
                count={ATTENTION_ITEMS.reportsAwaitingApproval.length}
              >
                {ATTENTION_ITEMS.reportsAwaitingApproval.map(item => (
                  <AttentionItem
                    key={item.id}
                    title={item.title}
                    subtitle={`${item.customer} - Submitted ${format(new Date(item.submittedDate), 'MMM d')}`}
                    owner={item.preparedBy}
                    href={`/reports/${item.id}`}
                  />
                ))}
              </AttentionSection>
            )}

            {/* Failed QuickBooks Syncs */}
            {ATTENTION_ITEMS.failedSyncs.length > 0 && (
              <AttentionSection
                title="Failed QuickBooks Syncs"
                icon={<CreditCard className="h-4 w-4 text-red-500" />}
                count={ATTENTION_ITEMS.failedSyncs.length}
              >
                {ATTENTION_ITEMS.failedSyncs.map(item => (
                  <AttentionItem
                    key={item.id}
                    title={item.milestone}
                    subtitle={`${item.project} - ${item.error}`}
                    href={`/billing`}
                    variant="destructive"
                  />
                ))}
              </AttentionSection>
            )}
          </CardContent>
        </Card>
      )}

      {/* Below the Fold */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <ActivityTimeline
          title="Recent Activity"
          activities={RECENT_ACTIVITY}
          maxHeight={400}
        />

        {/* Service Map Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Tower Map</CardTitle>
            <CardDescription>All Cunningham service towers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />
              {/* Simulated map markers */}
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-2 h-2 rounded-full",
                    i % 4 === 0 ? "bg-red-500" : i % 3 === 0 ? "bg-yellow-500" : "bg-green-500"
                  )}
                  style={{
                    left: `${15 + Math.random() * 70}%`,
                    top: `${15 + Math.random() * 70}%`,
                  }}
                />
              ))}
              <div className="relative z-10 text-center">
                <Map className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Interactive map preview</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/map">
                Open full map
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Row */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button variant="outline" asChild>
              <Link href="/pipeline?new=true">
                <Plus className="h-4 w-4 mr-2" />
                Create Proposal
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/inspections?new=true">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Start Inspection
              </Link>
            </Button>
            <Button variant="outline" onClick={() => {
              // Trigger Cmd+K palette
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
              document.dispatchEvent(event)
            }}>
              <Search className="h-4 w-4 mr-2" />
              Search Customer
              <kbd className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">Cmd+K</kbd>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AttentionSection({ 
  title, 
  icon, 
  count, 
  children 
}: { 
  title: string
  icon: React.ReactNode
  count: number
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-medium text-sm">{title}</h3>
        <Badge variant="secondary" className="text-xs">{count}</Badge>
      </div>
      <div className="space-y-2 pl-6">
        {children}
      </div>
    </div>
  )
}

function AttentionItem({
  title,
  subtitle,
  owner,
  href,
  badge,
  variant = "default"
}: {
  title: string
  subtitle: string
  owner?: string
  href: string
  badge?: string
  variant?: "default" | "destructive"
}) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      variant === "destructive" && "border-red-200 bg-red-50"
    )}>
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {badge && <Badge variant="outline">{badge}</Badge>}
        {owner && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {owner}
          </div>
        )}
        <Button variant="ghost" size="sm" asChild>
          <Link href={href}>Open</Link>
        </Button>
      </div>
    </div>
  )
}
