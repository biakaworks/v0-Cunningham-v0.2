// =============================================================================
// Cunningham Operations Hub - TypeScript Types
// Phase 1 Data Spine - All DocTypes
// =============================================================================

// -----------------------------------------------------------------------------
// Base Types
// -----------------------------------------------------------------------------

export type DocStatus = 0 | 1 | 2; // 0 = Draft, 1 = Submitted, 2 = Cancelled

export interface FrappeDoc {
  name: string;
  creation: string;
  modified: string;
  modified_by: string;
  owner: string;
  docstatus: DocStatus;
}

// -----------------------------------------------------------------------------
// Customer & Contact
// -----------------------------------------------------------------------------

export type CustomerType = 'Municipality' | 'Utility' | 'Industrial' | 'Commercial' | 'Other';

export interface Customer extends FrappeDoc {
  customer_name: string;
  customer_type: CustomerType;
  website?: string;
  phone?: string;
  email?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_county?: string;
  notes?: string;
  is_active: 0 | 1;
  primary_contact?: string; // Link to Contact
  contacts?: Contact[]; // Virtual child list
  sites?: Site[]; // Virtual child list
}

export type ContactRole = 
  | 'Decision Maker'
  | 'Technical Contact'
  | 'Billing Contact'
  | 'Site Contact'
  | 'Other';

export interface Contact extends FrappeDoc {
  first_name: string;
  last_name: string;
  full_name: string; // Computed
  customer: string; // Link to Customer
  role: ContactRole;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  is_primary: 0 | 1;
  notes?: string;
  preferred_language: 'en' | 'es';
}

// -----------------------------------------------------------------------------
// Site & Tank
// -----------------------------------------------------------------------------

export type SiteStatus = 'Active' | 'Inactive' | 'Pending';

export interface Site extends FrappeDoc {
  site_name: string;
  customer: string; // Link to Customer
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  site_status: SiteStatus;
  access_instructions?: string;
  gate_code?: string;
  primary_contact?: string; // Link to Contact
  notes?: string;
  tanks?: Tank[]; // Virtual child list
}

export type TankType = 
  | 'Elevated - Spheroid'
  | 'Elevated - Pedestal'
  | 'Elevated - Multi-Leg'
  | 'Elevated - Fluted Column'
  | 'Ground - Standpipe'
  | 'Ground - Reservoir'
  | 'Ground - Clearwell'
  | 'Ground - Hydropillar'
  | 'Other';

export type TankMaterial = 'Steel' | 'Concrete' | 'Fiberglass' | 'Other';

export type TankCoatingType = 
  | 'Epoxy'
  | 'Polyurethane'
  | 'Glass-Lined'
  | 'Galvanized'
  | 'None'
  | 'Unknown'
  | 'Other';

export type ServiceStatus = 
  | 'Active - Current'
  | 'Active - Service Due'
  | 'Active - Overdue'
  | 'Inactive'
  | 'Decommissioned';

export interface Tank extends FrappeDoc {
  tank_name: string;
  site: string; // Link to Site
  customer: string; // Link to Customer (denormalized)
  tank_type: TankType;
  material: TankMaterial;
  capacity_gallons?: number;
  height_feet?: number;
  diameter_feet?: number;
  year_built?: number;
  coating_type?: TankCoatingType;
  coating_year?: number;
  last_inspection_date?: string;
  next_inspection_due?: string;
  last_service_date?: string;
  next_service_due?: string;
  service_status: ServiceStatus;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

// -----------------------------------------------------------------------------
// Service Visit & Inspection
// -----------------------------------------------------------------------------

export type ServiceVisitType = 
  | 'Annual Inspection'
  | 'Warranty Inspection'
  | '5-Year Inspection'
  | 'Spot Repair'
  | 'Emergency Service'
  | 'Washout'
  | 'Other';

export type ServiceVisitStatus = 
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'On Hold';

export interface ServiceVisit extends FrappeDoc {
  visit_number: string; // Auto-generated
  tank: string; // Link to Tank
  site: string; // Link to Site (denormalized)
  customer: string; // Link to Customer (denormalized)
  visit_type: ServiceVisitType;
  status: ServiceVisitStatus;
  scheduled_date?: string;
  actual_date?: string;
  assigned_crew?: string; // Link to User or Crew
  lead_technician?: string; // Link to User
  checklist_items?: ChecklistItem[];
  measurements?: Measurement[];
  notes?: string;
  weather_conditions?: string;
  temperature_f?: number;
  wind_conditions?: string;
  crew_hours?: number;
  report?: string; // Link to ServiceReport
}

export interface ChecklistItem {
  name?: string;
  idx: number;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  checklist_category: string;
  checklist_item: string;
  status: 'Pass' | 'Fail' | 'N/A' | 'Needs Attention';
  notes?: string;
  photo_required: 0 | 1;
  photo_taken: 0 | 1;
}

export interface Measurement {
  name?: string;
  idx: number;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  measurement_type: string;
  location: string;
  value: number;
  unit: string;
  min_acceptable?: number;
  max_acceptable?: number;
  status: 'Within Spec' | 'Out of Spec' | 'Needs Review';
  notes?: string;
}

// -----------------------------------------------------------------------------
// Service Report & Recommendations
// -----------------------------------------------------------------------------

export type ReportStatus = 
  | 'Draft'
  | 'In Review'
  | 'Approved'
  | 'Sent'
  | 'Acknowledged';

export interface ServiceReport extends FrappeDoc {
  report_number: string; // Auto-generated
  service_visit: string; // Link to ServiceVisit
  tank: string; // Link to Tank (denormalized)
  customer: string; // Link to Customer (denormalized)
  status: ReportStatus;
  report_date: string;
  executive_summary?: string;
  overall_condition: 'Good' | 'Fair' | 'Poor' | 'Critical';
  sections?: ReportSection[];
  recommendations?: Recommendation[];
  prepared_by?: string; // Link to User
  reviewed_by?: string; // Link to User
  approved_by?: string; // Link to User
  approved_date?: string;
  sent_date?: string;
  sent_to?: string;
  customer_acknowledged_date?: string;
}

export interface ReportSection {
  name?: string;
  idx: number;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  section_title: string;
  section_content: string;
  photos?: string; // JSON array of photo names
}

export type RecommendationPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type RecommendationType = 
  | 'Immediate Repair'
  | 'Scheduled Repair'
  | 'Coating'
  | 'Full Rehabilitation'
  | 'Monitoring'
  | 'No Action'
  | 'Other';

export interface Recommendation extends FrappeDoc {
  report: string; // Link to ServiceReport
  tank: string; // Link to Tank (denormalized)
  priority: RecommendationPriority;
  recommendation_type: RecommendationType;
  title: string;
  description: string;
  estimated_cost_low?: number;
  estimated_cost_high?: number;
  recommended_timeframe?: string;
  area_affected?: string;
  photos?: string; // JSON array of photo names
  converted_to_proposal: 0 | 1;
  proposal?: string; // Link to Proposal
}

// -----------------------------------------------------------------------------
// Opportunity & Proposal
// -----------------------------------------------------------------------------

export type OpportunitySource = 
  | 'Existing Customer'
  | 'Referral'
  | 'Bid List'
  | 'Website'
  | 'Trade Show'
  | 'Cold Call'
  | 'Inspection Finding'
  | 'Other';

export type OpportunityStatus = 
  | 'New'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiating'
  | 'Won'
  | 'Lost'
  | 'Dormant';

export interface Opportunity extends FrappeDoc {
  opportunity_name: string;
  customer: string; // Link to Customer
  site?: string; // Link to Site
  tank?: string; // Link to Tank
  source: OpportunitySource;
  status: OpportunityStatus;
  description?: string;
  estimated_value?: number;
  probability?: number;
  expected_close_date?: string;
  assigned_to?: string; // Link to User
  next_follow_up_date?: string;
  follow_up_notes?: string;
  lost_reason?: string;
  competitor?: string;
  notes?: string;
}

export type ProposalType = 'Engineered Spec' | 'Negotiated';

export type ProposalStatus = 
  | 'Draft'
  | 'Internal Review'
  | 'Sent'
  | 'Follow-Up Due'
  | 'Negotiating'
  | 'Won'
  | 'Lost'
  | 'Expired'
  | 'Dormant';

export interface Proposal extends FrappeDoc {
  proposal_number: string; // Auto-generated PROP-YYYY-####
  opportunity?: string; // Link to Opportunity
  customer: string; // Link to Customer
  site?: string; // Link to Site
  tank?: string; // Link to Tank
  proposal_type: ProposalType;
  status: ProposalStatus;
  title: string;
  scope_of_work?: string;
  line_items?: ProposalLineItem[];
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total?: number;
  valid_until?: string;
  sent_date?: string;
  prepared_by?: string; // Link to User
  approved_by?: string; // Link to User
  bid_due_date?: string; // For engineered specs
  bid_opening_date?: string;
  engineer_of_record?: string;
  bonding_required: 0 | 1;
  bond_amount?: number;
  prevailing_wage: 0 | 1;
  last_follow_up_date?: string;
  next_follow_up_date?: string;
  follow_up_notes?: string;
  won_date?: string;
  lost_date?: string;
  lost_reason?: string;
  competitor?: string;
  contract?: string; // Link to Contract
  notes?: string;
}

export interface ProposalLineItem {
  name?: string;
  idx: number;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  item_description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  cost_code?: string;
  notes?: string;
}

// -----------------------------------------------------------------------------
// Contract & Project
// -----------------------------------------------------------------------------

export type ContractStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled';

export interface Contract extends FrappeDoc {
  contract_number: string; // Auto-generated
  proposal: string; // Link to Proposal
  customer: string; // Link to Customer (denormalized)
  site?: string; // Link to Site (denormalized)
  status: ContractStatus;
  contract_date: string;
  start_date?: string;
  end_date?: string;
  contract_value: number;
  retainage_percent?: number;
  retainage_amount?: number;
  signed_date?: string;
  signed_by_customer?: string;
  signed_by_cunningham?: string;
  terms_and_conditions?: string;
  change_orders_total?: number;
  final_contract_value?: number;
  notes?: string;
  project?: string; // Link to Project
}

export type ProjectStatus = 
  | 'Planning'
  | 'Scheduled'
  | 'Mobilizing'
  | 'In Progress'
  | 'On Hold'
  | 'Punch List'
  | 'Completed'
  | 'Closed';

export interface Project extends FrappeDoc {
  project_number: string; // Auto-generated PROJ-YYYY-####
  project_name: string;
  contract: string; // Link to Contract
  customer: string; // Link to Customer (denormalized)
  site: string; // Link to Site (denormalized)
  tank: string; // Link to Tank (denormalized)
  status: ProjectStatus;
  project_manager?: string; // Link to User
  superintendent?: string; // Link to User
  scheduled_start_date?: string;
  actual_start_date?: string;
  scheduled_end_date?: string;
  actual_end_date?: string;
  budget?: number;
  actual_cost?: number;
  percent_complete?: number;
  tasks?: ProjectTask[];
  materials?: Material[];
  equipment?: Equipment[];
  daily_logs?: DailyLog[];
  material_exceptions?: MaterialException[];
  billing_milestones?: BillingMilestone[];
  notes?: string;
}

export type TaskStatus = 
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'On Hold'
  | 'Cancelled';

export interface ProjectTask {
  name?: string;
  idx: number;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  task_name: string;
  description?: string;
  status: TaskStatus;
  assigned_to?: string; // Link to User
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  estimated_hours?: number;
  actual_hours?: number;
  percent_complete?: number;
  predecessor_task?: string;
  notes?: string;
}

export interface Material {
  name?: string;
  idx: number;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  material_name: string;
  material_code?: string;
  description?: string;
  quantity_required: number;
  quantity_ordered?: number;
  quantity_received?: number;
  quantity_used?: number;
  unit: string;
  unit_cost?: number;
  total_cost?: number;
  supplier?: string;
  order_date?: string;
  expected_delivery?: string;
  received_date?: string;
  lot_number?: string;
  notes?: string;
}

export interface Equipment {
  name?: string;
  idx: number;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  equipment_name: string;
  equipment_type: string;
  asset_number?: string;
  rental_or_owned: 'Rental' | 'Owned';
  rental_company?: string;
  daily_rate?: number;
  start_date?: string;
  end_date?: string;
  total_days?: number;
  total_cost?: number;
  notes?: string;
}

export interface DailyLog extends FrappeDoc {
  project: string; // Link to Project
  log_date: string;
  weather?: string;
  temperature_high?: number;
  temperature_low?: number;
  crew_size?: number;
  work_performed?: string;
  materials_used?: string;
  equipment_used?: string;
  delays_issues?: string;
  safety_incidents?: string;
  visitor_log?: string;
  photos?: string; // JSON array of photo names
  submitted_by?: string; // Link to User
}

export interface MaterialException extends FrappeDoc {
  project: string; // Link to Project
  exception_date: string;
  material: string;
  exception_type: 'Shortage' | 'Defect' | 'Wrong Item' | 'Damage' | 'Other';
  description: string;
  quantity_affected?: number;
  resolution?: string;
  resolution_date?: string;
  cost_impact?: number;
  schedule_impact_days?: number;
  reported_by?: string; // Link to User
  photos?: string; // JSON array of photo names
}

// -----------------------------------------------------------------------------
// Billing & QuickBooks Integration
// -----------------------------------------------------------------------------

export type MilestoneStatus = 
  | 'Pending'
  | 'Ready to Bill'
  | 'Invoiced'
  | 'Paid'
  | 'Disputed';

export interface BillingMilestone extends FrappeDoc {
  project: string; // Link to Project
  milestone_name: string;
  description?: string;
  percent_of_contract: number;
  amount: number;
  status: MilestoneStatus;
  due_date?: string;
  invoiced_date?: string;
  quickbooks_invoice_id?: string; // Read-only from QB
  quickbooks_invoice_number?: string; // Read-only from QB
  paid_date?: string;
  payment_amount?: number;
  notes?: string;
}

// -----------------------------------------------------------------------------
// Documents & Photos
// -----------------------------------------------------------------------------

export type DocumentCategory = 
  | 'Contract'
  | 'Proposal'
  | 'Report'
  | 'Inspection'
  | 'Drawing'
  | 'Permit'
  | 'Safety'
  | 'Correspondence'
  | 'Photo'
  | 'Other';

export interface Document extends FrappeDoc {
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  category: DocumentCategory;
  description?: string;
  attached_to_doctype: string;
  attached_to_name: string;
  uploaded_by?: string; // Link to User
  tags?: string;
  is_private: 0 | 1;
}

export type PhotoCategory = 
  | 'Exterior'
  | 'Interior'
  | 'Coating'
  | 'Defect'
  | 'Measurement'
  | 'Before'
  | 'After'
  | 'Progress'
  | 'Safety'
  | 'Other';

export interface Photo extends FrappeDoc {
  file_name: string;
  file_url: string;
  thumbnail_url?: string;
  category: PhotoCategory;
  caption?: string;
  attached_to_doctype: string;
  attached_to_name: string;
  taken_by?: string; // Link to User
  taken_date?: string;
  latitude?: number;
  longitude?: number;
  location_on_tank?: string;
  is_required: 0 | 1;
  is_hero: 0 | 1; // Featured photo for reports
  tags?: string;
}

// -----------------------------------------------------------------------------
// Users & Roles
// -----------------------------------------------------------------------------

export type UserRole = 
  | 'System Manager'
  | 'Leadership'
  | 'Sales Manager'
  | 'Sales Rep'
  | 'Project Manager'
  | 'Field Superintendent'
  | 'Field Technician'
  | 'Office Staff'
  | 'Read Only';

export interface User extends FrappeDoc {
  email: string;
  first_name: string;
  last_name: string;
  full_name: string; // Computed
  enabled: 0 | 1;
  role: UserRole;
  phone?: string;
  mobile?: string;
  preferred_language: 'en' | 'es';
  signature?: string;
  can_access_financials: 0 | 1;
  can_approve_proposals: 0 | 1;
  can_approve_reports: 0 | 1;
}

export interface Role extends FrappeDoc {
  role_name: string;
  description?: string;
  permissions?: RolePermission[];
}

export interface RolePermission {
  doctype: string;
  read: 0 | 1;
  write: 0 | 1;
  create: 0 | 1;
  delete: 0 | 1;
  submit: 0 | 1;
  cancel: 0 | 1;
  report: 0 | 1;
  export: 0 | 1;
}

// -----------------------------------------------------------------------------
// Audit Log
// -----------------------------------------------------------------------------

export interface AuditLogEntry extends FrappeDoc {
  doctype_name: string;
  document_name: string;
  action: 'Create' | 'Update' | 'Delete' | 'Submit' | 'Cancel' | 'View';
  user: string; // Link to User
  timestamp: string;
  ip_address?: string;
  changes?: string; // JSON of field changes
  notes?: string;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface FrappeListResponse<T> {
  data: T[];
}

export interface FrappeGetResponse<T> {
  data: T;
}

export interface FrappeMethodResponse<T> {
  message: T;
}

// -----------------------------------------------------------------------------
// Dashboard / Aggregation Types
// -----------------------------------------------------------------------------

export interface PipelineSummary {
  total_value: number;
  proposal_count: number;
  by_status: Record<ProposalStatus, { count: number; value: number }>;
  aging_buckets: {
    '0-30': { count: number; value: number };
    '31-60': { count: number; value: number };
    '61-90': { count: number; value: number };
    '90+': { count: number; value: number };
  };
}

export interface ServiceDueSummary {
  overdue_count: number;
  due_this_month: number;
  due_next_month: number;
  tanks: Tank[];
}

export interface ProjectSummary {
  active_count: number;
  total_value: number;
  by_status: Record<ProjectStatus, number>;
}

export interface DashboardMetrics {
  pipeline: PipelineSummary;
  service_due: ServiceDueSummary;
  projects: ProjectSummary;
  recent_activity: AuditLogEntry[];
}
