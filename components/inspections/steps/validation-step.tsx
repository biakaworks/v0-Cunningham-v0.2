'use client'

import { useState } from 'react'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Send,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { t, type Language } from '@/lib/i18n/inspection-labels'
import type { 
  Inspection, 
  ValidationWaiver,
  ChecklistCategory 
} from '@/types/inspection'

const REQUIRED_SECTIONS: ChecklistCategory[] = [
  'wet_interior', 'exterior', 'foundation', 'coatings'
]

interface ValidationStepProps {
  inspection: Inspection
  language: Language
  onUpdate: (updates: Partial<Inspection>) => void
  onSubmit: () => void
  onBack: () => void
}

interface ValidationIssue {
  id: string
  type: 'section' | 'measurement' | 'photo'
  field: string
  label: string
  severity: 'error' | 'warning'
}

export function ValidationStep({ 
  inspection, 
  language, 
  onUpdate, 
  onSubmit, 
  onBack 
}: ValidationStepProps) {
  const [waiverDialogOpen, setWaiverDialogOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<ValidationIssue | null>(null)
  const [waiverReason, setWaiverReason] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('issues')

  // Validate inspection
  const issues: ValidationIssue[] = []
  
  // Check required sections
  REQUIRED_SECTIONS.forEach(category => {
    const section = inspection.sections[category]
    if (!section.isComplete) {
      issues.push({
        id: `section-${category}`,
        type: 'section',
        field: category,
        label: `${t(category, language)} - ${t('missing', language)}`,
        severity: 'error',
      })
    }
    if (section.isRequired && section.photos.length === 0) {
      issues.push({
        id: `photo-${category}`,
        type: 'photo',
        field: category,
        label: `${t(category, language)} - ${t('error_photo_required', language)}`,
        severity: 'warning',
      })
    }
  })

  // Check measurements
  inspection.measurements.forEach(m => {
    if (m.value === undefined) {
      issues.push({
        id: `measurement-${m.type}`,
        type: 'measurement',
        field: m.type,
        label: `${t(m.type as any, language)} - ${t('error_measurement_required', language)}`,
        severity: 'warning',
      })
    }
  })

  // Check for unassigned photos
  if (inspection.unassignedPhotos.length > 0) {
    issues.push({
      id: 'unassigned-photos',
      type: 'photo',
      field: 'unassigned',
      label: `${inspection.unassignedPhotos.length} unassigned photos`,
      severity: 'warning',
    })
  }

  // Filter out waived issues
  const waivedIds = inspection.waivers.map(w => w.field)
  const activeIssues = issues.filter(i => !waivedIds.includes(i.field))
  const errors = activeIssues.filter(i => i.severity === 'error')
  const warnings = activeIssues.filter(i => i.severity === 'warning')

  const canSubmit = errors.length === 0

  // Handle waiver
  const handleWaive = (issue: ValidationIssue) => {
    setSelectedIssue(issue)
    setWaiverReason('')
    setWaiverDialogOpen(true)
  }

  const confirmWaiver = () => {
    if (!selectedIssue || !waiverReason.trim()) return

    const waiver: ValidationWaiver = {
      id: `waiver-${Date.now()}`,
      field: selectedIssue.field,
      reason: waiverReason,
      waivedAt: new Date().toISOString(),
      waivedBy: 'Current User',
    }

    onUpdate({ waivers: [...inspection.waivers, waiver] })
    setWaiverDialogOpen(false)
    setSelectedIssue(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">
          {t('step_5_title', language)}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('validation_summary', language)}
        </p>
      </div>

      {/* Status summary */}
      {activeIssues.length === 0 ? (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="flex items-center gap-4 p-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">
                {t('all_requirements_met', language)}
              </h3>
              <p className="text-sm text-green-700">
                This inspection is ready for submission.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Errors */}
          {errors.length > 0 && (
            <Collapsible
              open={expandedSection === 'errors'}
              onOpenChange={(open) => setExpandedSection(open ? 'errors' : null)}
            >
              <Card className="border-red-300 bg-red-50">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {expandedSection === 'errors' ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <XCircle className="h-6 w-6 text-red-600" />
                    <div className="flex-1 text-left">
                      <CardTitle className="text-base text-red-800">
                        {errors.length} Required Items Missing
                      </CardTitle>
                      <p className="text-sm text-red-700">
                        These must be completed before submission
                      </p>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {errors.map(issue => (
                        <IssueRow
                          key={issue.id}
                          issue={issue}
                          language={language}
                          onWaive={() => handleWaive(issue)}
                          canWaive={true}
                        />
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <Collapsible
              open={expandedSection === 'warnings'}
              onOpenChange={(open) => setExpandedSection(open ? 'warnings' : null)}
            >
              <Card className="border-amber-300 bg-amber-50">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {expandedSection === 'warnings' ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                    <div className="flex-1 text-left">
                      <CardTitle className="text-base text-amber-800">
                        {warnings.length} Warnings
                      </CardTitle>
                      <p className="text-sm text-amber-700">
                        Optional items that may be waived
                      </p>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {warnings.map(issue => (
                        <IssueRow
                          key={issue.id}
                          issue={issue}
                          language={language}
                          onWaive={() => handleWaive(issue)}
                          canWaive={true}
                        />
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>
      )}

      {/* Waivers list */}
      {inspection.waivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Waived Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inspection.waivers.map(waiver => (
                <div 
                  key={waiver.id}
                  className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{waiver.field}</p>
                    <p className="text-xs text-muted-foreground">
                      Reason: {waiver.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Waived by {waiver.waivedBy} on {new Date(waiver.waivedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">Waived</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          {t('back', language)}
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={!canSubmit}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {t('submit', language)}
        </Button>
      </div>

      {/* Waiver dialog */}
      <Dialog open={waiverDialogOpen} onOpenChange={setWaiverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('waive_requirement', language)}</DialogTitle>
            <DialogDescription>
              {selectedIssue?.label}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label>{t('waiver_reason', language)}</Label>
            <Textarea
              value={waiverReason}
              onChange={(e) => setWaiverReason(e.target.value)}
              placeholder="Enter reason for waiving this requirement..."
              className="mt-2"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaiverDialogOpen(false)}>
              {t('cancel', language)}
            </Button>
            <Button 
              onClick={confirmWaiver}
              disabled={!waiverReason.trim()}
            >
              Confirm Waiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// =============================================================================
// Issue Row
// =============================================================================

function IssueRow({
  issue,
  language,
  onWaive,
  canWaive,
}: {
  issue: ValidationIssue
  language: Language
  onWaive: () => void
  canWaive: boolean
}) {
  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-lg',
      issue.severity === 'error' ? 'bg-red-100' : 'bg-amber-100'
    )}>
      <span className="text-sm">{issue.label}</span>
      {canWaive && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onWaive}
          className="h-7 text-xs"
        >
          {t('waive_requirement', language)}
        </Button>
      )}
    </div>
  )
}
