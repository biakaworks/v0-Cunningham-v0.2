// =============================================================================
// Mock Data for Inspections and Reports
// =============================================================================

import type { 
  Inspection, 
  FacilityReport, 
  ChecklistCategory,
  CHECKLIST_CATEGORIES,
  PRIORITY_MEASUREMENTS,
  InspectionStatus,
  ReportStatus,
  ChecklistSection,
  InspectionMeasurement
} from '@/types/inspection'

// Create empty checklist sections
function createEmptySections(): Record<ChecklistCategory, ChecklistSection> {
  const categories: ChecklistCategory[] = [
    'wet_interior', 'exterior', 'foundation', 'anchor_bolts', 'overflow',
    'manway', 'ladder', 'safety_climb', 'vent', 'hatch',
    'aviation_light', 'cables', 'catwalk', 'coatings'
  ]
  
  const sections = {} as Record<ChecklistCategory, ChecklistSection>
  
  for (const category of categories) {
    const isRequired = ['wet_interior', 'exterior', 'foundation', 'coatings'].includes(category)
    sections[category] = {
      category,
      photos: [],
      measurements: [],
      notes: '',
      hasDeficiency: false,
      isComplete: false,
      isRequired,
    }
  }
  
  return sections
}

// Create empty measurements
function createEmptyMeasurements(): InspectionMeasurement[] {
  return [
    { type: 'overflow_size', unit: 'in', photos: [] },
    { type: 'hatch_size', unit: 'in', photos: [] },
    { type: 'manway_size', unit: 'in', photos: [] },
    { type: 'vent_size', unit: 'in', photos: [] },
    { type: 'standpipe_diameter', unit: 'in', photos: [] },
    { type: 'standpipe_height', unit: 'ft', photos: [] },
  ]
}

// Mock inspections for different statuses
export const mockInspections: Inspection[] = [
  // In Progress (Draft)
  {
    name: 'INS-2024-0042',
    customer: 'CUST-001',
    customerName: 'City of Springfield',
    site: 'SITE-001',
    siteName: 'Main Street Water Tower',
    tank: 'TANK-001',
    tankName: 'Elevated Tank #1',
    tankType: 'Elevated - Spheroid',
    crew: 'CREW-001',
    crewName: 'Martinez Crew',
    serviceDate: '2024-01-15',
    weather: 'Clear',
    temperature: 45,
    language: 'en',
    status: 'In Progress',
    syncState: { status: 'synced', lastSyncedAt: '2024-01-15T14:30:00Z' },
    currentStep: 2,
    contextConfirmed: true,
    initialPhoto: {
      id: 'photo-001',
      url: '/placeholder.svg?height=400&width=600',
      thumbnailUrl: '/placeholder.svg?height=100&width=150',
      category: 'general',
      caption: 'Initial tank view',
      takenAt: '2024-01-15T09:00:00Z',
      takenBy: 'Carlos Martinez',
      isRequired: true,
    },
    sections: {
      ...createEmptySections(),
      wet_interior: {
        category: 'wet_interior',
        photos: [
          {
            id: 'photo-002',
            url: '/placeholder.svg?height=400&width=600',
            thumbnailUrl: '/placeholder.svg?height=100&width=150',
            category: 'wet_interior',
            caption: 'Interior coating condition',
            takenAt: '2024-01-15T10:00:00Z',
            takenBy: 'Carlos Martinez',
            isRequired: true,
          }
        ],
        measurements: [],
        notes: 'Coating shows minor wear near waterline',
        hasDeficiency: true,
        deficiencySeverity: 'minor',
        isComplete: true,
        isRequired: true,
      },
      exterior: {
        category: 'exterior',
        photos: [],
        measurements: [],
        notes: '',
        hasDeficiency: false,
        isComplete: false,
        isRequired: true,
      },
    },
    measurements: createEmptyMeasurements(),
    bulkPhotos: [],
    unassignedPhotos: [],
    waivers: [],
    corrections: [],
    createdAt: '2024-01-15T08:00:00Z',
    createdBy: 'Carlos Martinez',
    modifiedAt: '2024-01-15T14:30:00Z',
    modifiedBy: 'Carlos Martinez',
  },
  
  // Scheduled
  {
    name: 'INS-2024-0043',
    customer: 'CUST-002',
    customerName: 'Riverside Water District',
    site: 'SITE-003',
    siteName: 'Oak Hill Reservoir',
    tank: 'TANK-003',
    tankName: 'Ground Storage Tank',
    tankType: 'Ground - Reservoir',
    crew: 'CREW-002',
    crewName: 'Johnson Crew',
    serviceDate: '2024-01-18',
    language: 'en',
    status: 'Draft',
    syncState: { status: 'synced', lastSyncedAt: '2024-01-14T16:00:00Z' },
    currentStep: 1,
    contextConfirmed: false,
    sections: createEmptySections(),
    measurements: createEmptyMeasurements(),
    bulkPhotos: [],
    unassignedPhotos: [],
    waivers: [],
    corrections: [],
    createdAt: '2024-01-14T16:00:00Z',
    createdBy: 'Admin User',
    modifiedAt: '2024-01-14T16:00:00Z',
    modifiedBy: 'Admin User',
  },
  
  // Submitted - Awaiting Review
  {
    name: 'INS-2024-0040',
    customer: 'CUST-001',
    customerName: 'City of Springfield',
    site: 'SITE-002',
    siteName: 'Industrial Park Tower',
    tank: 'TANK-002',
    tankName: 'Elevated Tank #2',
    tankType: 'Elevated - Multi-Leg',
    crew: 'CREW-001',
    crewName: 'Martinez Crew',
    serviceDate: '2024-01-10',
    weather: 'Partly Cloudy',
    temperature: 52,
    language: 'es',
    status: 'Office Review',
    syncState: { status: 'synced', lastSyncedAt: '2024-01-10T17:00:00Z' },
    currentStep: 5,
    contextConfirmed: true,
    initialPhoto: {
      id: 'photo-010',
      url: '/placeholder.svg?height=400&width=600',
      thumbnailUrl: '/placeholder.svg?height=100&width=150',
      category: 'general',
      caption: 'Initial tank view',
      takenAt: '2024-01-10T08:30:00Z',
      takenBy: 'Carlos Martinez',
      isRequired: true,
    },
    sections: createEmptySections(),
    measurements: [
      { type: 'overflow_size', value: 8, unit: 'in', photos: [] },
      { type: 'hatch_size', value: 24, unit: 'in', photos: [] },
      { type: 'manway_size', value: 30, unit: 'in', photos: [] },
      { type: 'vent_size', value: 12, unit: 'in', photos: [] },
      { type: 'standpipe_diameter', value: 18, unit: 'in', photos: [] },
      { type: 'standpipe_height', value: 120, unit: 'ft', photos: [] },
    ],
    bulkPhotos: [],
    unassignedPhotos: [],
    waivers: [],
    submittedAt: '2024-01-10T17:00:00Z',
    submittedBy: 'Carlos Martinez',
    corrections: [],
    createdAt: '2024-01-10T08:00:00Z',
    createdBy: 'Carlos Martinez',
    modifiedAt: '2024-01-10T17:00:00Z',
    modifiedBy: 'Carlos Martinez',
  },
  
  // Corrections Requested
  {
    name: 'INS-2024-0038',
    customer: 'CUST-003',
    customerName: 'Metro Utilities',
    site: 'SITE-004',
    siteName: 'Downtown Standpipe',
    tank: 'TANK-004',
    tankName: 'Standpipe #1',
    tankType: 'Ground - Standpipe',
    crew: 'CREW-001',
    crewName: 'Martinez Crew',
    serviceDate: '2024-01-08',
    weather: 'Overcast',
    temperature: 38,
    language: 'en',
    status: 'Corrections Requested',
    syncState: { status: 'queued' },
    currentStep: 5,
    contextConfirmed: true,
    initialPhoto: {
      id: 'photo-020',
      url: '/placeholder.svg?height=400&width=600',
      thumbnailUrl: '/placeholder.svg?height=100&width=150',
      category: 'general',
      caption: 'Initial tank view',
      takenAt: '2024-01-08T09:00:00Z',
      takenBy: 'Carlos Martinez',
      isRequired: true,
    },
    sections: createEmptySections(),
    measurements: createEmptyMeasurements(),
    bulkPhotos: [],
    unassignedPhotos: [],
    waivers: [],
    submittedAt: '2024-01-08T16:00:00Z',
    submittedBy: 'Carlos Martinez',
    corrections: [
      {
        id: 'corr-001',
        field: 'photo',
        category: 'foundation',
        notes: 'Foundation photo is blurry - please retake with better focus',
        requestedAt: '2024-01-09T10:00:00Z',
        requestedBy: 'Sarah Johnson',
      },
      {
        id: 'corr-002',
        field: 'measurement',
        measurementType: 'overflow_size',
        notes: 'Overflow measurement seems incorrect - please verify',
        requestedAt: '2024-01-09T10:05:00Z',
        requestedBy: 'Sarah Johnson',
      },
    ],
    createdAt: '2024-01-08T08:00:00Z',
    createdBy: 'Carlos Martinez',
    modifiedAt: '2024-01-09T10:05:00Z',
    modifiedBy: 'Sarah Johnson',
  },
  
  // Ready for Report
  {
    name: 'INS-2024-0035',
    customer: 'CUST-002',
    customerName: 'Riverside Water District',
    site: 'SITE-003',
    siteName: 'Oak Hill Reservoir',
    tank: 'TANK-005',
    tankName: 'Clearwell #1',
    tankType: 'Ground - Clearwell',
    crew: 'CREW-002',
    crewName: 'Johnson Crew',
    serviceDate: '2024-01-05',
    weather: 'Clear',
    temperature: 55,
    language: 'en',
    status: 'Ready for Report',
    syncState: { status: 'synced', lastSyncedAt: '2024-01-06T09:00:00Z' },
    currentStep: 5,
    contextConfirmed: true,
    initialPhoto: {
      id: 'photo-030',
      url: '/placeholder.svg?height=400&width=600',
      thumbnailUrl: '/placeholder.svg?height=100&width=150',
      category: 'general',
      caption: 'Initial tank view',
      takenAt: '2024-01-05T08:30:00Z',
      takenBy: 'Mike Johnson',
      isRequired: true,
    },
    sections: createEmptySections(),
    measurements: [
      { type: 'overflow_size', value: 10, unit: 'in', photos: [] },
      { type: 'hatch_size', value: 30, unit: 'in', photos: [] },
      { type: 'manway_size', value: 36, unit: 'in', photos: [] },
      { type: 'vent_size', value: 8, unit: 'in', photos: [] },
      { type: 'standpipe_diameter', value: 24, unit: 'in', photos: [] },
      { type: 'standpipe_height', value: 80, unit: 'ft', photos: [] },
    ],
    bulkPhotos: [],
    unassignedPhotos: [],
    waivers: [],
    submittedAt: '2024-01-05T16:30:00Z',
    submittedBy: 'Mike Johnson',
    approvedAt: '2024-01-06T09:00:00Z',
    approvedBy: 'Sarah Johnson',
    corrections: [],
    createdAt: '2024-01-05T08:00:00Z',
    createdBy: 'Mike Johnson',
    modifiedAt: '2024-01-06T09:00:00Z',
    modifiedBy: 'Sarah Johnson',
  },
]

// Mock facility reports
export const mockReports: FacilityReport[] = [
  {
    name: 'RPT-2024-0012',
    inspectionId: 'INS-2024-0030',
    customer: 'CUST-001',
    customerName: 'City of Springfield',
    site: 'SITE-001',
    siteName: 'Main Street Water Tower',
    tank: 'TANK-001',
    tankName: 'Elevated Tank #1',
    inspectionDate: '2024-01-02',
    reportDate: '2024-01-04',
    status: 'Draft',
    owner: 'USER-002',
    ownerName: 'Sarah Johnson',
    sections: [
      {
        id: 'sec-001',
        title: 'Interior Coatings',
        content: 'The interior coating system shows signs of wear near the waterline. Minor rust spots observed at weld seams. Overall coating adhesion is satisfactory with localized areas requiring attention.',
        photos: ['photo-101', 'photo-102'],
        autoGeneratedFrom: 'wet_interior',
        isEdited: false,
      },
      {
        id: 'sec-002',
        title: 'Exterior Coatings',
        content: 'Exterior paint is in good condition overall. Some chalking observed on south-facing surfaces. Logo and lettering remain visible and intact.',
        photos: ['photo-103'],
        autoGeneratedFrom: 'exterior',
        isEdited: true,
      },
      {
        id: 'sec-003',
        title: 'Foundation',
        content: 'Concrete foundation shows no signs of settling or cracking. Anchor bolts are secure with no visible corrosion.',
        photos: ['photo-104'],
        autoGeneratedFrom: 'foundation',
        isEdited: false,
      },
    ],
    recommendations: [
      {
        id: 'rec-001',
        title: 'Interior Coating Touch-Up',
        description: 'Spot-repair rust areas at weld seams and apply touch-up coating to waterline wear areas.',
        priority: 'Medium',
        type: 'Scheduled Repair',
        estimatedCostLow: 8000,
        estimatedCostHigh: 12000,
        timeframe: '6-12 months',
        area: 'Interior wet surfaces',
        photos: ['photo-101'],
        isDraft: true,
      },
      {
        id: 'rec-002',
        title: 'Exterior Repainting',
        description: 'Full exterior repainting recommended within 2-3 years to address chalking and maintain corrosion protection.',
        priority: 'Low',
        type: 'Coating',
        estimatedCostLow: 25000,
        estimatedCostHigh: 35000,
        timeframe: '2-3 years',
        area: 'Full exterior',
        photos: ['photo-103'],
        isDraft: true,
      },
    ],
    linkedProposals: [],
    createdAt: '2024-01-04T10:00:00Z',
    modifiedAt: '2024-01-04T14:30:00Z',
    version: 1,
  },
  {
    name: 'RPT-2024-0011',
    inspectionId: 'INS-2024-0028',
    customer: 'CUST-002',
    customerName: 'Riverside Water District',
    site: 'SITE-003',
    siteName: 'Oak Hill Reservoir',
    tank: 'TANK-003',
    tankName: 'Ground Storage Tank',
    inspectionDate: '2023-12-28',
    reportDate: '2024-01-02',
    status: 'In Review',
    owner: 'USER-002',
    ownerName: 'Sarah Johnson',
    sections: [
      {
        id: 'sec-010',
        title: 'Interior Coatings',
        content: 'Interior coating system is in fair condition with moderate wear throughout. Several areas of coating failure observed near inlet pipe.',
        photos: ['photo-110', 'photo-111'],
        autoGeneratedFrom: 'wet_interior',
        isEdited: true,
      },
    ],
    recommendations: [
      {
        id: 'rec-010',
        title: 'Interior Recoating',
        description: 'Full interior recoating recommended to address widespread wear and coating failures.',
        priority: 'High',
        type: 'Coating',
        estimatedCostLow: 45000,
        estimatedCostHigh: 60000,
        timeframe: '3-6 months',
        area: 'Full interior',
        photos: ['photo-110'],
        awwaReference: 'AWWA D102-17',
        isDraft: false,
      },
    ],
    linkedProposals: [],
    createdAt: '2024-01-02T09:00:00Z',
    modifiedAt: '2024-01-03T11:00:00Z',
    version: 2,
  },
  {
    name: 'RPT-2024-0010',
    inspectionId: 'INS-2024-0025',
    customer: 'CUST-003',
    customerName: 'Metro Utilities',
    site: 'SITE-004',
    siteName: 'Downtown Standpipe',
    tank: 'TANK-004',
    tankName: 'Standpipe #1',
    inspectionDate: '2023-12-20',
    reportDate: '2023-12-22',
    status: 'Approved',
    owner: 'USER-002',
    ownerName: 'Sarah Johnson',
    sections: [
      {
        id: 'sec-020',
        title: 'Interior Coatings',
        content: 'Interior coating is in good condition with minimal wear. No significant deficiencies noted.',
        photos: ['photo-120'],
        autoGeneratedFrom: 'wet_interior',
        isEdited: false,
      },
    ],
    recommendations: [
      {
        id: 'rec-020',
        title: 'Routine Monitoring',
        description: 'Continue annual inspection schedule. No immediate repairs required.',
        priority: 'Low',
        type: 'Monitoring',
        photos: [],
        isDraft: false,
      },
    ],
    approvedAt: '2023-12-23T10:00:00Z',
    approvedBy: 'USER-003',
    approvedByName: 'Tom Wilson',
    linkedProposals: [],
    createdAt: '2023-12-22T09:00:00Z',
    modifiedAt: '2023-12-23T10:00:00Z',
    version: 3,
  },
  {
    name: 'RPT-2024-0009',
    inspectionId: 'INS-2024-0022',
    customer: 'CUST-001',
    customerName: 'City of Springfield',
    site: 'SITE-002',
    siteName: 'Industrial Park Tower',
    tank: 'TANK-002',
    tankName: 'Elevated Tank #2',
    inspectionDate: '2023-12-15',
    reportDate: '2023-12-18',
    status: 'Delivered',
    owner: 'USER-002',
    ownerName: 'Sarah Johnson',
    sections: [],
    recommendations: [
      {
        id: 'rec-030',
        title: 'Ladder Safety System',
        description: 'Install fall protection system on fixed ladder per OSHA requirements.',
        priority: 'Critical',
        type: 'Immediate Repair',
        estimatedCostLow: 5000,
        estimatedCostHigh: 8000,
        timeframe: 'Immediate',
        area: 'Fixed ladder',
        photos: [],
        oshaReference: '1910.28',
        isDraft: false,
        linkedProposalId: 'PROP-2024-0015',
      },
    ],
    approvedAt: '2023-12-19T09:00:00Z',
    approvedBy: 'USER-003',
    approvedByName: 'Tom Wilson',
    deliveredAt: '2023-12-20T14:00:00Z',
    deliveredTo: 'john.smith@springfield.gov',
    linkedProposals: ['PROP-2024-0015'],
    createdAt: '2023-12-18T10:00:00Z',
    modifiedAt: '2023-12-20T14:00:00Z',
    version: 4,
  },
]

// Helper functions
export function getInspectionsByStatus(status: InspectionStatus): Inspection[] {
  return mockInspections.filter(i => i.status === status)
}

export function getInspectionById(name: string): Inspection | undefined {
  return mockInspections.find(i => i.name === name)
}

export function getReportsByStatus(status: ReportStatus): FacilityReport[] {
  return mockReports.filter(r => r.status === status)
}

export function getReportById(name: string): FacilityReport | undefined {
  return mockReports.find(r => r.name === name)
}

export function getReportByInspectionId(inspectionId: string): FacilityReport | undefined {
  return mockReports.find(r => r.inspectionId === inspectionId)
}

// Summary stats
export function getInspectionQueueSummary() {
  return {
    inProgress: mockInspections.filter(i => i.status === 'In Progress' || i.status === 'Draft').length,
    scheduled: mockInspections.filter(i => i.status === 'Draft' && !i.contextConfirmed).length,
    submitted: mockInspections.filter(i => i.status === 'Office Review').length,
    correctionsRequested: mockInspections.filter(i => i.status === 'Corrections Requested').length,
    readyForReport: mockInspections.filter(i => i.status === 'Ready for Report').length,
  }
}

export function getReportQueueSummary() {
  return {
    draft: mockReports.filter(r => r.status === 'Draft').length,
    inReview: mockReports.filter(r => r.status === 'In Review').length,
    approved: mockReports.filter(r => r.status === 'Approved').length,
    delivered: mockReports.filter(r => r.status === 'Delivered').length,
  }
}
