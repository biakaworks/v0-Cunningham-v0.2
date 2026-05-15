'use client'

import { useState, useRef } from 'react'
import { Camera, Cloud, Thermometer, MapPin, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { t, type Language } from '@/lib/i18n/inspection-labels'
import type { Inspection, InspectionPhoto } from '@/types/inspection'

interface ContextStepProps {
  inspection: Inspection
  language: Language
  onUpdate: (updates: Partial<Inspection>) => void
  onNext: () => void
}

export function ContextStep({ inspection, language, onUpdate, onNext }: ContextStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsCapturing(true)
    
    // Create a temporary URL for the photo
    const url = URL.createObjectURL(file)
    
    const photo: InspectionPhoto = {
      id: `photo-${Date.now()}`,
      file,
      url,
      thumbnailUrl: url,
      category: 'general',
      caption: 'Initial tank photo',
      takenAt: new Date().toISOString(),
      takenBy: inspection.crewName,
      isRequired: true,
    }
    
    onUpdate({ 
      initialPhoto: photo,
      contextConfirmed: true 
    })
    setIsCapturing(false)
  }

  const canProceed = inspection.contextConfirmed && inspection.initialPhoto

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('step_1_title', language)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pre-filled context info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoField 
              icon={MapPin}
              label={t('customer', language)}
              value={inspection.customerName}
            />
            <InfoField 
              icon={MapPin}
              label={t('site', language)}
              value={inspection.siteName}
            />
            <InfoField 
              icon={MapPin}
              label={t('tank', language)}
              value={`${inspection.tankName} (${inspection.tankType})`}
            />
            <InfoField 
              icon={Users}
              label={t('crew', language)}
              value={inspection.crewName}
            />
            <InfoField 
              icon={Calendar}
              label={t('service_date', language)}
              value={new Date(inspection.serviceDate).toLocaleDateString()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Weather conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            {t('weather', language)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('weather', language)}</Label>
              <Select 
                value={inspection.weather || ''} 
                onValueChange={(value) => onUpdate({ weather: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clear">Clear</SelectItem>
                  <SelectItem value="Partly Cloudy">Partly Cloudy</SelectItem>
                  <SelectItem value="Overcast">Overcast</SelectItem>
                  <SelectItem value="Light Rain">Light Rain</SelectItem>
                  <SelectItem value="Heavy Rain">Heavy Rain</SelectItem>
                  <SelectItem value="Snow">Snow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                {t('temperature', language)} (&deg;F)
              </Label>
              <Input
                type="number"
                value={inspection.temperature || ''}
                onChange={(e) => onUpdate({ temperature: parseInt(e.target.value) || undefined })}
                placeholder="e.g., 65"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initial photo capture */}
      <Card className={!inspection.initialPhoto ? 'border-amber-500 bg-amber-50/50' : ''}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t('initial_photo_required', language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inspection.initialPhoto ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={inspection.initialPhoto.url}
                  alt="Initial tank photo"
                  className="object-cover w-full h-full"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                Retake Photo
              </Button>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center aspect-video bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center">
                {t('take_photo', language)}
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />
        </CardContent>
      </Card>

      {/* Next button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          size="lg"
        >
          {t('next', language)}
        </Button>
      </div>
    </div>
  )
}

function InfoField({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType
  label: string
  value: string 
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
