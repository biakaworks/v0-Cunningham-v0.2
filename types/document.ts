// =============================================================================
// Document Library Types
// =============================================================================

export type DocumentType =
  | 'Proposal'
  | 'Report'
  | 'Contract'
  | 'Spec'
  | 'Invoice'
  | 'Photo'
  | 'Job Sheet'
  | 'Completion Form'
  | 'Customer File'
  | 'Internal Note'

export type AttachableDoctype =
  | 'Customer'
  | 'Site'
  | 'Tank'
  | 'Opportunity'
  | 'Proposal'
  | 'Project'
  | 'Service Visit'

export interface DocumentAttachment {
  doctype: AttachableDoctype
  name: string
  display_name: string
}

export interface CunninghamDocument {
  name: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  document_type: DocumentType
  description?: string
  owner: string
  owner_name: string
  creation: string
  modified: string
  attachments: DocumentAttachment[]
  is_private: boolean
  tags?: string[]
  // For photos
  thumbnail_url?: string
  photo_category?: string
  taken_date?: string
  latitude?: number
  longitude?: number
  service_visit?: string
  checklist_item?: string
  related_measurement?: string
}

export interface DocumentFilters {
  document_types: DocumentType[]
  customer?: string
  site?: string
  tank?: string
  date_from?: string
  date_to?: string
  owner?: string
}

export type DocumentViewMode = 'grid' | 'table' | 'gallery'

// =============================================================================
// Admin Types
// =============================================================================

export type UserRole =
  | 'Leadership'
  | 'Sales'
  | 'Estimator'
  | 'Operations'
  | 'Admin'
  | 'Accounting'
  | 'Field Foreman'
  | 'Service Crew'
  | 'Read-Only'

export type UserStatus = 'Active' | 'Deactivated'

export interface AdminUser {
  name: string
  email: string
  full_name: string
  roles: UserRole[]
  language_preference: 'en' | 'es'
  status: UserStatus
  last_login?: string
  creation: string
}

export type RecordType =
  | 'Customer'
  | 'Site'
  | 'Tank'
  | 'Opportunity'
  | 'Proposal'
  | 'Project'
  | 'Report'
  | 'Document'
  | 'Billing'
  | 'Inspection'
  | 'Audit'

export type PermissionLevel = 'None' | 'Read' | 'Write'

export type SensitiveFieldVisibility = 'Visible' | 'Summary' | 'Hidden'

export interface RolePermissions {
  role: UserRole
  permissions: Record<RecordType, PermissionLevel>
}

export interface SensitiveFieldGates {
  proposal_value: Record<UserRole, SensitiveFieldVisibility>
  margin: Record<UserRole, SensitiveFieldVisibility>
  invoice_amounts: Record<UserRole, SensitiveFieldVisibility>
  payroll_related: Record<UserRole, SensitiveFieldVisibility>
  job_cost: Record<UserRole, SensitiveFieldVisibility>
}

export type AuditAction =
  | 'Create'
  | 'Update'
  | 'Delete'
  | 'Approve'
  | 'Reject'

export interface AuditLogEntry {
  name: string
  timestamp: string
  user: string
  user_name: string
  record_type: RecordType
  record_name: string
  record_display: string
  action: AuditAction
  field_changed?: string
  previous_value?: string
  new_value?: string
}

export type LocationConfidence = 'Verified' | 'High' | 'Medium' | 'Low' | 'Unknown'

export interface TowerVerificationItem {
  name: string
  customer: string
  customer_name: string
  site_name: string
  current_address: string
  latitude?: number
  longitude?: number
  source: string
  confidence: LocationConfidence
  last_updated: string
}

export interface DuplicateCandidate {
  name: string
  record_a_name: string
  record_a_display: string
  record_b_name: string
  record_b_display: string
  doctype: 'Customer' | 'Site' | 'Tank'
  match_reason: string
  similarity_score: number
  created: string
}

export type LowConfidenceIssueType =
  | 'Missing Required Fields'
  | 'Conflicting Fields'
  | 'Weak Source'
  | 'Failed Validation'

export interface LowConfidenceRecord {
  name: string
  record_name: string
  record_display: string
  doctype: RecordType
  issue_type: LowConfidenceIssueType
  source: string
  flagged_date: string
  details?: string
}

export type ChecklistSection =
  | 'wet_interior'
  | 'exterior'
  | 'foundation'
  | 'anchor_bolts'
  | 'overflow'
  | 'manway'
  | 'ladder'
  | 'safety_climb'
  | 'vent'
  | 'hatch'
  | 'aviation_light'
  | 'cables'
  | 'catwalk'
  | 'coatings'

export interface ChecklistSectionConfig {
  section: ChecklistSection
  enabled: boolean
  required_photos: string[]
  required_measurements: string[]
  order: number
}

export interface BilingualLabel {
  key: string
  english: string
  spanish: string
  needs_review: boolean
}

export interface ChecklistTemplate {
  tank_type: string
  sections: ChecklistSectionConfig[]
  labels: BilingualLabel[]
}
