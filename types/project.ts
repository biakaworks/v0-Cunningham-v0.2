// =============================================================================
// Project Execution & Billing Types
// Phase 1 Stage 6
// =============================================================================

import type { FrappeDoc, Customer, Site, Tank } from './cunningham'

// -----------------------------------------------------------------------------
// Project Status Enum
// -----------------------------------------------------------------------------

export type ProjectStatus =
  | 'Setup'
  | 'Scheduled'
  | 'Active'
  | 'Blocked'
  | 'Completed'
  | 'Billing Pending'
  | 'Closed'
  | 'Canceled'

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  'Setup',
  'Scheduled',
  'Active',
  'Blocked',
  'Completed',
  'Billing Pending',
  'Closed',
  'Canceled',
]

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  Setup: 'bg-amber-100 text-amber-800 border-amber-300',
  Scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
  Active: 'bg-green-100 text-green-800 border-green-300',
  Blocked: 'bg-red-100 text-red-800 border-red-300',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Billing Pending': 'bg-purple-100 text-purple-800 border-purple-300',
  Closed: 'bg-gray-100 text-gray-800 border-gray-300',
  Canceled: 'bg-gray-200 text-gray-500 border-gray-300',
}

// -----------------------------------------------------------------------------
// Setup Checklist
// -----------------------------------------------------------------------------

export type SetupItemStatus = 'Not Started' | 'In Progress' | 'Complete' | 'Waived'

export interface SetupChecklistItem {
  id: string
  name: string
  description?: string
  owner?: string
  due_date?: string
  status: SetupItemStatus
  notes?: string
  waived_reason?: string
  completed_date?: string
  completed_by?: string
}

export const DEFAULT_SETUP_ITEMS: Omit<SetupChecklistItem, 'id'>[] = [
  { name: 'Contract signed', status: 'Not Started' },
  { name: 'Job sheet created', status: 'Not Started' },
  { name: 'Materials list finalized', status: 'Not Started' },
  { name: 'Paint specified', status: 'Not Started' },
  { name: 'Equipment booked', status: 'Not Started' },
  { name: 'Dumpsters arranged', status: 'Not Started' },
  { name: 'Containment planned', status: 'Not Started' },
  { name: 'Crew assigned', status: 'Not Started' },
  { name: 'Schedule confirmed', status: 'Not Started' },
  { name: 'Safety plan completed', status: 'Not Started' },
  { name: 'Billing milestones defined', status: 'Not Started' },
]

// -----------------------------------------------------------------------------
// Materials
// -----------------------------------------------------------------------------

export type MaterialStatus =
  | 'Not Ordered'
  | 'Ordered'
  | 'In Transit'
  | 'Delivered'
  | 'Delayed'
  | 'Missing'
  | 'Changed'

export const MATERIAL_STATUS_COLORS: Record<MaterialStatus, string> = {
  'Not Ordered': 'bg-gray-100 text-gray-700',
  Ordered: 'bg-blue-100 text-blue-700',
  'In Transit': 'bg-cyan-100 text-cyan-700',
  Delivered: 'bg-green-100 text-green-700',
  Delayed: 'bg-amber-100 text-amber-700',
  Missing: 'bg-red-100 text-red-700',
  Changed: 'bg-purple-100 text-purple-700',
}

export interface ProjectMaterial {
  id: string
  item: string
  vendor?: string
  quantity: number
  unit: string
  cost_estimate?: number
  order_date?: string
  expected_delivery?: string
  delivery_location?: string
  status: MaterialStatus
  last_update?: string
  notes?: string
}

// -----------------------------------------------------------------------------
// Equipment
// -----------------------------------------------------------------------------

export type EquipmentStatus = 'Reserved' | 'Delivered' | 'In Use' | 'Returned' | 'Issue'

export interface ProjectEquipment {
  id: string
  vendor: string
  item: string
  delivery_date?: string
  return_date?: string
  location?: string
  status: EquipmentStatus
  daily_rate?: number
  notes?: string
}

// -----------------------------------------------------------------------------
// Daily Logs
// -----------------------------------------------------------------------------

export interface ProjectDailyLog {
  id: string
  date: string
  crew: string
  weather?: string
  temperature_high?: number
  temperature_low?: number
  work_completed: string
  issues?: string
  photos?: string[]
  inspector_notes?: string
  next_steps?: string
  submitted_by: string
  submitted_at: string
}

// -----------------------------------------------------------------------------
// Material Exceptions
// -----------------------------------------------------------------------------

export type ExceptionType =
  | 'Late'
  | 'Missing'
  | 'Damaged'
  | 'Short'
  | 'Overage'
  | 'Wrong Item'
  | 'Changed'

export type ExceptionResolutionStatus = 'Open' | 'In Progress' | 'Resolved'

export interface MaterialException {
  id: string
  material_id: string
  vendor: string
  item: string
  expected_date?: string
  actual_date?: string
  issue_type: ExceptionType
  notes?: string
  owner?: string
  resolution_status: ExceptionResolutionStatus
  resolution_notes?: string
  resolved_date?: string
  resolved_by?: string
}

// -----------------------------------------------------------------------------
// Billing Milestones
// -----------------------------------------------------------------------------

export type MilestoneStatus =
  | 'Not Ready'
  | 'Ready to Bill'
  | 'Submitted'
  | 'Approved'
  | 'Invoiced'
  | 'Paid'
  | 'Blocked'

export const MILESTONE_STATUS_COLORS: Record<MilestoneStatus, string> = {
  'Not Ready': 'bg-gray-100 text-gray-700',
  'Ready to Bill': 'bg-amber-100 text-amber-700',
  Submitted: 'bg-blue-100 text-blue-700',
  Approved: 'bg-cyan-100 text-cyan-700',
  Invoiced: 'bg-purple-100 text-purple-700',
  Paid: 'bg-green-100 text-green-700',
  Blocked: 'bg-red-100 text-red-700',
}

export interface BillingMilestone {
  id: string
  project_id: string
  milestone_name: string
  amount: number
  status: MilestoneStatus
  due_date?: string
  invoice_reference?: string // QuickBooks ID
  qb_invoice_number?: string
  qb_invoice_status?: string
  qb_payment_status?: string
  qb_last_sync?: string
  owner?: string
  notes?: string
  status_history?: MilestoneStatusChange[]
}

export interface MilestoneStatusChange {
  from_status: MilestoneStatus
  to_status: MilestoneStatus
  changed_by: string
  changed_at: string
  notes?: string
}

// -----------------------------------------------------------------------------
// Closeout Checklist
// -----------------------------------------------------------------------------

export type CloseoutItemStatus = 'Required' | 'Complete' | 'Waived'

export interface CloseoutChecklistItem {
  id: string
  name: string
  is_required: boolean
  status: CloseoutItemStatus
  completed_date?: string
  completed_by?: string
  waived_reason?: string
}

export const DEFAULT_CLOSEOUT_ITEMS: Omit<CloseoutChecklistItem, 'id'>[] = [
  { name: 'Completion form signed', is_required: true, status: 'Required' },
  { name: 'Final photos uploaded', is_required: true, status: 'Required' },
  { name: 'Customer signoff received', is_required: true, status: 'Required' },
  { name: 'Final notes documented', is_required: false, status: 'Required' },
  { name: 'Billing trigger fired', is_required: true, status: 'Required' },
  { name: 'Document package archived', is_required: false, status: 'Required' },
]

// -----------------------------------------------------------------------------
// Full Project Type
// -----------------------------------------------------------------------------

export interface ProjectFull extends FrappeDoc {
  project_number: string
  project_name: string
  customer: string
  customer_name?: string
  site: string
  site_name?: string
  tank?: string
  tank_name?: string
  contract_value: number
  contract_date?: string
  contract_end_date?: string
  owner?: string
  owner_name?: string
  status: ProjectStatus
  blocked_reason?: string
  blocked_next_action?: string
  blocked_date?: string
  
  // Schedule
  start_date?: string
  projected_end_date?: string
  actual_end_date?: string
  
  // Linked records
  source_proposal?: string
  source_proposal_number?: string
  source_contract?: string
  source_contract_number?: string
  
  // Percent complete
  percent_complete: number
  
  // Sub-tables
  setup_checklist: SetupChecklistItem[]
  materials: ProjectMaterial[]
  equipment: ProjectEquipment[]
  daily_logs: ProjectDailyLog[]
  material_exceptions: MaterialException[]
  billing_milestones: BillingMilestone[]
  closeout_checklist: CloseoutChecklistItem[]
  
  // Status history
  status_history?: ProjectStatusChange[]
}

export interface ProjectStatusChange {
  from_status: ProjectStatus
  to_status: ProjectStatus
  changed_by: string
  changed_at: string
  reason?: string
  next_action?: string
}

// -----------------------------------------------------------------------------
// Project List Item (lighter weight for list views)
// -----------------------------------------------------------------------------

export interface ProjectListItem {
  name: string
  project_number: string
  project_name: string
  customer: string
  customer_name: string
  site: string
  site_name: string
  contract_value: number
  status: ProjectStatus
  percent_complete: number
  owner?: string
  owner_name?: string
  start_date?: string
  projected_end_date?: string
  setup_incomplete_count: number
  closeout_incomplete_count: number
  has_open_exceptions: boolean
}

// -----------------------------------------------------------------------------
// Job Cost Snapshot
// -----------------------------------------------------------------------------

export type CostFieldSource = 'Estimated' | 'Actual' | 'Unavailable'

export interface JobCostField {
  label: string
  value: number | null
  source: CostFieldSource
  source_detail?: string
}

export interface JobCostSnapshot {
  contract_value: JobCostField
  material_cost: JobCostField
  equipment_cost: JobCostField
  labor_cost: JobCostField
  margin: JobCostField
}

// -----------------------------------------------------------------------------
// Billing List Item (for /billing page)
// -----------------------------------------------------------------------------

export interface BillingListItem extends BillingMilestone {
  project_number: string
  project_name: string
  customer: string
  customer_name: string
  site?: string
  site_name?: string
}

// -----------------------------------------------------------------------------
// Permission Gating
// -----------------------------------------------------------------------------

export interface UserPermissions {
  can_view_financials: boolean
  can_edit_financials: boolean
  can_view_margins: boolean
  can_view_payroll: boolean
  role: 'leadership' | 'project_manager' | 'field_crew' | 'office' | 'readonly'
}

export const FINANCIAL_FIELDS = [
  'contract_value',
  'margin',
  'invoice_amount',
  'material_cost',
  'equipment_cost',
  'labor_cost',
] as const

export type FinancialField = typeof FINANCIAL_FIELDS[number]
