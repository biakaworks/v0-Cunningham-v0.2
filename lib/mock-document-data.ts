import type {
  CunninghamDocument,
  DocumentType,
  AdminUser,
  UserRole,
  RolePermissions,
  SensitiveFieldGates,
  AuditLogEntry,
  TowerVerificationItem,
  DuplicateCandidate,
  LowConfidenceRecord,
  ChecklistTemplate,
  RecordType,
  PermissionLevel,
  SensitiveFieldVisibility,
} from '@/types/document'

// =============================================================================
// Mock Documents
// =============================================================================

export const MOCK_DOCUMENTS: CunninghamDocument[] = [
  {
    name: 'DOC-2024-001',
    file_name: 'SPFLD-20240115-Annual-Inspection-Report.pdf',
    file_url: '/documents/SPFLD-20240115-Annual-Inspection-Report.pdf',
    file_type: 'application/pdf',
    file_size: 2450000,
    document_type: 'Report',
    description: 'Annual inspection report for Main Street Elevated Tank',
    owner: 'john.smith@cunningham.com',
    owner_name: 'John Smith',
    creation: '2024-01-15T10:30:00Z',
    modified: '2024-01-15T14:00:00Z',
    attachments: [
      { doctype: 'Customer', name: 'CUST-001', display_name: 'City of Springfield' },
      { doctype: 'Site', name: 'SITE-001', display_name: 'Main Street Elevated' },
      { doctype: 'Tank', name: 'TANK-001', display_name: 'Main Street Tower' },
    ],
    is_private: false,
  },
  {
    name: 'DOC-2024-002',
    file_name: 'RVSD-20240210-Coating-Proposal.pdf',
    file_url: '/documents/RVSD-20240210-Coating-Proposal.pdf',
    file_type: 'application/pdf',
    file_size: 1850000,
    document_type: 'Proposal',
    description: 'Interior/exterior coating proposal',
    owner: 'sarah.jones@cunningham.com',
    owner_name: 'Sarah Jones',
    creation: '2024-02-10T09:00:00Z',
    modified: '2024-02-12T16:30:00Z',
    attachments: [
      { doctype: 'Customer', name: 'CUST-002', display_name: 'Riverside Water Authority' },
      { doctype: 'Proposal', name: 'PROP-2024-015', display_name: 'PROP-2024-015' },
    ],
    is_private: true,
  },
  {
    name: 'DOC-2024-003',
    file_name: 'OAKP-20240305-Contract-Signed.pdf',
    file_url: '/documents/OAKP-20240305-Contract-Signed.pdf',
    file_type: 'application/pdf',
    file_size: 3200000,
    document_type: 'Contract',
    description: 'Signed contract for tank rehabilitation project',
    owner: 'mike.davis@cunningham.com',
    owner_name: 'Mike Davis',
    creation: '2024-03-05T11:00:00Z',
    modified: '2024-03-05T11:00:00Z',
    attachments: [
      { doctype: 'Customer', name: 'CUST-003', display_name: 'Oak Park Municipal Water' },
      { doctype: 'Project', name: 'PROJ-2024-008', display_name: 'Oak Park Rehab' },
    ],
    is_private: true,
  },
  {
    name: 'DOC-2024-004',
    file_name: 'SPFLD-20240115-exterior-overview.jpg',
    file_url: '/documents/photos/SPFLD-20240115-exterior-overview.jpg',
    file_type: 'image/jpeg',
    file_size: 4500000,
    document_type: 'Photo',
    description: 'Exterior overview of Main Street tower',
    owner: 'carlos.mendez@cunningham.com',
    owner_name: 'Carlos Mendez',
    creation: '2024-01-15T09:30:00Z',
    modified: '2024-01-15T09:30:00Z',
    attachments: [
      { doctype: 'Tank', name: 'TANK-001', display_name: 'Main Street Tower' },
      { doctype: 'Service Visit', name: 'SV-2024-001', display_name: 'Annual Inspection' },
    ],
    is_private: false,
    thumbnail_url: '/documents/photos/thumbs/SPFLD-20240115-exterior-overview.jpg',
    photo_category: 'Exterior',
    taken_date: '2024-01-15T09:30:00Z',
    latitude: 39.7817,
    longitude: -89.6501,
    service_visit: 'SV-2024-001',
    checklist_item: 'exterior_coating',
  },
  {
    name: 'DOC-2024-005',
    file_name: 'SPFLD-20240115-interior-coating.jpg',
    file_url: '/documents/photos/SPFLD-20240115-interior-coating.jpg',
    file_type: 'image/jpeg',
    file_size: 3800000,
    document_type: 'Photo',
    description: 'Interior wet coating condition',
    owner: 'carlos.mendez@cunningham.com',
    owner_name: 'Carlos Mendez',
    creation: '2024-01-15T10:15:00Z',
    modified: '2024-01-15T10:15:00Z',
    attachments: [
      { doctype: 'Tank', name: 'TANK-001', display_name: 'Main Street Tower' },
      { doctype: 'Service Visit', name: 'SV-2024-001', display_name: 'Annual Inspection' },
    ],
    is_private: false,
    thumbnail_url: '/documents/photos/thumbs/SPFLD-20240115-interior-coating.jpg',
    photo_category: 'Interior',
    taken_date: '2024-01-15T10:15:00Z',
    service_visit: 'SV-2024-001',
    checklist_item: 'wet_interior',
    related_measurement: 'coating_thickness_mil',
  },
  {
    name: 'DOC-2024-006',
    file_name: 'RVSD-20240320-Job-Sheet.pdf',
    file_url: '/documents/RVSD-20240320-Job-Sheet.pdf',
    file_type: 'application/pdf',
    file_size: 980000,
    document_type: 'Job Sheet',
    description: 'Daily job sheet for coating prep work',
    owner: 'carlos.mendez@cunningham.com',
    owner_name: 'Carlos Mendez',
    creation: '2024-03-20T17:00:00Z',
    modified: '2024-03-20T17:00:00Z',
    attachments: [
      { doctype: 'Project', name: 'PROJ-2024-010', display_name: 'Riverside Coating' },
    ],
    is_private: false,
  },
  {
    name: 'DOC-2024-007',
    file_name: 'Internal-Pricing-Notes.docx',
    file_url: '/documents/Internal-Pricing-Notes.docx',
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size: 45000,
    document_type: 'Internal Note',
    description: 'Internal pricing strategy notes',
    owner: 'sarah.jones@cunningham.com',
    owner_name: 'Sarah Jones',
    creation: '2024-02-01T14:00:00Z',
    modified: '2024-02-15T09:30:00Z',
    attachments: [],
    is_private: true,
  },
  {
    name: 'DOC-2024-008',
    file_name: 'OAKP-20240410-Completion-Form.pdf',
    file_url: '/documents/OAKP-20240410-Completion-Form.pdf',
    file_type: 'application/pdf',
    file_size: 1200000,
    document_type: 'Completion Form',
    description: 'Project completion certification form',
    owner: 'mike.davis@cunningham.com',
    owner_name: 'Mike Davis',
    creation: '2024-04-10T16:00:00Z',
    modified: '2024-04-10T16:00:00Z',
    attachments: [
      { doctype: 'Project', name: 'PROJ-2024-008', display_name: 'Oak Park Rehab' },
      { doctype: 'Customer', name: 'CUST-003', display_name: 'Oak Park Municipal Water' },
    ],
    is_private: false,
  },
]

// =============================================================================
// Mock Admin Users
// =============================================================================

export const MOCK_USERS: AdminUser[] = [
  {
    name: 'USER-001',
    email: 'john.smith@cunningham.com',
    full_name: 'John Smith',
    roles: ['Leadership', 'Sales'],
    language_preference: 'en',
    status: 'Active',
    last_login: '2024-04-15T08:30:00Z',
    creation: '2020-01-15T00:00:00Z',
  },
  {
    name: 'USER-002',
    email: 'sarah.jones@cunningham.com',
    full_name: 'Sarah Jones',
    roles: ['Sales', 'Estimator'],
    language_preference: 'en',
    status: 'Active',
    last_login: '2024-04-15T09:00:00Z',
    creation: '2021-03-01T00:00:00Z',
  },
  {
    name: 'USER-003',
    email: 'mike.davis@cunningham.com',
    full_name: 'Mike Davis',
    roles: ['Operations', 'Field Foreman'],
    language_preference: 'en',
    status: 'Active',
    last_login: '2024-04-14T16:30:00Z',
    creation: '2019-06-15T00:00:00Z',
  },
  {
    name: 'USER-004',
    email: 'carlos.mendez@cunningham.com',
    full_name: 'Carlos Mendez',
    roles: ['Service Crew'],
    language_preference: 'es',
    status: 'Active',
    last_login: '2024-04-15T07:00:00Z',
    creation: '2022-02-01T00:00:00Z',
  },
  {
    name: 'USER-005',
    email: 'lisa.chen@cunningham.com',
    full_name: 'Lisa Chen',
    roles: ['Accounting'],
    language_preference: 'en',
    status: 'Active',
    last_login: '2024-04-15T08:00:00Z',
    creation: '2021-08-15T00:00:00Z',
  },
  {
    name: 'USER-006',
    email: 'tom.wilson@cunningham.com',
    full_name: 'Tom Wilson',
    roles: ['Admin'],
    language_preference: 'en',
    status: 'Active',
    last_login: '2024-04-15T10:00:00Z',
    creation: '2018-01-01T00:00:00Z',
  },
  {
    name: 'USER-007',
    email: 'jenny.martinez@cunningham.com',
    full_name: 'Jenny Martinez',
    roles: ['Service Crew'],
    language_preference: 'es',
    status: 'Deactivated',
    last_login: '2023-12-15T15:00:00Z',
    creation: '2022-05-01T00:00:00Z',
  },
]

// =============================================================================
// Mock Permissions Matrix
// =============================================================================

const ALL_ROLES: UserRole[] = [
  'Leadership',
  'Sales',
  'Estimator',
  'Operations',
  'Admin',
  'Accounting',
  'Field Foreman',
  'Service Crew',
  'Read-Only',
]

const ALL_RECORD_TYPES: RecordType[] = [
  'Customer',
  'Site',
  'Tank',
  'Opportunity',
  'Proposal',
  'Project',
  'Report',
  'Document',
  'Billing',
  'Inspection',
  'Audit',
]

function createDefaultPermissions(): Record<RecordType, PermissionLevel> {
  return ALL_RECORD_TYPES.reduce((acc, type) => {
    acc[type] = 'None'
    return acc
  }, {} as Record<RecordType, PermissionLevel>)
}

export const MOCK_ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'Leadership',
    permissions: {
      Customer: 'Write', Site: 'Write', Tank: 'Write', Opportunity: 'Write',
      Proposal: 'Write', Project: 'Write', Report: 'Write', Document: 'Write',
      Billing: 'Write', Inspection: 'Write', Audit: 'Read',
    },
  },
  {
    role: 'Sales',
    permissions: {
      Customer: 'Write', Site: 'Read', Tank: 'Read', Opportunity: 'Write',
      Proposal: 'Write', Project: 'Read', Report: 'Read', Document: 'Read',
      Billing: 'None', Inspection: 'Read', Audit: 'None',
    },
  },
  {
    role: 'Estimator',
    permissions: {
      Customer: 'Read', Site: 'Read', Tank: 'Read', Opportunity: 'Read',
      Proposal: 'Write', Project: 'None', Report: 'Read', Document: 'Read',
      Billing: 'None', Inspection: 'Read', Audit: 'None',
    },
  },
  {
    role: 'Operations',
    permissions: {
      Customer: 'Read', Site: 'Write', Tank: 'Write', Opportunity: 'Read',
      Proposal: 'Read', Project: 'Write', Report: 'Write', Document: 'Write',
      Billing: 'Read', Inspection: 'Write', Audit: 'None',
    },
  },
  {
    role: 'Admin',
    permissions: {
      Customer: 'Write', Site: 'Write', Tank: 'Write', Opportunity: 'Write',
      Proposal: 'Write', Project: 'Write', Report: 'Write', Document: 'Write',
      Billing: 'Write', Inspection: 'Write', Audit: 'Write',
    },
  },
  {
    role: 'Accounting',
    permissions: {
      Customer: 'Read', Site: 'None', Tank: 'None', Opportunity: 'None',
      Proposal: 'Read', Project: 'Read', Report: 'None', Document: 'Read',
      Billing: 'Write', Inspection: 'None', Audit: 'Read',
    },
  },
  {
    role: 'Field Foreman',
    permissions: {
      Customer: 'Read', Site: 'Read', Tank: 'Read', Opportunity: 'None',
      Proposal: 'None', Project: 'Read', Report: 'Write', Document: 'Write',
      Billing: 'None', Inspection: 'Write', Audit: 'None',
    },
  },
  {
    role: 'Service Crew',
    permissions: {
      Customer: 'Read', Site: 'Read', Tank: 'Read', Opportunity: 'None',
      Proposal: 'None', Project: 'Read', Report: 'Read', Document: 'Read',
      Billing: 'None', Inspection: 'Write', Audit: 'None',
    },
  },
  {
    role: 'Read-Only',
    permissions: {
      Customer: 'Read', Site: 'Read', Tank: 'Read', Opportunity: 'Read',
      Proposal: 'Read', Project: 'Read', Report: 'Read', Document: 'Read',
      Billing: 'None', Inspection: 'Read', Audit: 'None',
    },
  },
]

function createSensitiveGates(
  leadership: SensitiveFieldVisibility,
  sales: SensitiveFieldVisibility,
  estimator: SensitiveFieldVisibility,
  operations: SensitiveFieldVisibility,
  admin: SensitiveFieldVisibility,
  accounting: SensitiveFieldVisibility,
  fieldForeman: SensitiveFieldVisibility,
  serviceCrew: SensitiveFieldVisibility,
  readOnly: SensitiveFieldVisibility
): Record<UserRole, SensitiveFieldVisibility> {
  return {
    Leadership: leadership,
    Sales: sales,
    Estimator: estimator,
    Operations: operations,
    Admin: admin,
    Accounting: accounting,
    'Field Foreman': fieldForeman,
    'Service Crew': serviceCrew,
    'Read-Only': readOnly,
  }
}

export const MOCK_SENSITIVE_FIELD_GATES: SensitiveFieldGates = {
  proposal_value: createSensitiveGates('Visible', 'Visible', 'Visible', 'Summary', 'Visible', 'Visible', 'Hidden', 'Hidden', 'Hidden'),
  margin: createSensitiveGates('Visible', 'Summary', 'Visible', 'Hidden', 'Visible', 'Visible', 'Hidden', 'Hidden', 'Hidden'),
  invoice_amounts: createSensitiveGates('Visible', 'Hidden', 'Hidden', 'Summary', 'Visible', 'Visible', 'Hidden', 'Hidden', 'Hidden'),
  payroll_related: createSensitiveGates('Visible', 'Hidden', 'Hidden', 'Summary', 'Visible', 'Visible', 'Hidden', 'Hidden', 'Hidden'),
  job_cost: createSensitiveGates('Visible', 'Summary', 'Visible', 'Visible', 'Visible', 'Visible', 'Summary', 'Hidden', 'Hidden'),
}

// =============================================================================
// Mock Audit Log
// =============================================================================

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    name: 'AUDIT-001',
    timestamp: '2024-04-15T14:30:00Z',
    user: 'USER-002',
    user_name: 'Sarah Jones',
    record_type: 'Proposal',
    record_name: 'PROP-2024-018',
    record_display: 'Springfield Tank Rehab Proposal',
    action: 'Create',
  },
  {
    name: 'AUDIT-002',
    timestamp: '2024-04-15T13:45:00Z',
    user: 'USER-001',
    user_name: 'John Smith',
    record_type: 'Proposal',
    record_name: 'PROP-2024-015',
    record_display: 'Riverside Coating Proposal',
    action: 'Approve',
  },
  {
    name: 'AUDIT-003',
    timestamp: '2024-04-15T11:20:00Z',
    user: 'USER-003',
    user_name: 'Mike Davis',
    record_type: 'Project',
    record_name: 'PROJ-2024-008',
    record_display: 'Oak Park Rehab',
    action: 'Update',
    field_changed: 'status',
    previous_value: 'In Progress',
    new_value: 'Completed',
  },
  {
    name: 'AUDIT-004',
    timestamp: '2024-04-15T10:00:00Z',
    user: 'USER-004',
    user_name: 'Carlos Mendez',
    record_type: 'Inspection',
    record_name: 'INSP-2024-022',
    record_display: 'Annual Inspection - Lake View Tower',
    action: 'Create',
  },
  {
    name: 'AUDIT-005',
    timestamp: '2024-04-14T16:30:00Z',
    user: 'USER-005',
    user_name: 'Lisa Chen',
    record_type: 'Billing',
    record_name: 'BILL-2024-045',
    record_display: 'Milestone Payment - Oak Park',
    action: 'Update',
    field_changed: 'status',
    previous_value: 'Invoiced',
    new_value: 'Paid',
  },
  {
    name: 'AUDIT-006',
    timestamp: '2024-04-14T14:00:00Z',
    user: 'USER-006',
    user_name: 'Tom Wilson',
    record_type: 'Customer',
    record_name: 'CUST-004',
    record_display: 'Greenfield Township',
    action: 'Create',
  },
  {
    name: 'AUDIT-007',
    timestamp: '2024-04-14T11:30:00Z',
    user: 'USER-002',
    user_name: 'Sarah Jones',
    record_type: 'Document',
    record_name: 'DOC-2024-009',
    record_display: 'Proposal Attachment',
    action: 'Create',
  },
]

// =============================================================================
// Mock Tower Verification Queue
// =============================================================================

export const MOCK_TOWER_VERIFICATION: TowerVerificationItem[] = [
  {
    name: 'SITE-015',
    customer: 'CUST-005',
    customer_name: 'Westbrook Water District',
    site_name: 'Industrial Park Standpipe',
    current_address: '1200 Industrial Blvd, Westbrook, IL',
    latitude: 41.8523,
    longitude: -88.0892,
    source: 'Customer Provided',
    confidence: 'Medium',
    last_updated: '2024-03-10T00:00:00Z',
  },
  {
    name: 'SITE-018',
    customer: 'CUST-006',
    customer_name: 'Maple Heights Village',
    site_name: 'North Ridge Elevated',
    current_address: '800 N Ridge Rd, Maple Heights, IL',
    source: 'Import',
    confidence: 'Low',
    last_updated: '2024-02-15T00:00:00Z',
  },
  {
    name: 'SITE-022',
    customer: 'CUST-007',
    customer_name: 'Clearwater Township',
    site_name: 'Main Water Tower',
    current_address: 'Main St & Water Ave, Clearwater, IL',
    latitude: 40.1245,
    longitude: -89.4521,
    source: 'Geocoded',
    confidence: 'Medium',
    last_updated: '2024-01-20T00:00:00Z',
  },
]

// =============================================================================
// Mock Duplicate Review Queue
// =============================================================================

export const MOCK_DUPLICATE_CANDIDATES: DuplicateCandidate[] = [
  {
    name: 'DUP-001',
    record_a_name: 'CUST-008',
    record_a_display: 'Springfield Water Dept',
    record_b_name: 'CUST-001',
    record_b_display: 'City of Springfield',
    doctype: 'Customer',
    match_reason: 'Similar name, same city',
    similarity_score: 0.85,
    created: '2024-04-10T00:00:00Z',
  },
  {
    name: 'DUP-002',
    record_a_name: 'SITE-025',
    record_a_display: '123 Oak St Tower',
    record_b_name: 'SITE-003',
    record_b_display: 'Oak Street Elevated',
    doctype: 'Site',
    match_reason: 'Same address',
    similarity_score: 0.92,
    created: '2024-04-08T00:00:00Z',
  },
]

// =============================================================================
// Mock Low-Confidence Records
// =============================================================================

export const MOCK_LOW_CONFIDENCE_RECORDS: LowConfidenceRecord[] = [
  {
    name: 'LCR-001',
    record_name: 'TANK-045',
    record_display: 'Unknown Tank',
    doctype: 'Tank',
    issue_type: 'Missing Required Fields',
    source: 'Import',
    flagged_date: '2024-04-12T00:00:00Z',
    details: 'Missing: capacity_gallons, tank_type, year_built',
  },
  {
    name: 'LCR-002',
    record_name: 'CUST-012',
    record_display: 'ABC Water Co',
    doctype: 'Customer',
    issue_type: 'Failed Validation',
    source: 'Manual Entry',
    flagged_date: '2024-04-11T00:00:00Z',
    details: 'Invalid phone number format',
  },
  {
    name: 'LCR-003',
    record_name: 'SITE-030',
    record_display: 'North Side Location',
    doctype: 'Site',
    issue_type: 'Conflicting Fields',
    source: 'Import',
    flagged_date: '2024-04-09T00:00:00Z',
    details: 'City/State mismatch with zip code',
  },
]

// =============================================================================
// Mock Checklist Templates
// =============================================================================

export const MOCK_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    tank_type: 'Elevated - Spheroid',
    sections: [
      { section: 'exterior', enabled: true, required_photos: ['overview', 'closeup'], required_measurements: ['coating_thickness'], order: 1 },
      { section: 'wet_interior', enabled: true, required_photos: ['floor', 'walls', 'ceiling'], required_measurements: ['coating_thickness', 'sediment_depth'], order: 2 },
      { section: 'foundation', enabled: true, required_photos: ['base', 'grout'], required_measurements: [], order: 3 },
      { section: 'ladder', enabled: true, required_photos: ['full_ladder', 'rungs'], required_measurements: [], order: 4 },
      { section: 'safety_climb', enabled: true, required_photos: ['cable', 'brackets'], required_measurements: [], order: 5 },
      { section: 'manway', enabled: true, required_photos: ['exterior', 'interior'], required_measurements: ['gasket_condition'], order: 6 },
      { section: 'vent', enabled: true, required_photos: ['screen'], required_measurements: [], order: 7 },
      { section: 'overflow', enabled: true, required_photos: ['outlet', 'screen'], required_measurements: [], order: 8 },
      { section: 'aviation_light', enabled: true, required_photos: ['light'], required_measurements: [], order: 9 },
      { section: 'coatings', enabled: true, required_photos: ['samples'], required_measurements: ['dry_film_thickness'], order: 10 },
    ],
    labels: [
      { key: 'exterior', english: 'Exterior Shell', spanish: 'Carcasa Exterior', needs_review: false },
      { key: 'wet_interior', english: 'Wet Interior', spanish: 'Interior Mojado', needs_review: false },
      { key: 'foundation', english: 'Foundation', spanish: 'Cimentacion', needs_review: true },
      { key: 'ladder', english: 'Access Ladder', spanish: 'Escalera de Acceso', needs_review: false },
    ],
  },
]

// =============================================================================
// Helper Functions
// =============================================================================

export function getDocumentsByType(type: DocumentType): CunninghamDocument[] {
  return MOCK_DOCUMENTS.filter(doc => doc.document_type === type)
}

export function getDocumentsByCustomer(customerName: string): CunninghamDocument[] {
  return MOCK_DOCUMENTS.filter(doc =>
    doc.attachments.some(att => att.doctype === 'Customer' && att.name === customerName)
  )
}

export function getPhotoDocuments(): CunninghamDocument[] {
  return MOCK_DOCUMENTS.filter(doc => doc.document_type === 'Photo')
}

export function getUserByEmail(email: string): AdminUser | undefined {
  return MOCK_USERS.find(user => user.email === email)
}

export function getRolePermissions(role: UserRole): RolePermissions | undefined {
  return MOCK_ROLE_PERMISSIONS.find(rp => rp.role === role)
}
