// Pipeline-specific types and configurations

import type { Proposal, ProposalType } from './cunningham'

// Pipeline statuses matching the visual design
export type PipelineStatus = 
  | 'Lead'
  | 'Inspection'
  | 'Proposal'
  | 'Scheduled'
  | 'In Progress'
  | 'Billed'
  | 'Paid'
  | 'Lost'
  | 'Dormant'

export const PIPELINE_STATUSES: PipelineStatus[] = [
  'Lead',
  'Inspection',
  'Proposal',
  'Scheduled',
  'In Progress',
  'Billed',
  'Paid',
  'Lost',
  'Dormant'
]

export const ACTIVE_STATUSES: PipelineStatus[] = [
  'Lead',
  'Inspection',
  'Proposal',
  'Scheduled',
  'In Progress'
]

export const CLOSED_STATUSES: PipelineStatus[] = [
  'Billed',
  'Paid',
  'Lost',
  'Dormant'
]

// Stage descriptions for column headers
export const STAGE_DESCRIPTIONS: Record<PipelineStatus, string> = {
  'Lead': 'New inquiry, renewal trigger, or RFP captured',
  'Inspection': 'Field work scheduled, in progress, or report being...',
  'Proposal': 'Proposal sent to customer or bid submitted',
  'Scheduled': 'Won — on the work calendar with crews assigned',
  'In Progress': 'Crews are on site executing',
  'Billed': 'Work complete — invoice sent to customer',
  'Paid': 'Payment received — project closed',
  'Lost': 'Did not win the work',
  'Dormant': 'On hold — revisit later',
}

export const STATUS_COLORS: Record<PipelineStatus, string> = {
  'Lead': 'bg-gray-100 text-gray-700 border-gray-300',
  'Inspection': 'bg-blue-100 text-blue-700 border-blue-300',
  'Proposal': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Scheduled': 'bg-purple-100 text-purple-700 border-purple-300',
  'In Progress': 'bg-green-100 text-green-700 border-green-300',
  'Billed': 'bg-teal-100 text-teal-700 border-teal-300',
  'Paid': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  'Lost': 'bg-red-100 text-red-700 border-red-300',
  'Dormant': 'bg-slate-100 text-slate-700 border-slate-300'
}

export const TYPE_COLORS: Record<ProposalType, string> = {
  'Engineered Spec': 'bg-orange-500 text-white',
  'Negotiated': 'bg-white text-gray-700 border border-gray-300'
}

// Stale thresholds in days
export const STALE_THRESHOLDS: Record<ProposalType, number> = {
  'Negotiated': 30,
  'Engineered Spec': 60
}

export type LeadSource = 
  | 'Bid Ocean'
  | 'Website'
  | 'Trade Show'
  | 'Cold Call'
  | 'Service Visit'
  | 'Renewal'
  | 'Referral'
  | 'Existing Customer'
  | 'Other'

export const LEAD_SOURCES: LeadSource[] = [
  'Bid Ocean',
  'Website',
  'Trade Show',
  'Cold Call',
  'Service Visit',
  'Renewal',
  'Referral',
  'Existing Customer',
  'Other'
]

export const LOSS_REASONS = [
  'Price too high',
  'Went with competitor',
  'Project cancelled',
  'Budget constraints',
  'Scope changed',
  'Timeline issues',
  'No response',
  'Other'
] as const

export type LossReason = typeof LOSS_REASONS[number]

export interface PipelineProposal extends Omit<Proposal, 'status'> {
  status: PipelineStatus
  customer_name: string
  site_name: string
  tank_name?: string
  age_days: number
  days_in_stage?: number
  is_stale: boolean
  owner_name: string
  owner_avatar?: string
  owner_initials?: string
  is_revived?: boolean
  original_proposal?: string
  revived_to?: string
  scope_summary?: string
}

export type ViewMode = 'kanban' | 'table' | 'map'
export type TypeFilter = 'all' | 'engineered' | 'negotiated'

export interface PipelineOwner {
  id: string
  name: string
  initials: string
  avatar?: string
}
