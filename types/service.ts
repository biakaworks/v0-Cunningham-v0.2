// =============================================================================
// Service Due List - Types
// =============================================================================

export type ServiceDueListStatus =
  | 'due'
  | 'scheduled'
  | 'completed'
  | 'skipped'
  | 'deferred'
  | 'canceled'

export type OutreachStatus =
  | 'not-sent'
  | 'sent'
  | 'replied'
  | 'scheduled'
  | 'no-response'
  | 'declined'

export interface ServiceDueItem {
  name: string
  customer: string
  customer_name: string
  site: string
  site_name: string
  tank: string
  tank_name: string
  next_due_date: string
  days_until: number // negative if overdue
  service_cycle: string // e.g., "Every 2 years"
  crew_assignment?: string
  crew_name?: string
  status: ServiceDueListStatus
  outreach_status: OutreachStatus
  last_service_date?: string
  state: string
  region?: string
}

export interface ServiceFilters {
  year: number | null
  state: string[]
  region: string[]
  customer: string | null
  site: string | null
  crew: string | null
  status: ServiceDueListStatus[]
}

export const DEFAULT_SERVICE_FILTERS: ServiceFilters = {
  year: new Date().getFullYear(),
  state: [],
  region: [],
  customer: null,
  site: null,
  crew: null,
  status: ['due', 'scheduled'],
}

export const SERVICE_STATUS_OPTIONS: { value: ServiceDueListStatus; label: string }[] = [
  { value: 'due', label: 'Due' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'deferred', label: 'Deferred' },
  { value: 'canceled', label: 'Canceled' },
]

export const OUTREACH_STATUS_OPTIONS: { value: OutreachStatus; label: string }[] = [
  { value: 'not-sent', label: 'Not Sent' },
  { value: 'sent', label: 'Sent' },
  { value: 'replied', label: 'Replied' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'no-response', label: 'No Response' },
  { value: 'declined', label: 'Declined' },
]

export interface OutreachTemplate {
  id: string
  name: string
  subject: string
  body: string
}

export const MOCK_OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'annual-service',
    name: 'Annual Service Reminder',
    subject: 'Upcoming Annual Service for {tank_name}',
    body: 'Dear {contact_name},\n\nThis is a reminder that {tank_name} is due for annual service on {due_date}. Please contact us to schedule your service appointment.\n\nBest regards,\nCunningham Tanks & Towers',
  },
  {
    id: 'overdue-notice',
    name: 'Overdue Service Notice',
    subject: 'Overdue Service Notice - {tank_name}',
    body: 'Dear {contact_name},\n\nOur records indicate that {tank_name} is overdue for service. The original due date was {due_date}. Please contact us immediately to schedule service.\n\nBest regards,\nCunningham Tanks & Towers',
  },
  {
    id: 'inspection-follow-up',
    name: 'Inspection Follow-up',
    subject: 'Follow-up: {tank_name} Inspection Findings',
    body: 'Dear {contact_name},\n\nFollowing our recent inspection of {tank_name}, we have prepared recommendations for your review. Please let us know when you would like to discuss next steps.\n\nBest regards,\nCunningham Tanks & Towers',
  },
]
