'use client'

import { useState, useRef } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  Camera, 
  Plus, 
  Check, 
  AlertCircle,
  X 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { t, type Language } from '@/lib/i18n/inspection-labels'
import type { 
  Inspection, 
  ChecklistSection, 
  ChecklistCategory,
  InspectionPhoto 
} from '@/types/inspection'

const CATEGORIES: ChecklistCategory[] = [
  'wet_interior', 'exterior', 'foundation', 'anchor_bolts', 'overflow',
  'manway', 'ladder', 'safety_climb', 'vent', 'hatch',
  'aviation_light', 'cables', 'catwalk', 'coatings'
]

interface ChecklistStepProps {
  inspection: Inspection
  language: Language
  onUpdate: (updates: Partial<Inspection>) => void
  onNext: () => void
  onBack: () => void
}

export function ChecklistStep({ 
  inspection, 
  language, 
  onUpdate, 
  onNext, 
  onBack 
}: ChecklistStepProps) {
  const [expandedCategory, setExpandedCategory] = useState<ChecklistCategory | null>(
    CATEGORIES[0]
  )

  const updateSection = (category: ChecklistCategory, updates: Partial<ChecklistSection>) => {
    const newSections = {
      ...inspection.sections,
      [category]: {
        ...inspection.sections[category],
        ...updates,
      },
    }
    onUpdate({ sections: newSections })
  }

  const completedCount = CATEGORIES.filter(
    cat => inspection.sections[cat]?.isComplete
  ).length

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completedCount} of {CATEGORIES.length} sections completed
        </span>
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${(completedCount / CATEGORIES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist sections */}
      <div className="space-y-2">
        {CATEGORIES.map(category => (
          <ChecklistSectionCard
            key={category}
            category={category}
            section={inspection.sections[category]}
            language={language}
            isExpanded={expandedCategory === category}
            onToggle={() => setExpandedCategory(
              expandedCategory === category ? null : category
            )}
            onUpdate={(updates) => updateSection(category, updates)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          {t('back', language)}
        </Button>
        <Button onClick={onNext}>
          {t('next', language)}
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// Section Card Component
// =============================================================================

function ChecklistSectionCard({
  category,
  section,
  language,
  isExpanded,
  onToggle,
  onUpdate,
}: {
  category: ChecklistCategory
  section: ChecklistSection
  language: Language
  isExpanded: boolean
  onToggle: () => void
  onUpdate: (updates: Partial<ChecklistSection>) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const photo: InspectionPhoto = {
      id: `photo-${Date.now()}`,
      file,
      url,
      thumbnailUrl: url,
      category,
      takenAt: new Date().toISOString(),
      takenBy: 'Current User',
      isRequired: false,
    }

    onUpdate({ 
      photos: [...section.photos, photo],
      isComplete: section.notes.length > 0 || section.photos.length > 0
    })
  }

  const handlePhotoRemove = (photoId: string) => {
    onUpdate({ 
      photos: section.photos.filter(p => p.id !== photoId) 
    })
  }

  const handleNotesChange = (notes: string) => {
    onUpdate({ 
      notes,
      isComplete: notes.length > 0 || section.photos.length > 0
    })
  }

  const statusBadge = () => {
    if (section.isComplete) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
          <Check className="h-3 w-3 mr-1" />
          {t('completed', language)}
        </Badge>
      )
    }
    if (section.isRequired) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
          {t('required', language)}
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        {t('optional', language)}
      </Badge>
    )
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className={cn(
        'border rounded-lg overflow-hidden',
        section.hasDeficiency && 'border-red-300 bg-red-50/50',
        section.isComplete && !section.hasDeficiency && 'border-green-300 bg-green-50/50'
      )}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-medium">{t(category, language)}</span>
            </div>
            {statusBadge()}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t">
            {/* Photos */}
            <div className="pt-4">
              <Label className="flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4" />
                {t('photos', language)}
              </Label>
              
              <div className="flex flex-wrap gap-2">
                {section.photos.map(photo => (
                  <div 
                    key={photo.id}
                    className="relative w-20 h-20 rounded-md overflow-hidden bg-muted"
                  >
                    <img
                      src={photo.url || photo.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handlePhotoRemove(photo.id)}
                      className="absolute top-1 right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center hover:bg-muted/50 transition-colors"
                >
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoAdd}
              />
            </div>

            {/* Notes */}
            <div>
              <Label>{t('notes', language)}</Label>
              <Textarea
                value={section.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Enter observations..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Deficiency toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <Label>{t('deficiency', language)}</Label>
              </div>
              <Switch
                checked={section.hasDeficiency}
                onCheckedChange={(checked) => onUpdate({ 
                  hasDeficiency: checked,
                  deficiencySeverity: checked ? 'minor' : undefined
                })}
              />
            </div>

            {/* Severity if deficiency */}
            {section.hasDeficiency && (
              <div>
                <Label>{t('deficiency_severity', language)}</Label>
                <Select
                  value={section.deficiencySeverity || 'minor'}
                  onValueChange={(value: 'minor' | 'moderate' | 'severe') => 
                    onUpdate({ deficiencySeverity: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">{t('minor', language)}</SelectItem>
                    <SelectItem value="moderate">{t('moderate', language)}</SelectItem>
                    <SelectItem value="severe">{t('severe', language)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Mark complete button */}
            <Button
              variant={section.isComplete ? 'outline' : 'default'}
              className="w-full"
              onClick={() => onUpdate({ isComplete: !section.isComplete })}
            >
              {section.isComplete ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t('completed', language)}
                </>
              ) : (
                'Mark as Complete'
              )}
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
