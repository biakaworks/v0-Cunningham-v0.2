// Pipeline-specific types and configurations

import type { Proposal, ProposalStatus, ProposalType } from './cunningham'

export const PROPOSAL_STATUSES: ProposalStatus[] = [
  'Draft',
  'Sent',
  'Follow-Up Due',
  'Pending Board Approval',
  'Won',
  'Lost',
  'Expired',
  'Dormant'
]

export const ACTIVE_STATUSES: ProposalStatus[] = [
  'Draft',
  'Sent',
  'Follow-Up Due',
  'Pending Board Approval'
]

export const CLOSED_STATUSES: ProposalStatus[] = [
  'Won',
  'Lost',
  'Expired',
  'Dormant'
]

export const STATUS_COLORS: Record<ProposalStatus, string> = {
  'Draft': 'bg-gray-100 text-gray-700 border-gray-300',
  'Sent': 'bg-blue-100 text-blue-700 border-blue-300',
  'Follow-Up Due': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Pending Board Approval': 'bg-purple-100 text-purple-700 border-purple-300',
  'Won': 'bg-green-100 text-green-700 border-green-300',
  'Lost': 'bg-red-100 text-red-700 border-red-300',
  'Expired': 'bg-orange-100 text-orange-700 border-orange-300',
  'Dormant': 'bg-slate-100 text-slate-700 border-slate-300'
}

export const STATUS_DOT_COLORS: Record<ProposalStatus, string> = {
  'Draft': 'bg-gray-500',
  'Sent': 'bg-blue-500',
  'Follow-Up Due': 'bg-yellow-500',
  'Pending Board Approval': 'bg-purple-500',
  'Won': 'bg-green-500',
  'Lost': 'bg-red-500',
  'Expired': 'bg-orange-500',
  'Dormant': 'bg-slate-500'
}

export const TYPE_COLORS: Record<ProposalType, string> = {
  'Engineered Spec': 'bg-mwi-navy text-white',
  'Negotiated': 'bg-mwi-accent text-mwi-navy'
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

export interface PipelineProposal extends Proposal {
  customer_name: string
  site_name: string
  age_days: number
  is_stale: boolean
  owner_name: string
  owner_avatar?: string
  is_revived?: boolean
  original_proposal?: string
  revived_to?: string
}

export type ViewMode = 'kanban' | 'table' | 'map'
export type TypeFilter = 'all' | 'engineered' | 'negotiated'
