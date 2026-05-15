'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  FileText,
  Image,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  ExternalLink,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { getReportById } from '@/lib/mock-inspection-data'
import type { 
  FacilityReport, 
  ReportSection, 
  ReportRecommendation,
  ReportStatus 
} from '@/types/inspection'
import { toast } from 'sonner'

// =============================================================================
// Report Detail Page - Facility Condition Report Workspace
// =============================================================================

export default function ReportDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  const [report, setReport] = useState<FacilityReport | null>(() => getReportById(id) || null)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [opportunityDialogOpen, setOpportunityDialogOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<ReportRecommendation | null>(null)

  if (!report) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Report not found</div>
      </div>
    )
  }

  const updateSection = (sectionId: string, content: string) => {
    setReport({
      ...report,
      sections: report.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content, isEdited: true }
          : s
      ),
    })
  }

  const updateRecommendation = (recId: string, updates: Partial<ReportRecommendation>) => {
    setReport({
      ...report,
      recommendations: report.recommendations.map(r =>
        r.id === recId ? { ...r, ...updates } : r
      ),
    })
  }

  const handleAdvanceStatus = (newStatus: ReportStatus) => {
    setReport({ ...report, status: newStatus })
    toast.success(`Status updated to ${newStatus}`)
  }

  const handleCreateOpportunity = (rec: ReportRecommendation) => {
    setSelectedRecommendation(rec)
    setOpportunityDialogOpen(true)
  }

  const confirmCreateOpportunity = () => {
    if (!selectedRecommendation) return
    
    // In real app, this would create a proposal via server action
    updateRecommendation(selectedRecommendation.id, {
      linkedProposalId: `PROP-2024-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
    })
    
    toast.success('Opportunity Created', {
      description: 'A new proposal has been created in the pipeline'
    })
    setOpportunityDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{report.name}</h1>
              <StatusBadge status={report.status} />
            </div>
            <p className="text-muted-foreground">
              {report.customerName} - {report.tankName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {report.status === 'Draft' && (
            <Button onClick={() => handleAdvanceStatus('In Review')}>
              Submit for Review
            </Button>
          )}
          {report.status === 'In Review' && (
            <Button onClick={() => handleAdvanceStatus('Approved')}>
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          {report.status === 'Approved' && (
            <Button onClick={() => handleAdvanceStatus('Delivered')}>
              <Send className="h-4 w-4 mr-2" />
              Mark as Delivered
            </Button>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cover">Cover Info</TabsTrigger>
          <TabsTrigger value="sections">Report Sections</TabsTrigger>
          <TabsTrigger value="recommendations">
            Recommendations
            {report.recommendations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {report.recommendations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="linked">Linked Records</TabsTrigger>
        </TabsList>

        {/* Cover Info */}
        <TabsContent value="cover">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Customer</Label>
                    <p className="font-medium">{report.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Site</Label>
                    <p className="font-medium">{report.siteName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tank</Label>
                    <p className="font-medium">{report.tankName}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Inspection Date</Label>
                    <p className="font-medium">
                      {new Date(report.inspectionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Report Date</Label>
                    <p className="font-medium">
                      {new Date(report.reportDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Owner</Label>
                    <p className="font-medium">{report.ownerName}</p>
                  </div>
                </div>
              </div>
              
              {report.approvedAt && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    Approved by {report.approvedByName} on{' '}
                    {new Date(report.approvedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Sections */}
        <TabsContent value="sections" className="space-y-4">
          {report.sections.map(section => (
            <ReportSectionCard
              key={section.id}
              section={section}
              isEditing={editingSectionId === section.id}
              onEdit={() => setEditingSectionId(section.id)}
              onSave={(content) => {
                updateSection(section.id, content)
                setEditingSectionId(null)
              }}
              onCancel={() => setEditingSectionId(null)}
              readonly={report.status !== 'Draft' && report.status !== 'In Review'}
            />
          ))}
          
          {report.sections.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p>No sections generated yet</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          {report.recommendations.map(rec => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onUpdate={(updates) => updateRecommendation(rec.id, updates)}
              onCreateOpportunity={() => handleCreateOpportunity(rec)}
              readonly={report.status !== 'Draft' && report.status !== 'In Review'}
            />
          ))}
          
          {report.recommendations.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
                <p>No recommendations yet</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recommendation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Linked Records */}
        <TabsContent value="linked">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linked Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              {report.linkedProposals.length > 0 ? (
                <div className="space-y-2">
                  {report.linkedProposals.map(proposalId => (
                    <Link
                      key={proposalId}
                      href={`/proposals/${proposalId}`}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-mono">{proposalId}</span>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No linked proposals yet
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Source Inspection</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/inspections/${report.inspectionId}`}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-mono">{report.inspectionId}</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Opportunity Dialog */}
      <Dialog open={opportunityDialogOpen} onOpenChange={setOpportunityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Opportunity from Recommendation</DialogTitle>
            <DialogDescription>
              This will create a new proposal in the pipeline linked to this report.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecommendation && (
            <div className="py-4 space-y-4">
              <div>
                <Label>Recommendation</Label>
                <p className="text-sm mt-1">{selectedRecommendation.title}</p>
              </div>
              
              <div>
                <Label>Estimated Value</Label>
                <p className="text-sm mt-1">
                  ${selectedRecommendation.estimatedCostLow?.toLocaleString()} - 
                  ${selectedRecommendation.estimatedCostHigh?.toLocaleString()}
                </p>
              </div>
              
              <div>
                <Label htmlFor="owner">Assigned Owner</Label>
                <Select defaultValue="current">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current User</SelectItem>
                    <SelectItem value="sales">Sales Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="followup">Follow-up Date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  defaultValue={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpportunityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreateOpportunity}>
              Create Opportunity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// =============================================================================
// Report Section Card
// =============================================================================

function ReportSectionCard({
  section,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  readonly,
}: {
  section: ReportSection
  isEditing: boolean
  onEdit: () => void
  onSave: (content: string) => void
  onCancel: () => void
  readonly: boolean
}) {
  const [editContent, setEditContent] = useState(section.content)
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <CardTitle className="text-base">{section.title}</CardTitle>
              {section.isEdited && (
                <Badge variant="secondary">Edited</Badge>
              )}
              {section.autoGeneratedFrom && (
                <Badge variant="outline">Auto-generated</Badge>
              )}
            </div>
            {section.photos.length > 0 && (
              <Badge variant="secondary">
                <Image className="h-3 w-3 mr-1" />
                {section.photos.length}
              </Badge>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button onClick={() => onSave(editContent)}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
                
                {!readonly && (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// =============================================================================
// Recommendation Card
// =============================================================================

function RecommendationCard({
  recommendation,
  onUpdate,
  onCreateOpportunity,
  readonly,
}: {
  recommendation: ReportRecommendation
  onUpdate: (updates: Partial<ReportRecommendation>) => void
  onCreateOpportunity: () => void
  readonly: boolean
}) {
  const priorityColors = {
    Critical: 'bg-red-100 text-red-800 border-red-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Medium: 'bg-amber-100 text-amber-800 border-amber-300',
    Low: 'bg-green-100 text-green-800 border-green-300',
  }

  return (
    <Card className={cn(
      'border-l-4',
      recommendation.priority === 'Critical' && 'border-l-red-500',
      recommendation.priority === 'High' && 'border-l-orange-500',
      recommendation.priority === 'Medium' && 'border-l-amber-500',
      recommendation.priority === 'Low' && 'border-l-green-500',
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{recommendation.title}</h3>
              <Badge className={priorityColors[recommendation.priority]}>
                {recommendation.priority}
              </Badge>
              {recommendation.isDraft && (
                <Badge variant="secondary">Draft</Badge>
              )}
              {recommendation.linkedProposalId && (
                <Badge variant="outline" className="border-blue-500 text-blue-700">
                  Linked to Proposal
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {recommendation.description}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              {recommendation.estimatedCostLow && (
                <div>
                  <span className="text-muted-foreground">Est. Cost: </span>
                  <span className="font-medium">
                    ${recommendation.estimatedCostLow.toLocaleString()} - 
                    ${recommendation.estimatedCostHigh?.toLocaleString()}
                  </span>
                </div>
              )}
              {recommendation.timeframe && (
                <div>
                  <span className="text-muted-foreground">Timeframe: </span>
                  <span className="font-medium">{recommendation.timeframe}</span>
                </div>
              )}
            </div>
            
            {(recommendation.oshaReference || recommendation.awwaReference) && (
              <div className="flex gap-2 mt-2">
                {recommendation.oshaReference && (
                  <Badge variant="outline" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    OSHA {recommendation.oshaReference}
                  </Badge>
                )}
                {recommendation.awwaReference && (
                  <Badge variant="outline" className="text-xs">
                    AWWA {recommendation.awwaReference}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {!readonly && !recommendation.linkedProposalId && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCreateOpportunity}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Opportunity
            </Button>
          )}
          
          {recommendation.linkedProposalId && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/proposals/${recommendation.linkedProposalId}`}>
                View Proposal
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
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
