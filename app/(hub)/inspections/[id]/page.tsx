'use client'

import { useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Globe,
  Save,
  Send,
  Check,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Import workflow step components
import { ContextStep } from '@/components/inspections/steps/context-step'
import { ChecklistStep } from '@/components/inspections/steps/checklist-step'
import { MeasurementsStep } from '@/components/inspections/steps/measurements-step'
import { PhotoUploadStep } from '@/components/inspections/steps/photo-upload-step'
import { ValidationStep } from '@/components/inspections/steps/validation-step'
import { OfficeReviewMode } from '@/components/inspections/office-review-mode'
import { HeaderSyncIndicator } from '@/components/inspections/sync-indicator'
import { useOfflineSync, useInspectionStorage } from '@/hooks/use-offline-sync'
import { getInspectionById } from '@/lib/mock-inspection-data'
import { t, type Language } from '@/lib/i18n/inspection-labels'
import type { Inspection, InspectionStatus, ChecklistCategory } from '@/types/inspection'
import { toast } from 'sonner'

// =============================================================================
// Inspection Capture Workflow Page
// =============================================================================

const STEPS = [
  { id: 1, key: 'context' as const },
  { id: 2, key: 'checklist' as const },
  { id: 3, key: 'measurements' as const },
  { id: 4, key: 'upload' as const },
  { id: 5, key: 'validation' as const },
]

export default function InspectionDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  
  // State
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [language, setLanguage] = useState<Language>('en')
  const [isSaving, setIsSaving] = useState(false)
  const [userRole] = useState<'field' | 'office'>('field') // Would come from auth
  
  // Hooks
  const { 
    isOnline, 
    isSyncing, 
    queueDepth, 
    lastSyncedAt, 
    items,
    addToQueue,
    flushQueue,
    retryItem 
  } = useOfflineSync()
  const { saveDraft, loadDraft } = useInspectionStorage()

  // Load inspection on mount
  useEffect(() => {
    async function loadInspection() {
      // Try to load from local storage first (for offline support)
      const localDraft = await loadDraft(id)
      
      if (localDraft) {
        setInspection(localDraft)
        setCurrentStep(localDraft.currentStep)
        setLanguage(localDraft.language)
      } else {
        // Fall back to mock data
        const mockInspection = getInspectionById(id)
        if (mockInspection) {
          setInspection(mockInspection)
          setCurrentStep(mockInspection.currentStep)
          setLanguage(mockInspection.language)
        }
      }
    }
    
    // Get language from URL if present
    const urlLang = searchParams.get('lang')
    if (urlLang === 'en' || urlLang === 'es') {
      setLanguage(urlLang)
    }
    
    loadInspection()
  }, [id, loadDraft, searchParams])

  // Handle language toggle
  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'es' : 'en'
    setLanguage(newLang)
    
    if (inspection) {
      const updated = { ...inspection, language: newLang }
      setInspection(updated)
      await saveDraft(updated)
    }
  }

  // Handle save draft
  const handleSaveDraft = async () => {
    if (!inspection) return
    
    setIsSaving(true)
    try {
      const updated = {
        ...inspection,
        currentStep,
        modifiedAt: new Date().toISOString(),
      }
      
      await saveDraft(updated)
      await addToQueue('inspection', 'update', inspection.name, updated)
      
      toast.success(t('save_draft', language), {
        description: 'Draft saved locally'
      })
    } catch (error) {
      toast.error('Save failed', {
        description: 'Could not save draft'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle submit for review
  const handleSubmit = async () => {
    if (!inspection) return
    
    const updated: Inspection = {
      ...inspection,
      status: 'Office Review',
      submittedAt: new Date().toISOString(),
      submittedBy: 'Current User', // Would come from auth
      currentStep: 5,
    }
    
    setInspection(updated)
    await saveDraft(updated)
    await addToQueue('inspection', 'submit', inspection.name, updated)
    
    toast.success('Inspection Submitted', {
      description: 'Submitted for office review'
    })
  }

  // Update inspection data
  const updateInspection = (updates: Partial<Inspection>) => {
    if (!inspection) return
    setInspection({ ...inspection, ...updates })
  }

  // Check if user is in office review mode
  const isOfficeReview = userRole === 'office' && 
    (inspection?.status === 'Office Review' || inspection?.status === 'Submitted')

  if (!inspection) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading inspection...</div>
      </div>
    )
  }

  // Render office review mode
  if (isOfficeReview) {
    return (
      <OfficeReviewMode
        inspection={inspection}
        language={language}
        onLanguageToggle={handleLanguageToggle}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile-first header */}
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
              <p className="text-sm text-muted-foreground">{inspection.siteName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLanguageToggle}
              className="gap-1"
            >
              <Globe className="h-4 w-4" />
              {language.toUpperCase()}
            </Button>
            
            {/* Sync indicator */}
            <HeaderSyncIndicator
              isOnline={isOnline}
              isSyncing={isSyncing}
              queueDepth={queueDepth}
              lastSyncedAt={lastSyncedAt}
              items={items}
              lang={language}
              onFlush={flushQueue}
              onRetryItem={retryItem}
            />
          </div>
        </div>
        
        {/* Step indicator */}
        <div className="flex items-center justify-between px-4 pb-3">
          <StepIndicator 
            steps={STEPS} 
            currentStep={currentStep} 
            language={language}
          />
        </div>
      </header>

      {/* Main content - step specific */}
      <main className="flex-1 overflow-auto p-4">
        {currentStep === 1 && (
          <ContextStep
            inspection={inspection}
            language={language}
            onUpdate={updateInspection}
            onNext={() => setCurrentStep(2)}
          />
        )}
        
        {currentStep === 2 && (
          <ChecklistStep
            inspection={inspection}
            language={language}
            onUpdate={updateInspection}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        
        {currentStep === 3 && (
          <MeasurementsStep
            inspection={inspection}
            language={language}
            onUpdate={updateInspection}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}
        
        {currentStep === 4 && (
          <PhotoUploadStep
            inspection={inspection}
            language={language}
            onUpdate={updateInspection}
            onNext={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )}
        
        {currentStep === 5 && (
          <ValidationStep
            inspection={inspection}
            language={language}
            onUpdate={updateInspection}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(4)}
          />
        )}
      </main>

      {/* Footer actions */}
      <footer className="sticky bottom-0 bg-background border-t p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : t('save_draft', language)}
          </Button>
          
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                {t('back', language)}
              </Button>
            )}
            
            {currentStep < 5 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                {t('next', language)}
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Send className="h-4 w-4 mr-2" />
                {t('submit', language)}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

// =============================================================================
// Step Indicator
// =============================================================================

function StepIndicator({ 
  steps, 
  currentStep,
  language 
}: { 
  steps: typeof STEPS
  currentStep: number
  language: Language
}) {
  const stepLabels: Record<string, { en: string; es: string }> = {
    context: { en: 'Context', es: 'Contexto' },
    checklist: { en: 'Checklist', es: 'Lista' },
    measurements: { en: 'Measurements', es: 'Mediciones' },
    upload: { en: 'Photos', es: 'Fotos' },
    validation: { en: 'Submit', es: 'Enviar' },
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = step.id < currentStep
        
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors',
                isActive && 'bg-primary text-primary-foreground',
                isCompleted && 'bg-green-100 text-green-700',
                !isActive && !isCompleted && 'bg-muted text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <Check className="h-3 w-3" />
              ) : (
                <span>{step.id}</span>
              )}
              <span className="hidden sm:inline">
                {stepLabels[step.key][language]}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  'w-4 h-0.5 mx-1',
                  isCompleted ? 'bg-green-500' : 'bg-muted'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
