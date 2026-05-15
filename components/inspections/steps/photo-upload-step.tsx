'use client'

import { useState, useCallback } from 'react'
import { Upload, Image, GripVertical, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { t, type Language } from '@/lib/i18n/inspection-labels'
import type { 
  Inspection, 
  InspectionPhoto,
  ChecklistCategory 
} from '@/types/inspection'

const CATEGORIES: ChecklistCategory[] = [
  'wet_interior', 'exterior', 'foundation', 'anchor_bolts', 'overflow',
  'manway', 'ladder', 'safety_climb', 'vent', 'hatch',
  'aviation_light', 'cables', 'catwalk', 'coatings'
]

interface PhotoUploadStepProps {
  inspection: Inspection
  language: Language
  onUpdate: (updates: Partial<Inspection>) => void
  onNext: () => void
  onBack: () => void
}

export function PhotoUploadStep({ 
  inspection, 
  language, 
  onUpdate, 
  onNext, 
  onBack 
}: PhotoUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false)

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    )

    const newPhotos: InspectionPhoto[] = files.map(file => ({
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      url: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      category: 'general',
      takenAt: new Date().toISOString(),
      takenBy: 'Current User',
      isRequired: false,
    }))

    onUpdate({ 
      unassignedPhotos: [...inspection.unassignedPhotos, ...newPhotos] 
    })
  }, [inspection.unassignedPhotos, onUpdate])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      file => file.type.startsWith('image/')
    )

    const newPhotos: InspectionPhoto[] = files.map(file => ({
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      url: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      category: 'general',
      takenAt: new Date().toISOString(),
      takenBy: 'Current User',
      isRequired: false,
    }))

    onUpdate({ 
      unassignedPhotos: [...inspection.unassignedPhotos, ...newPhotos] 
    })
  }

  // Assign photo to a category
  const assignPhotoToCategory = (photoId: string, category: ChecklistCategory) => {
    const photo = inspection.unassignedPhotos.find(p => p.id === photoId)
    if (!photo) return

    const updatedPhoto = { ...photo, category }
    const newUnassigned = inspection.unassignedPhotos.filter(p => p.id !== photoId)
    
    const newSections = {
      ...inspection.sections,
      [category]: {
        ...inspection.sections[category],
        photos: [...inspection.sections[category].photos, updatedPhoto],
      },
    }

    onUpdate({ 
      unassignedPhotos: newUnassigned,
      sections: newSections,
    })
  }

  // Remove unassigned photo
  const removeUnassignedPhoto = (photoId: string) => {
    onUpdate({
      unassignedPhotos: inspection.unassignedPhotos.filter(p => p.id !== photoId)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {t('step_4_title', language)}
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload photos from your camera or SD card and assign them to inspection sections.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">
          {t('drag_drop_photos', language)}
        </p>
        <label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <Button variant="outline" asChild>
            <span className="cursor-pointer">Browse Files</span>
          </Button>
        </label>
      </div>

      {/* Unassigned photos */}
      {inspection.unassignedPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                {t('unassigned_photos', language)}
              </CardTitle>
              <Badge variant="secondary">
                {inspection.unassignedPhotos.length} photos
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {inspection.unassignedPhotos.map(photo => (
                <UnassignedPhotoCard
                  key={photo.id}
                  photo={photo}
                  language={language}
                  onAssign={(category) => assignPhotoToCategory(photo.id, category)}
                  onRemove={() => removeUnassignedPhoto(photo.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('assign_photos', language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {CATEGORIES.map(category => {
              const section = inspection.sections[category]
              const photoCount = section.photos.length
              
              return (
                <div 
                  key={category}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    photoCount > 0 ? 'bg-green-50' : 'bg-muted/50'
                  )}
                >
                  <span className="font-medium">{t(category, language)}</span>
                  <div className="flex items-center gap-2">
                    {photoCount > 0 ? (
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        <Image className="h-3 w-3 mr-1" />
                        {photoCount} photos
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No photos</Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

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
// Unassigned Photo Card
// =============================================================================

function UnassignedPhotoCard({
  photo,
  language,
  onAssign,
  onRemove,
}: {
  photo: InspectionPhoto
  language: Language
  onAssign: (category: ChecklistCategory) => void
  onRemove: () => void
}) {
  return (
    <div className="relative group">
      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
        <img
          src={photo.url || photo.thumbnailUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
      
      {/* Assign dropdown */}
      <Select onValueChange={(value) => onAssign(value as ChecklistCategory)}>
        <SelectTrigger className="mt-2 h-8 text-xs">
          <SelectValue placeholder="Assign to..." />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map(category => (
            <SelectItem key={category} value={category}>
              {t(category, language)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
