// =============================================================================
// Service Tower Map - Types
// =============================================================================

export type MarkerPriority = 
  | 'overdue-service'      // Red, warning icon
  | 'active-project'       // Water blue, wrench icon
  | 'follow-up-due'        // Yellow, phone icon
  | 'stale-proposal'       // Yellow outline, document icon
  | 'scheduled-service'    // Navy, calendar icon
  | 'on-schedule'          // Gray solid, checkmark icon
  | 'no-activity'          // Gray outline, no icon

export type LocationConfidence = 
  | 'verified'             // Green dot
  | 'needs-review'         // Yellow dot
  | 'approximate'          // Yellow triangle
  | 'unverified'           // Red triangle

export type ServiceDueStatus =
  | 'due'
  | 'scheduled'
  | 'completed'
  | 'skipped'
  | 'deferred'
  | 'canceled'
  | 'overdue'
  | 'not-scheduled'

export type ProposalMapStatus =
  | 'no-proposal'
  | 'draft'
  | 'sent'
  | 'follow-up-due'
  | 'pending-board-approval'
  | 'won'
  | 'lost'
  | 'expired'
  | 'dormant'
  | 'stale'
  | 'revived'

export interface MapSite {
  name: string
  site_name: string
  customer: string
  customer_name: string
  tank_id: string
  tank_name: string
  latitude: number
  longitude: number
  state: string
  region?: string
  tank_type: string
  service_year?: number
  
  // Status fields
  marker_priority: MarkerPriority
  service_status: ServiceDueStatus
  proposal_status: ProposalMapStatus
  location_confidence: LocationConfidence
  
  // Dates
  last_service_date?: string
  next_due_date?: string
  
  // Counts
  open_action_count: number
  
  // Permission
  can_view_details: boolean
}

export interface MapFilters {
  service_status: ServiceDueStatus[]
  proposal_status: ProposalMapStatus[]
  customer: string | null
  site: string | null
  state: string[]
  region: string[]
  tank_type: string[]
  service_year: number | null
  location_confidence: LocationConfidence[]
}

export const DEFAULT_MAP_FILTERS: MapFilters = {
  service_status: ['due', 'overdue', 'scheduled'],
  proposal_status: ['sent', 'follow-up-due', 'stale'],
  customer: null,
  site: null,
  state: [],
  region: [],
  tank_type: [],
  service_year: null,
  location_confidence: [],
}

export const MARKER_PRIORITY_ORDER: MarkerPriority[] = [
  'overdue-service',
  'active-project',
  'follow-up-due',
  'stale-proposal',
  'scheduled-service',
  'on-schedule',
  'no-activity',
]

export const MARKER_CONFIG: Record<MarkerPriority, {
  color: string
  bgColor: string
  borderColor: string
  icon: string
  label: string
}> = {
  'overdue-service': {
    color: '#B43A3A',
    bgColor: '#FEF2F2',
    borderColor: '#B43A3A',
    icon: 'alert-triangle',
    label: 'Overdue Service',
  },
  'active-project': {
    color: '#13315C',
    bgColor: '#EFF6FF',
    borderColor: '#13315C',
    icon: 'wrench',
    label: 'Active Project',
  },
  'follow-up-due': {
    color: '#C28800',
    bgColor: '#FFFBEB',
    borderColor: '#C28800',
    icon: 'phone',
    label: 'Follow-Up Due',
  },
  'stale-proposal': {
    color: '#C28800',
    bgColor: '#FFFFFF',
    borderColor: '#C28800',
    icon: 'file-text',
    label: 'Stale Proposal',
  },
  'scheduled-service': {
    color: '#0B2545',
    bgColor: '#F0F4F8',
    borderColor: '#0B2545',
    icon: 'calendar',
    label: 'Scheduled Service',
  },
  'on-schedule': {
    color: '#6B7280',
    bgColor: '#F3F4F6',
    borderColor: '#6B7280',
    icon: 'check',
    label: 'On Schedule',
  },
  'no-activity': {
    color: '#9CA3AF',
    bgColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    icon: '',
    label: 'No Activity',
  },
}

export const LOCATION_CONFIDENCE_CONFIG: Record<LocationConfidence, {
  color: string
  icon: 'dot' | 'triangle'
  label: string
  warning: boolean
}> = {
  verified: {
    color: '#2E7D5B',
    icon: 'dot',
    label: 'Verified',
    warning: false,
  },
  'needs-review': {
    color: '#C28800',
    icon: 'dot',
    label: 'Needs Review',
    warning: false,
  },
  approximate: {
    color: '#C28800',
    icon: 'triangle',
    label: 'Approximate',
    warning: true,
  },
  unverified: {
    color: '#B43A3A',
    icon: 'triangle',
    label: 'Unverified',
    warning: true,
  },
}

export const SERVICE_STATUS_OPTIONS: { value: ServiceDueStatus; label: string }[] = [
  { value: 'due', label: 'Due' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'deferred', label: 'Deferred' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'not-scheduled', label: 'Not Scheduled' },
]

export const PROPOSAL_STATUS_OPTIONS: { value: ProposalMapStatus; label: string }[] = [
  { value: 'no-proposal', label: 'No Proposal' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'follow-up-due', label: 'Follow-Up Due' },
  { value: 'pending-board-approval', label: 'Pending Board Approval' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'expired', label: 'Expired' },
  { value: 'dormant', label: 'Dormant' },
  { value: 'stale', label: 'Stale' },
  { value: 'revived', label: 'Revived' },
]

export const LOCATION_CONFIDENCE_OPTIONS: { value: LocationConfidence; label: string }[] = [
  { value: 'verified', label: 'Verified' },
  { value: 'needs-review', label: 'Needs Review' },
  { value: 'approximate', label: 'Approximate' },
  { value: 'unverified', label: 'Unverified' },
]
