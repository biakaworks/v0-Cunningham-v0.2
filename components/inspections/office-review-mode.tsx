'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Globe, 
  Check, 
  Flag, 
  FileCheck,
  ChevronDown,
  ChevronRight,
  Image
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  CorrectionRequest,
  ChecklistCategory 
} from '@/types/inspection'
import { toast } from 'sonner'

const CATEGORIES: ChecklistCategory[] = [
  'wet_interior', 'exterior', 'foundation', 'anchor_bolts', 'overflow',
  'manway', 'ladder', 'safety_climb', 'vent', 'hatch',
  'aviation_light', 'cables', 'catwalk', 'coatings'
]

interface OfficeReviewModeProps {
  inspection: Inspection
  language: Language
  onLanguageToggle: () => void
}

export function OfficeReviewMode({ 
  inspection, 
  language,
  onLanguageToggle 
}: OfficeReviewModeProps) {
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false)
  const [correctionTarget, setCorrectionTarget] = useState<{
    field: string
    category?: ChecklistCategory
    photoId?: string
  } | null>(null)
  const [correctionNotes, setCorrectionNotes] = useState('')
  const [expandedSection, setExpandedSection] = useState<ChecklistCategory | null>(
    CATEGORIES[0]
  )

  const handleFlagForCorrection = (target: typeof correctionTarget) => {
    setCorrectionTarget(target)
    setCorrectionNotes('')
    setCorrectionDialogOpen(true)
  }

  const submitCorrection = () => {
    if (!correctionTarget || !correctionNotes.trim()) return

    // In real app, this would call a server action
    toast.success('Correction requested', {
      description: 'Field crew has been notified'
    })
    
    setCorrectionDialogOpen(false)
    setCorrectionTarget(null)
  }

  const handleApproveForReport = () => {
    // In real app, this would call a server action
    toast.success('Approved for Report Drafting', {
      description: 'Inspection can now be converted to a report'
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/inspections">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold">{inspection.tankName}</h1>
              <p className="text-sm text-muted-foreground">
                Office Review - {inspection.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onLanguageToggle}>
              <Globe className="h-4 w-4 mr-1" />
              {language.toUpperCase()}
            </Button>
            
            <Badge variant="outline" className="border-amber-500 text-amber-700">
              Awaiting Review
            </Badge>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 space-y-6">
        {/* Summary info */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{inspection.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Site</p>
                <p className="font-medium">{inspection.siteName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service Date</p>
                <p className="font-medium">
                  {new Date(inspection.serviceDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted By</p>
                <p className="font-medium">{inspection.submittedBy || 'Unknown'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Correction history */}
        {inspection.corrections.length > 0 && (
          <Card className="border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-base">
                Correction History ({inspection.corrections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inspection.corrections.map(correction => (
                  <div 
                    key={correction.id}
                    className="p-3 bg-white rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {correction.category ? t(correction.category, language) : correction.field}
                      </span>
                      <Badge variant={correction.resolvedAt ? 'outline' : 'secondary'}>
                        {correction.resolvedAt ? 'Resolved' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{correction.notes}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested by {correction.requestedBy} on{' '}
                      {new Date(correction.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist sections - read only */}
        <div className="space-y-2">
          <h2 className="font-semibold">Checklist Data</h2>
          
          {CATEGORIES.map(category => {
            const section = inspection.sections[category]
            const isExpanded = expandedSection === category
            
            return (
              <Collapsible
                key={category}
                open={isExpanded}
                onOpenChange={(open) => setExpandedSection(open ? category : null)}
              >
                <div className={cn(
                  'border rounded-lg overflow-hidden',
                  section.hasDeficiency && 'border-red-300 bg-red-50/50'
                )}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        <span className="font-medium">{t(category, language)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {section.photos.length > 0 && (
                          <Badge variant="secondary">
                            <Image className="h-3 w-3 mr-1" />
                            {section.photos.length}
                          </Badge>
                        )}
                        {section.hasDeficiency && (
                          <Badge variant="destructive">
                            Deficiency: {section.deficiencySeverity}
                          </Badge>
                        )}
                        {section.isComplete && (
                          <Badge variant="outline" className="border-green-500 text-green-700">
                            <Check className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t space-y-4">
                      {/* Photos */}
                      {section.photos.length > 0 && (
                        <div className="pt-4">
                          <Label className="mb-2 block">Photos</Label>
                          <div className="flex flex-wrap gap-2">
                            {section.photos.map(photo => (
                              <div 
                                key={photo.id}
                                className="relative w-24 h-24 rounded-md overflow-hidden bg-muted group"
                              >
                                <img
                                  src={photo.url || photo.thumbnailUrl}
                                  alt={photo.caption || ''}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => handleFlagForCorrection({
                                    field: 'photo',
                                    category,
                                    photoId: photo.id
                                  })}
                                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Flag className="h-6 w-6 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {section.notes && (
                        <div>
                          <Label className="mb-2 block">Notes</Label>
                          <div className="p-3 bg-muted/50 rounded-lg text-sm">
                            {section.notes}
                          </div>
                        </div>
                      )}

                      {/* Flag section button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFlagForCorrection({
                          field: 'section',
                          category
                        })}
                        className="gap-2"
                      >
                        <Flag className="h-4 w-4" />
                        {t('flag_for_correction', language)}
                      </Button>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
        </div>

        {/* Measurements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {inspection.measurements.map(m => (
                <div 
                  key={m.type}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t(m.type as any, language)}
                    </p>
                    <p className="font-medium">
                      {m.value !== undefined ? `${m.value} ${m.unit}` : '—'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFlagForCorrection({
                      field: 'measurement',
                      category: m.type as ChecklistCategory
                    })}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-background border-t p-4">
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => handleFlagForCorrection({ field: 'general' })}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            Request Corrections
          </Button>
          <Button onClick={handleApproveForReport} className="gap-2">
            <FileCheck className="h-4 w-4" />
            {t('approve_for_report', language)}
          </Button>
        </div>
      </footer>

      {/* Correction dialog */}
      <Dialog open={correctionDialogOpen} onOpenChange={setCorrectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('flag_for_correction', language)}</DialogTitle>
            <DialogDescription>
              Describe what needs to be corrected. The field crew will be notified.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label>{t('correction_notes', language)}</Label>
            <Textarea
              value={correctionNotes}
              onChange={(e) => setCorrectionNotes(e.target.value)}
              placeholder="Describe the issue and what needs to be fixed..."
              className="mt-2"
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrectionDialogOpen(false)}>
              {t('cancel', language)}
            </Button>
            <Button 
              onClick={submitCorrection}
              disabled={!correctionNotes.trim()}
            >
              Submit Correction Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
