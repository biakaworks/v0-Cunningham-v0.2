'use server'

import { frappe } from '@/lib/frappe'
import type { 
  Inspection, 
  InspectionStatus,
  CorrectionRequest,
  ChecklistCategory,
  MeasurementType 
} from '@/types/inspection'

// =============================================================================
// Inspection Server Actions
// =============================================================================

interface ActionResult {
  success: boolean
  message?: string
  error?: string
  data?: unknown
}

// -----------------------------------------------------------------------------
// Create new inspection
// -----------------------------------------------------------------------------
export async function createInspection(input: {
  customer: string
  site: string
  tank: string
  crew: string
  serviceDate: string
  language: 'en' | 'es'
}): Promise<ActionResult & { inspectionId?: string }> {
  try {
    // Generate inspection number
    const year = new Date().getFullYear()
    const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    const inspectionId = `INS-${year}-${sequence}`

    // In real implementation, this would create a record in Frappe
    // await frappe.insert('Service Visit', {
    //   name: inspectionId,
    //   customer: input.customer,
    //   site: input.site,
    //   tank: input.tank,
    //   assigned_crew: input.crew,
    //   scheduled_date: input.serviceDate,
    //   status: 'Draft',
    //   visit_type: 'Annual Inspection',
    // })

    console.log('[v0] Creating inspection:', inspectionId, input)

    return {
      success: true,
      message: 'Inspection created successfully',
      inspectionId,
    }
  } catch (error) {
    console.error('[v0] Failed to create inspection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create inspection',
    }
  }
}

// -----------------------------------------------------------------------------
// Save inspection draft
// -----------------------------------------------------------------------------
export async function saveInspectionDraft(
  name: string,
  data: Partial<Inspection>
): Promise<ActionResult> {
  try {
    // In real implementation, this would update the record in Frappe
    // await frappe.save('Service Visit', {
    //   name,
    //   ...mapToFrappeFields(data),
    //   status: 'Draft',
    // })

    console.log('[v0] Saving inspection draft:', name)

    return {
      success: true,
      message: 'Draft saved successfully',
    }
  } catch (error) {
    console.error('[v0] Failed to save draft:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save draft',
    }
  }
}

// -----------------------------------------------------------------------------
// Submit inspection for office review
// -----------------------------------------------------------------------------
export async function submitInspection(name: string): Promise<ActionResult> {
  try {
    // Validate required items before submission
    // In real implementation, fetch the inspection and validate
    
    // await frappe.save('Service Visit', {
    //   name,
    //   status: 'Office Review',
    //   submitted_date: new Date().toISOString(),
    // })

    console.log('[v0] Submitting inspection:', name)

    return {
      success: true,
      message: 'Inspection submitted for office review',
    }
  } catch (error) {
    console.error('[v0] Failed to submit inspection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit inspection',
    }
  }
}

// -----------------------------------------------------------------------------
// Request field correction
// -----------------------------------------------------------------------------
export async function requestFieldCorrection(
  inspectionName: string,
  items: Array<{
    field: string
    category?: ChecklistCategory
    measurementType?: MeasurementType
    photoId?: string
    notes: string
  }>
): Promise<ActionResult> {
  try {
    // In real implementation:
    // 1. Create correction request records
    // 2. Update inspection status to 'Corrections Requested'
    // 3. Notify field crew

    console.log('[v0] Requesting corrections for:', inspectionName, items)

    return {
      success: true,
      message: `${items.length} correction(s) requested`,
    }
  } catch (error) {
    console.error('[v0] Failed to request corrections:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request corrections',
    }
  }
}

// -----------------------------------------------------------------------------
// Resubmit inspection after corrections
// -----------------------------------------------------------------------------
export async function resubmitInspection(name: string): Promise<ActionResult> {
  try {
    // In real implementation:
    // 1. Validate all corrections are addressed
    // 2. Update inspection status back to 'Office Review'
    // 3. Log resubmission

    console.log('[v0] Resubmitting inspection:', name)

    return {
      success: true,
      message: 'Inspection resubmitted for review',
    }
  } catch (error) {
    console.error('[v0] Failed to resubmit inspection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resubmit inspection',
    }
  }
}

// -----------------------------------------------------------------------------
// Approve inspection for report drafting
// -----------------------------------------------------------------------------
export async function approveForReportDrafting(name: string): Promise<ActionResult> {
  try {
    // In real implementation:
    // 1. Validate user has approve permission
    // 2. Update status to 'Ready for Report'
    // 3. Log approval with user and timestamp

    console.log('[v0] Approving inspection for report drafting:', name)

    return {
      success: true,
      message: 'Inspection approved for report drafting',
    }
  } catch (error) {
    console.error('[v0] Failed to approve inspection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve inspection',
    }
  }
}

// -----------------------------------------------------------------------------
// Upload inspection photo
// -----------------------------------------------------------------------------
export async function uploadInspectionPhoto(
  inspectionName: string,
  category: string,
  file: FormData
): Promise<ActionResult & { photoUrl?: string }> {
  try {
    // In real implementation:
    // const result = await frappe.uploadFile(file, {
    //   attached_to_doctype: 'Service Visit',
    //   attached_to_name: inspectionName,
    //   folder: `Inspections/${inspectionName}`,
    // })

    console.log('[v0] Uploading photo for:', inspectionName, category)

    // Return mock URL
    return {
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl: '/placeholder.svg?height=400&width=600',
    }
  } catch (error) {
    console.error('[v0] Failed to upload photo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload photo',
    }
  }
}

// -----------------------------------------------------------------------------
// Waive inspection requirement
// -----------------------------------------------------------------------------
export async function waiveInspectionRequirement(
  inspectionName: string,
  field: string,
  reason: string
): Promise<ActionResult> {
  try {
    // In real implementation:
    // 1. Create waiver record with audit trail
    // 2. Log the waiver with user, timestamp, and reason

    console.log('[v0] Waiving requirement:', inspectionName, field, reason)

    return {
      success: true,
      message: 'Requirement waived',
    }
  } catch (error) {
    console.error('[v0] Failed to waive requirement:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to waive requirement',
    }
  }
}

// -----------------------------------------------------------------------------
// Update user language preference
// -----------------------------------------------------------------------------
export async function updateLanguagePreference(
  userId: string,
  language: 'en' | 'es'
): Promise<ActionResult> {
  try {
    // In real implementation:
    // await frappe.save('User', {
    //   name: userId,
    //   preferred_language: language,
    // })

    console.log('[v0] Updating language preference:', userId, language)

    return {
      success: true,
      message: 'Language preference updated',
    }
  } catch (error) {
    console.error('[v0] Failed to update language:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update language preference',
    }
  }
}
