'use client'

import { useRef } from 'react'
import { Ruler, Camera, Plus, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { t, type Language } from '@/lib/i18n/inspection-labels'
import type { 
  Inspection, 
  InspectionMeasurement,
  InspectionPhoto,
  MeasurementType 
} from '@/types/inspection'

interface MeasurementsStepProps {
  inspection: Inspection
  language: Language
  onUpdate: (updates: Partial<Inspection>) => void
  onNext: () => void
  onBack: () => void
}

export function MeasurementsStep({ 
  inspection, 
  language, 
  onUpdate, 
  onNext, 
  onBack 
}: MeasurementsStepProps) {
  const updateMeasurement = (
    type: MeasurementType, 
    updates: Partial<InspectionMeasurement>
  ) => {
    const newMeasurements = inspection.measurements.map(m =>
      m.type === type ? { ...m, ...updates } : m
    )
    onUpdate({ measurements: newMeasurements })
  }

  const completedCount = inspection.measurements.filter(m => m.value !== undefined).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            {t('step_3_title', language)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {inspection.measurements.length} measurements recorded
          </p>
        </div>
      </div>

      {/* Measurement cards */}
      <div className="grid gap-4">
        {inspection.measurements.map(measurement => (
          <MeasurementCard
            key={measurement.type}
            measurement={measurement}
            language={language}
            onUpdate={(updates) => updateMeasurement(measurement.type, updates)}
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
// Measurement Card
// =============================================================================

function MeasurementCard({
  measurement,
  language,
  onUpdate,
}: {
  measurement: InspectionMeasurement
  language: Language
  onUpdate: (updates: Partial<InspectionMeasurement>) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasValue = measurement.value !== undefined

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const photo: InspectionPhoto = {
      id: `photo-${Date.now()}`,
      file,
      url,
      thumbnailUrl: url,
      category: 'measurement',
      measurementId: measurement.type,
      takenAt: new Date().toISOString(),
      takenBy: 'Current User',
      isRequired: false,
    }

    onUpdate({ photos: [...measurement.photos, photo] })
  }

  const handlePhotoRemove = (photoId: string) => {
    onUpdate({ photos: measurement.photos.filter(p => p.id !== photoId) })
  }

  return (
    <Card className={cn(hasValue && 'border-green-300 bg-green-50/30')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t(measurement.type as keyof typeof t extends string ? measurement.type as any : 'measurements', language)}
          </CardTitle>
          {hasValue && (
            <Badge variant="outline" className="border-green-500 text-green-700">
              <Check className="h-3 w-3 mr-1" />
              Recorded
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Value input */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={measurement.value ?? ''}
            onChange={(e) => onUpdate({ 
              value: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
            placeholder="Enter value"
            className="flex-1"
          />
          <span className="text-muted-foreground font-medium min-w-[40px]">
            {measurement.unit}
          </span>
        </div>

        {/* Notes */}
        <div>
          <Label className="text-sm">{t('notes', language)}</Label>
          <Textarea
            value={measurement.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Optional notes..."
            className="mt-1"
            rows={2}
          />
        </div>

        {/* Photos */}
        <div>
          <Label className="text-sm flex items-center gap-2">
            <Camera className="h-4 w-4" />
            {t('photos', language)}
          </Label>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {measurement.photos.map(photo => (
              <div 
                key={photo.id}
                className="relative w-16 h-16 rounded-md overflow-hidden bg-muted"
              >
                <img
                  src={photo.url || photo.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handlePhotoRemove(photo.id)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center hover:bg-muted/50 transition-colors"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
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
      </CardContent>
    </Card>
  )
}
