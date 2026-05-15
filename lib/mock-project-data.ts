// =============================================================================
// Mock Project Data
// =============================================================================

import type {
  ProjectFull,
  ProjectListItem,
  BillingListItem,
  ProjectStatus,
  SetupChecklistItem,
  ProjectMaterial,
  ProjectEquipment,
  ProjectDailyLog,
  MaterialException,
  BillingMilestone,
  CloseoutChecklistItem,
  MilestoneStatus,
} from '@/types/project'

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// -----------------------------------------------------------------------------
// Mock Projects
// -----------------------------------------------------------------------------

export const mockProjects: ProjectFull[] = [
  {
    name: 'PROJ-2026-001',
    project_number: 'PROJ-2026-001',
    project_name: 'Springfield Elevated Tank Recoating',
    customer: 'CUST-001',
    customer_name: 'Springfield Municipal Water',
    site: 'SITE-001',
    site_name: 'Main St Water Tower',
    tank: 'TANK-001',
    tank_name: 'Tower #1 - Spheroid',
    contract_value: 485000,
    contract_date: '2026-01-15',
    contract_end_date: '2026-06-30',
    owner: 'USER-002',
    owner_name: 'Mike Johnson',
    status: 'Active',
    start_date: '2026-02-01',
    projected_end_date: '2026-05-15',
    percent_complete: 45,
    source_proposal: 'PROP-2025-042',
    source_proposal_number: 'PROP-2025-042',
    source_contract: 'CONT-2026-001',
    source_contract_number: 'CONT-2026-001',
    creation: '2026-01-15T10:00:00Z',
    modified: '2026-03-10T14:30:00Z',
    modified_by: 'USER-002',
    docstatus: 1,
    setup_checklist: [
      { id: 'SC-001', name: 'Contract signed', status: 'Complete', completed_date: '2026-01-15', completed_by: 'USER-001' },
      { id: 'SC-002', name: 'Job sheet created', status: 'Complete', completed_date: '2026-01-18', completed_by: 'USER-002' },
      { id: 'SC-003', name: 'Materials list finalized', status: 'Complete', completed_date: '2026-01-20', completed_by: 'USER-002' },
      { id: 'SC-004', name: 'Paint specified', status: 'Complete', completed_date: '2026-01-22', completed_by: 'USER-002' },
      { id: 'SC-005', name: 'Equipment booked', status: 'Complete', completed_date: '2026-01-25', completed_by: 'USER-002' },
      { id: 'SC-006', name: 'Dumpsters arranged', status: 'Complete', completed_date: '2026-01-27', completed_by: 'USER-003' },
      { id: 'SC-007', name: 'Containment planned', status: 'Complete', completed_date: '2026-01-28', completed_by: 'USER-002' },
      { id: 'SC-008', name: 'Crew assigned', status: 'Complete', completed_date: '2026-01-29', completed_by: 'USER-002' },
      { id: 'SC-009', name: 'Schedule confirmed', status: 'Complete', completed_date: '2026-01-30', completed_by: 'USER-001' },
      { id: 'SC-010', name: 'Safety plan completed', status: 'Complete', completed_date: '2026-01-31', completed_by: 'USER-004' },
      { id: 'SC-011', name: 'Billing milestones defined', status: 'Complete', completed_date: '2026-01-31', completed_by: 'USER-001' },
    ],
    materials: [
      { id: 'MAT-001', item: 'Epoxy Primer 100 Series', vendor: 'PPG Industrial', quantity: 150, unit: 'gal', cost_estimate: 12500, order_date: '2026-01-22', expected_delivery: '2026-02-05', delivery_location: 'Site', status: 'Delivered', last_update: '2026-02-05' },
      { id: 'MAT-002', item: 'Polyurethane Topcoat - Navy Blue', vendor: 'PPG Industrial', quantity: 200, unit: 'gal', cost_estimate: 18000, order_date: '2026-01-22', expected_delivery: '2026-02-10', delivery_location: 'Site', status: 'Delivered', last_update: '2026-02-10' },
      { id: 'MAT-003', item: 'Abrasive Media - Steel Grit', vendor: 'U.S. Minerals', quantity: 5000, unit: 'lbs', cost_estimate: 3500, order_date: '2026-01-25', expected_delivery: '2026-02-01', delivery_location: 'Site', status: 'Delivered', last_update: '2026-02-01' },
      { id: 'MAT-004', item: 'Interior Coating - NSF 61', vendor: 'Tnemec', quantity: 100, unit: 'gal', cost_estimate: 15000, order_date: '2026-02-15', expected_delivery: '2026-03-20', delivery_location: 'Site', status: 'In Transit', last_update: '2026-03-10' },
    ],
    equipment: [
      { id: 'EQ-001', vendor: 'Sunbelt Rentals', item: 'Man-lift 60ft', delivery_date: '2026-02-01', return_date: '2026-05-15', location: 'Site', status: 'In Use', daily_rate: 250 },
      { id: 'EQ-002', vendor: 'Equipment Share', item: 'Blast Pot - 6 cu ft', delivery_date: '2026-02-01', return_date: '2026-04-15', location: 'Site', status: 'In Use', daily_rate: 175 },
      { id: 'EQ-003', vendor: 'Equipment Share', item: 'Compressor 375 CFM', delivery_date: '2026-02-01', return_date: '2026-04-15', location: 'Site', status: 'In Use', daily_rate: 300 },
      { id: 'EQ-004', vendor: 'Cunningham Owned', item: 'Spray Rig', delivery_date: '2026-02-01', return_date: '2026-05-15', location: 'Site', status: 'In Use', notes: 'Company asset #SR-007' },
    ],
    daily_logs: [
      { id: 'LOG-001', date: '2026-03-10', crew: 'Alpha Crew', weather: 'Sunny, 65°F', work_completed: 'Completed exterior blast on west quadrant. Profile achieved 2.5-3.0 mil.', issues: 'Minor delay due to wind conditions in AM', photos: ['photo-001.jpg', 'photo-002.jpg'], inspector_notes: 'Profile readings confirmed', next_steps: 'Continue blast work on north quadrant', submitted_by: 'USER-005', submitted_at: '2026-03-10T17:30:00Z' },
      { id: 'LOG-002', date: '2026-03-09', crew: 'Alpha Crew', weather: 'Cloudy, 58°F', work_completed: 'Continued exterior surface prep. Completed 40% of sandblasting.', photos: ['photo-003.jpg'], next_steps: 'Complete west quadrant blast', submitted_by: 'USER-005', submitted_at: '2026-03-09T17:15:00Z' },
      { id: 'LOG-003', date: '2026-03-08', crew: 'Alpha Crew', weather: 'Rain AM, Clear PM', work_completed: 'Rain delay until 1pm. Resumed surface prep in afternoon.', issues: 'Lost half day to weather', submitted_by: 'USER-005', submitted_at: '2026-03-08T16:00:00Z' },
    ],
    material_exceptions: [
      { id: 'EXC-001', material_id: 'MAT-004', vendor: 'Tnemec', item: 'Interior Coating - NSF 61', expected_date: '2026-03-15', actual_date: '2026-03-20', issue_type: 'Late', notes: 'Vendor supply chain delay', owner: 'USER-002', resolution_status: 'In Progress', resolution_notes: 'Working with vendor on expedited shipping' },
    ],
    billing_milestones: [
      { id: 'BM-001', project_id: 'PROJ-2026-001', milestone_name: 'Mobilization', amount: 48500, status: 'Paid', due_date: '2026-02-01', invoice_reference: 'QB-INV-2026-0042', qb_invoice_number: 'INV-2026-0042', qb_invoice_status: 'Paid', qb_payment_status: 'Full Payment', qb_last_sync: '2026-02-15T08:00:00Z' },
      { id: 'BM-002', project_id: 'PROJ-2026-001', milestone_name: 'Surface Prep Complete - 50%', amount: 145500, status: 'Ready to Bill', due_date: '2026-03-15' },
      { id: 'BM-003', project_id: 'PROJ-2026-001', milestone_name: 'Exterior Coating Complete', amount: 145500, status: 'Not Ready', due_date: '2026-04-30' },
      { id: 'BM-004', project_id: 'PROJ-2026-001', milestone_name: 'Final Completion', amount: 145500, status: 'Not Ready', due_date: '2026-05-15' },
    ],
    closeout_checklist: [
      { id: 'CO-001', name: 'Completion form signed', is_required: true, status: 'Required' },
      { id: 'CO-002', name: 'Final photos uploaded', is_required: true, status: 'Required' },
      { id: 'CO-003', name: 'Customer signoff received', is_required: true, status: 'Required' },
      { id: 'CO-004', name: 'Final notes documented', is_required: false, status: 'Required' },
      { id: 'CO-005', name: 'Billing trigger fired', is_required: true, status: 'Required' },
      { id: 'CO-006', name: 'Document package archived', is_required: false, status: 'Required' },
    ],
    status_history: [
      { from_status: 'Setup', to_status: 'Scheduled', changed_by: 'USER-001', changed_at: '2026-01-31T10:00:00Z' },
      { from_status: 'Scheduled', to_status: 'Active', changed_by: 'USER-002', changed_at: '2026-02-01T08:00:00Z' },
    ],
  },
  {
    name: 'PROJ-2026-002',
    project_number: 'PROJ-2026-002',
    project_name: 'Riverside Emergency Repair',
    customer: 'CUST-002',
    customer_name: 'Riverside Water Authority',
    site: 'SITE-003',
    site_name: 'Industrial Park Tower',
    tank: 'TANK-003',
    tank_name: 'Tower B - Ground Reservoir',
    contract_value: 125000,
    contract_date: '2026-02-20',
    owner: 'USER-003',
    owner_name: 'Sarah Williams',
    status: 'Setup',
    start_date: '2026-04-01',
    projected_end_date: '2026-04-30',
    percent_complete: 0,
    source_proposal: 'PROP-2026-008',
    source_proposal_number: 'PROP-2026-008',
    creation: '2026-02-20T14:00:00Z',
    modified: '2026-03-05T09:00:00Z',
    modified_by: 'USER-003',
    docstatus: 1,
    setup_checklist: [
      { id: 'SC-101', name: 'Contract signed', status: 'Complete', completed_date: '2026-02-20', completed_by: 'USER-001' },
      { id: 'SC-102', name: 'Job sheet created', status: 'In Progress', owner: 'USER-003', due_date: '2026-03-15' },
      { id: 'SC-103', name: 'Materials list finalized', status: 'Not Started', owner: 'USER-003', due_date: '2026-03-18' },
      { id: 'SC-104', name: 'Paint specified', status: 'Not Started', due_date: '2026-03-18' },
      { id: 'SC-105', name: 'Equipment booked', status: 'Not Started', due_date: '2026-03-20' },
      { id: 'SC-106', name: 'Dumpsters arranged', status: 'Not Started', due_date: '2026-03-25' },
      { id: 'SC-107', name: 'Containment planned', status: 'Not Started', due_date: '2026-03-25' },
      { id: 'SC-108', name: 'Crew assigned', status: 'Not Started', due_date: '2026-03-28' },
      { id: 'SC-109', name: 'Schedule confirmed', status: 'Not Started', due_date: '2026-03-30' },
      { id: 'SC-110', name: 'Safety plan completed', status: 'Not Started', due_date: '2026-03-30' },
      { id: 'SC-111', name: 'Billing milestones defined', status: 'Not Started', due_date: '2026-03-30' },
    ],
    materials: [],
    equipment: [],
    daily_logs: [],
    material_exceptions: [],
    billing_milestones: [
      { id: 'BM-101', project_id: 'PROJ-2026-002', milestone_name: 'Mobilization (10%)', amount: 12500, status: 'Not Ready', due_date: '2026-04-01' },
      { id: 'BM-102', project_id: 'PROJ-2026-002', milestone_name: 'Repair Complete (50%)', amount: 62500, status: 'Not Ready', due_date: '2026-04-20' },
      { id: 'BM-103', project_id: 'PROJ-2026-002', milestone_name: 'Final Completion (40%)', amount: 50000, status: 'Not Ready', due_date: '2026-04-30' },
    ],
    closeout_checklist: [
      { id: 'CO-101', name: 'Completion form signed', is_required: true, status: 'Required' },
      { id: 'CO-102', name: 'Final photos uploaded', is_required: true, status: 'Required' },
      { id: 'CO-103', name: 'Customer signoff received', is_required: true, status: 'Required' },
      { id: 'CO-104', name: 'Final notes documented', is_required: false, status: 'Required' },
      { id: 'CO-105', name: 'Billing trigger fired', is_required: true, status: 'Required' },
      { id: 'CO-106', name: 'Document package archived', is_required: false, status: 'Required' },
    ],
  },
  {
    name: 'PROJ-2025-015',
    project_number: 'PROJ-2025-015',
    project_name: 'Oak Park Interior Recoating',
    customer: 'CUST-004',
    customer_name: 'Oak Park Village',
    site: 'SITE-004',
    site_name: 'Oak Park Elevated',
    tank: 'TANK-004',
    tank_name: 'Village Tower',
    contract_value: 320000,
    contract_date: '2025-09-15',
    contract_end_date: '2026-02-28',
    owner: 'USER-002',
    owner_name: 'Mike Johnson',
    status: 'Billing Pending',
    start_date: '2025-10-01',
    projected_end_date: '2026-01-31',
    actual_end_date: '2026-02-15',
    percent_complete: 100,
    source_proposal: 'PROP-2025-028',
    source_proposal_number: 'PROP-2025-028',
    source_contract: 'CONT-2025-015',
    source_contract_number: 'CONT-2025-015',
    creation: '2025-09-15T10:00:00Z',
    modified: '2026-03-01T11:00:00Z',
    modified_by: 'USER-002',
    docstatus: 1,
    setup_checklist: [
      { id: 'SC-201', name: 'Contract signed', status: 'Complete', completed_date: '2025-09-15' },
      { id: 'SC-202', name: 'Job sheet created', status: 'Complete', completed_date: '2025-09-18' },
      { id: 'SC-203', name: 'Materials list finalized', status: 'Complete', completed_date: '2025-09-20' },
      { id: 'SC-204', name: 'Paint specified', status: 'Complete', completed_date: '2025-09-20' },
      { id: 'SC-205', name: 'Equipment booked', status: 'Complete', completed_date: '2025-09-22' },
      { id: 'SC-206', name: 'Dumpsters arranged', status: 'Complete', completed_date: '2025-09-25' },
      { id: 'SC-207', name: 'Containment planned', status: 'Complete', completed_date: '2025-09-25' },
      { id: 'SC-208', name: 'Crew assigned', status: 'Complete', completed_date: '2025-09-28' },
      { id: 'SC-209', name: 'Schedule confirmed', status: 'Complete', completed_date: '2025-09-30' },
      { id: 'SC-210', name: 'Safety plan completed', status: 'Complete', completed_date: '2025-09-30' },
      { id: 'SC-211', name: 'Billing milestones defined', status: 'Complete', completed_date: '2025-09-30' },
    ],
    materials: [
      { id: 'MAT-201', item: 'NSF 61 Interior Epoxy', vendor: 'Tnemec', quantity: 120, unit: 'gal', cost_estimate: 18000, status: 'Delivered' },
      { id: 'MAT-202', item: 'Surface Tolerant Primer', vendor: 'Tnemec', quantity: 60, unit: 'gal', cost_estimate: 6000, status: 'Delivered' },
    ],
    equipment: [],
    daily_logs: [],
    material_exceptions: [],
    billing_milestones: [
      { id: 'BM-201', project_id: 'PROJ-2025-015', milestone_name: 'Mobilization', amount: 32000, status: 'Paid', invoice_reference: 'QB-INV-2025-0128', qb_last_sync: '2025-10-15T08:00:00Z' },
      { id: 'BM-202', project_id: 'PROJ-2025-015', milestone_name: 'Tank Drained & Prepped', amount: 96000, status: 'Paid', invoice_reference: 'QB-INV-2025-0145', qb_last_sync: '2025-11-20T08:00:00Z' },
      { id: 'BM-203', project_id: 'PROJ-2025-015', milestone_name: 'Interior Coating Complete', amount: 96000, status: 'Invoiced', invoice_reference: 'QB-INV-2026-0018', qb_invoice_status: 'Sent', qb_last_sync: '2026-02-20T08:00:00Z' },
      { id: 'BM-204', project_id: 'PROJ-2025-015', milestone_name: 'Final Completion & Retainage', amount: 96000, status: 'Ready to Bill', due_date: '2026-03-15' },
    ],
    closeout_checklist: [
      { id: 'CO-201', name: 'Completion form signed', is_required: true, status: 'Complete', completed_date: '2026-02-15' },
      { id: 'CO-202', name: 'Final photos uploaded', is_required: true, status: 'Complete', completed_date: '2026-02-15' },
      { id: 'CO-203', name: 'Customer signoff received', is_required: true, status: 'Complete', completed_date: '2026-02-18' },
      { id: 'CO-204', name: 'Final notes documented', is_required: false, status: 'Complete', completed_date: '2026-02-20' },
      { id: 'CO-205', name: 'Billing trigger fired', is_required: true, status: 'Required' },
      { id: 'CO-206', name: 'Document package archived', is_required: false, status: 'Required' },
    ],
  },
  {
    name: 'PROJ-2026-003',
    project_number: 'PROJ-2026-003',
    project_name: 'Lakewood Annual Maintenance',
    customer: 'CUST-003',
    customer_name: 'Lakewood Township',
    site: 'SITE-002',
    site_name: 'Lakewood Municipal',
    contract_value: 45000,
    contract_date: '2026-01-10',
    owner: 'USER-004',
    owner_name: 'Tom Davis',
    status: 'Blocked',
    blocked_reason: 'Customer requested delay due to budget review',
    blocked_next_action: 'Follow up with customer on 3/25 for revised schedule',
    blocked_date: '2026-03-01',
    start_date: '2026-03-15',
    projected_end_date: '2026-03-30',
    percent_complete: 10,
    source_proposal: 'PROP-2025-055',
    source_proposal_number: 'PROP-2025-055',
    creation: '2026-01-10T09:00:00Z',
    modified: '2026-03-01T14:00:00Z',
    modified_by: 'USER-004',
    docstatus: 1,
    setup_checklist: [
      { id: 'SC-301', name: 'Contract signed', status: 'Complete', completed_date: '2026-01-10' },
      { id: 'SC-302', name: 'Job sheet created', status: 'Complete', completed_date: '2026-01-12' },
      { id: 'SC-303', name: 'Materials list finalized', status: 'Not Started' },
      { id: 'SC-304', name: 'Paint specified', status: 'Waived', waived_reason: 'Maintenance only - no painting' },
      { id: 'SC-305', name: 'Equipment booked', status: 'Not Started' },
      { id: 'SC-306', name: 'Dumpsters arranged', status: 'Waived', waived_reason: 'Not needed for maintenance' },
      { id: 'SC-307', name: 'Containment planned', status: 'Waived', waived_reason: 'Not needed for maintenance' },
      { id: 'SC-308', name: 'Crew assigned', status: 'Not Started' },
      { id: 'SC-309', name: 'Schedule confirmed', status: 'Not Started' },
      { id: 'SC-310', name: 'Safety plan completed', status: 'Not Started' },
      { id: 'SC-311', name: 'Billing milestones defined', status: 'Complete', completed_date: '2026-01-15' },
    ],
    materials: [],
    equipment: [],
    daily_logs: [],
    material_exceptions: [],
    billing_milestones: [
      { id: 'BM-301', project_id: 'PROJ-2026-003', milestone_name: 'Completion', amount: 45000, status: 'Blocked', due_date: '2026-03-30', notes: 'Blocked pending customer schedule' },
    ],
    closeout_checklist: [
      { id: 'CO-301', name: 'Completion form signed', is_required: true, status: 'Required' },
      { id: 'CO-302', name: 'Final photos uploaded', is_required: true, status: 'Required' },
      { id: 'CO-303', name: 'Customer signoff received', is_required: true, status: 'Required' },
      { id: 'CO-304', name: 'Final notes documented', is_required: false, status: 'Required' },
      { id: 'CO-305', name: 'Billing trigger fired', is_required: true, status: 'Required' },
      { id: 'CO-306', name: 'Document package archived', is_required: false, status: 'Required' },
    ],
    status_history: [
      { from_status: 'Setup', to_status: 'Scheduled', changed_by: 'USER-004', changed_at: '2026-01-15T10:00:00Z' },
      { from_status: 'Scheduled', to_status: 'Active', changed_by: 'USER-004', changed_at: '2026-03-01T08:00:00Z' },
      { from_status: 'Active', to_status: 'Blocked', changed_by: 'USER-004', changed_at: '2026-03-01T14:00:00Z', reason: 'Customer requested delay due to budget review', next_action: 'Follow up with customer on 3/25 for revised schedule' },
    ],
  },
]

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

export function getProjectById(id: string): ProjectFull | undefined {
  return mockProjects.find(p => p.name === id || p.project_number === id)
}

export function getProjectListItems(): ProjectListItem[] {
  return mockProjects.map(p => ({
    name: p.name,
    project_number: p.project_number,
    project_name: p.project_name,
    customer: p.customer,
    customer_name: p.customer_name || '',
    site: p.site,
    site_name: p.site_name || '',
    contract_value: p.contract_value,
    status: p.status,
    percent_complete: p.percent_complete,
    owner: p.owner,
    owner_name: p.owner_name,
    start_date: p.start_date,
    projected_end_date: p.projected_end_date,
    setup_incomplete_count: p.setup_checklist.filter(i => i.status !== 'Complete' && i.status !== 'Waived').length,
    closeout_incomplete_count: p.closeout_checklist.filter(i => i.status === 'Required' && i.is_required).length,
    has_open_exceptions: p.material_exceptions.some(e => e.resolution_status !== 'Resolved'),
  }))
}

export function getAllBillingMilestones(): BillingListItem[] {
  const milestones: BillingListItem[] = []
  
  for (const project of mockProjects) {
    for (const milestone of project.billing_milestones) {
      milestones.push({
        ...milestone,
        project_number: project.project_number,
        project_name: project.project_name,
        customer: project.customer,
        customer_name: project.customer_name || '',
        site: project.site,
        site_name: project.site_name,
      })
    }
  }
  
  return milestones
}

export function getProjectSummary() {
  const projects = mockProjects
  
  const byStatus: Record<ProjectStatus, number> = {
    Setup: 0,
    Scheduled: 0,
    Active: 0,
    Blocked: 0,
    Completed: 0,
    'Billing Pending': 0,
    Closed: 0,
    Canceled: 0,
  }
  
  let totalValue = 0
  let activeValue = 0
  
  for (const p of projects) {
    byStatus[p.status]++
    totalValue += p.contract_value
    if (p.status === 'Active' || p.status === 'Scheduled') {
      activeValue += p.contract_value
    }
  }
  
  return {
    total_count: projects.length,
    active_count: byStatus.Active + byStatus.Scheduled,
    blocked_count: byStatus.Blocked,
    billing_pending_count: byStatus['Billing Pending'],
    total_value: totalValue,
    active_value: activeValue,
    by_status: byStatus,
  }
}

export function getBillingSummary() {
  const milestones = getAllBillingMilestones()
  
  const byStatus: Record<MilestoneStatus, { count: number; amount: number }> = {
    'Not Ready': { count: 0, amount: 0 },
    'Ready to Bill': { count: 0, amount: 0 },
    Submitted: { count: 0, amount: 0 },
    Approved: { count: 0, amount: 0 },
    Invoiced: { count: 0, amount: 0 },
    Paid: { count: 0, amount: 0 },
    Blocked: { count: 0, amount: 0 },
  }
  
  for (const m of milestones) {
    byStatus[m.status].count++
    byStatus[m.status].amount += m.amount
  }
  
  return {
    total_milestones: milestones.length,
    ready_to_bill_count: byStatus['Ready to Bill'].count,
    ready_to_bill_amount: byStatus['Ready to Bill'].amount,
    invoiced_count: byStatus.Invoiced.count,
    invoiced_amount: byStatus.Invoiced.amount,
    paid_amount: byStatus.Paid.amount,
    blocked_count: byStatus.Blocked.count,
    by_status: byStatus,
  }
}

// Mock users for owner dropdown
export const mockProjectOwners = [
  { id: 'USER-001', name: 'John Smith' },
  { id: 'USER-002', name: 'Mike Johnson' },
  { id: 'USER-003', name: 'Sarah Williams' },
  { id: 'USER-004', name: 'Tom Davis' },
  { id: 'USER-005', name: 'Carlos Rodriguez' },
]
