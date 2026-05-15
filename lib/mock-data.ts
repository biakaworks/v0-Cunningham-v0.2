// Mock data for development - replace with Frappe API calls when backend is ready

import type { Customer, Site, Tank, Proposal, Inspection, ServiceVisit } from "@/types/cunningham"

export const mockCustomers: Customer[] = [
  {
    name: "CUST-001",
    customer_name: "City of Springfield Water Department",
    customer_type: "Municipality",
    status: "Active",
    primary_contact: "John Smith",
    phone: "(555) 123-4567",
    email: "jsmith@springfield.gov",
    billing_address: "123 Main Street, Springfield, IL 62701",
    notes: "Long-term client since 2015. Primary contact prefers phone calls.",
    creation: "2015-03-15",
    modified: "2024-01-10",
  },
  {
    name: "CUST-002",
    customer_name: "Greenville Municipal Utilities",
    customer_type: "Municipality",
    status: "Active",
    primary_contact: "Sarah Johnson",
    phone: "(555) 234-5678",
    email: "sjohnson@greenville.gov",
    billing_address: "456 Oak Avenue, Greenville, TX 75402",
    creation: "2018-06-20",
    modified: "2024-02-15",
  },
  {
    name: "CUST-003",
    customer_name: "Riverside Water District",
    customer_type: "Water District",
    status: "Active",
    primary_contact: "Mike Davis",
    phone: "(555) 345-6789",
    email: "mdavis@riversidewd.org",
    billing_address: "789 River Road, Riverside, CA 92501",
    creation: "2019-11-08",
    modified: "2024-01-25",
  },
  {
    name: "CUST-004",
    customer_name: "Oakmont Township",
    customer_type: "Municipality",
    status: "Inactive",
    primary_contact: "Lisa Brown",
    phone: "(555) 456-7890",
    email: "lbrown@oakmont.gov",
    billing_address: "321 Township Lane, Oakmont, PA 15139",
    creation: "2016-02-14",
    modified: "2023-08-30",
  },
  {
    name: "CUST-005",
    customer_name: "Valley View Water Authority",
    customer_type: "Water Authority",
    status: "Active",
    primary_contact: "Robert Wilson",
    phone: "(555) 567-8901",
    email: "rwilson@vvwa.org",
    billing_address: "555 Valley Blvd, Valley View, AZ 85001",
    creation: "2020-04-22",
    modified: "2024-03-01",
  },
]

export const mockSites: Site[] = [
  {
    name: "SITE-001",
    site_name: "Springfield Main Water Tower",
    customer: "CUST-001",
    address: "100 Water Tower Road, Springfield, IL 62701",
    city: "Springfield",
    state: "IL",
    zip_code: "62701",
    latitude: 39.7817,
    longitude: -89.6501,
    site_contact: "Tom Anderson",
    site_phone: "(555) 111-2222",
    access_notes: "Gate code: 1234. Contact Tom 24hrs before visit.",
    status: "Active",
    creation: "2015-03-15",
    modified: "2024-01-10",
  },
  {
    name: "SITE-002",
    site_name: "Springfield North Reservoir",
    customer: "CUST-001",
    address: "500 North Industrial Park, Springfield, IL 62702",
    city: "Springfield",
    state: "IL",
    zip_code: "62702",
    latitude: 39.8012,
    longitude: -89.6234,
    site_contact: "Tom Anderson",
    site_phone: "(555) 111-2222",
    access_notes: "Requires escort. Call ahead.",
    status: "Active",
    creation: "2015-03-15",
    modified: "2024-01-10",
  },
  {
    name: "SITE-003",
    site_name: "Greenville Central Tower",
    customer: "CUST-002",
    address: "200 Tower Drive, Greenville, TX 75402",
    city: "Greenville",
    state: "TX",
    zip_code: "75402",
    latitude: 33.1384,
    longitude: -96.1108,
    site_contact: "Amy Chen",
    site_phone: "(555) 222-3333",
    access_notes: "Open access during business hours.",
    status: "Active",
    creation: "2018-06-20",
    modified: "2024-02-15",
  },
  {
    name: "SITE-004",
    site_name: "Riverside Hilltop Station",
    customer: "CUST-003",
    address: "850 Hilltop Avenue, Riverside, CA 92501",
    city: "Riverside",
    state: "CA",
    zip_code: "92501",
    latitude: 33.9806,
    longitude: -117.3755,
    site_contact: "Carlos Rodriguez",
    site_phone: "(555) 333-4444",
    access_notes: "Steep access road. 4WD recommended.",
    status: "Active",
    creation: "2019-11-08",
    modified: "2024-01-25",
  },
]

export const mockTanks: Tank[] = [
  {
    name: "TANK-001",
    tank_name: "Springfield Main Tower #1",
    site: "SITE-001",
    tank_type: "Elevated - Leg",
    capacity_gallons: 500000,
    year_built: 1985,
    diameter_feet: 40,
    height_feet: 120,
    material: "Steel",
    coating_type: "Epoxy Interior / Polyurethane Exterior",
    last_coating_date: "2018-05-15",
    last_inspection_date: "2023-06-20",
    next_inspection_due: "2024-06-20",
    overall_condition: "Good",
    interior_condition: "Good",
    exterior_condition: "Fair",
    foundation_condition: "Good",
    status: "Active",
    notes: "Minor exterior rust spots noted in 2023 inspection.",
    creation: "2015-03-15",
    modified: "2024-01-10",
  },
  {
    name: "TANK-002",
    tank_name: "Springfield North Reservoir",
    site: "SITE-002",
    tank_type: "Ground - Welded",
    capacity_gallons: 2000000,
    year_built: 1992,
    diameter_feet: 80,
    height_feet: 35,
    material: "Steel",
    coating_type: "Glass-Fused-to-Steel",
    last_coating_date: "2020-08-10",
    last_inspection_date: "2023-08-15",
    next_inspection_due: "2024-08-15",
    overall_condition: "Good",
    interior_condition: "Good",
    exterior_condition: "Good",
    foundation_condition: "Good",
    status: "Active",
    creation: "2015-03-15",
    modified: "2024-01-10",
  },
  {
    name: "TANK-003",
    tank_name: "Greenville Spheroid",
    site: "SITE-003",
    tank_type: "Elevated - Spheroid",
    capacity_gallons: 750000,
    year_built: 1978,
    diameter_feet: 52,
    height_feet: 140,
    material: "Steel",
    coating_type: "Epoxy Interior / Alkyd Exterior",
    last_coating_date: "2015-04-20",
    last_inspection_date: "2022-10-12",
    next_inspection_due: "2024-10-12",
    overall_condition: "Fair",
    interior_condition: "Fair",
    exterior_condition: "Poor",
    foundation_condition: "Good",
    status: "Active",
    notes: "Exterior coating failing. Proposal submitted for recoating.",
    creation: "2018-06-20",
    modified: "2024-02-15",
  },
  {
    name: "TANK-004",
    tank_name: "Riverside Hilltop Standpipe",
    site: "SITE-004",
    tank_type: "Standpipe",
    capacity_gallons: 300000,
    year_built: 2005,
    diameter_feet: 25,
    height_feet: 85,
    material: "Steel",
    coating_type: "Epoxy Interior / Polyurethane Exterior",
    last_coating_date: "2019-03-01",
    last_inspection_date: "2024-01-15",
    next_inspection_due: "2025-01-15",
    overall_condition: "Good",
    interior_condition: "Good",
    exterior_condition: "Good",
    foundation_condition: "Good",
    status: "Active",
    creation: "2019-11-08",
    modified: "2024-01-25",
  },
]

export const mockProposals: Proposal[] = [
  {
    name: "PROP-001",
    customer: "CUST-002",
    site: "SITE-003",
    tank: "TANK-003",
    proposal_type: "Negotiated",
    status: "Submitted",
    proposal_value: 285000,
    work_scope: "Full Recoat",
    description: "Complete exterior and interior recoating of Greenville Spheroid tank.",
    submitted_date: "2024-02-01",
    follow_up_date: "2024-03-15",
    creation: "2024-01-15",
    modified: "2024-02-01",
  },
  {
    name: "PROP-002",
    customer: "CUST-001",
    site: "SITE-001",
    tank: "TANK-001",
    proposal_type: "Engineered",
    status: "Won",
    proposal_value: 45000,
    work_scope: "Repair",
    description: "Exterior rust spot repair and touch-up coating.",
    submitted_date: "2023-12-01",
    won_date: "2024-01-05",
    creation: "2023-11-20",
    modified: "2024-01-05",
  },
  {
    name: "PROP-003",
    customer: "CUST-003",
    site: "SITE-004",
    tank: "TANK-004",
    proposal_type: "Negotiated",
    status: "Draft",
    proposal_value: 18500,
    work_scope: "Inspection",
    description: "Comprehensive 5-year inspection with ROV interior survey.",
    creation: "2024-02-20",
    modified: "2024-02-20",
  },
]

export const mockInspections: Inspection[] = [
  {
    name: "INSP-001",
    tank: "TANK-001",
    site: "SITE-001",
    customer: "CUST-001",
    inspection_type: "Annual",
    inspection_date: "2023-06-20",
    inspector: "Mike Thompson",
    overall_condition: "Good",
    interior_condition: "Good",
    exterior_condition: "Fair",
    foundation_condition: "Good",
    recommendations: "Monitor exterior rust spots. Consider touch-up coating within 12 months.",
    status: "Completed",
    creation: "2023-06-20",
    modified: "2023-06-25",
  },
  {
    name: "INSP-002",
    tank: "TANK-003",
    site: "SITE-003",
    customer: "CUST-002",
    inspection_type: "Comprehensive",
    inspection_date: "2022-10-12",
    inspector: "Sarah Martinez",
    overall_condition: "Fair",
    interior_condition: "Fair",
    exterior_condition: "Poor",
    foundation_condition: "Good",
    recommendations: "Exterior coating has failed in multiple areas. Full recoat recommended within 6-12 months.",
    status: "Completed",
    creation: "2022-10-12",
    modified: "2022-10-18",
  },
  {
    name: "INSP-003",
    tank: "TANK-004",
    site: "SITE-004",
    customer: "CUST-003",
    inspection_type: "Annual",
    inspection_date: "2024-01-15",
    inspector: "Mike Thompson",
    overall_condition: "Good",
    interior_condition: "Good",
    exterior_condition: "Good",
    foundation_condition: "Good",
    recommendations: "No immediate action required. Continue annual inspections.",
    status: "Completed",
    creation: "2024-01-15",
    modified: "2024-01-20",
  },
]

export const mockServiceVisits: ServiceVisit[] = [
  {
    name: "SVC-001",
    tank: "TANK-001",
    site: "SITE-001",
    customer: "CUST-001",
    visit_date: "2024-01-20",
    visit_type: "Repair",
    technician: "Carlos Mendez",
    work_performed: "Prepared and primed 3 exterior rust spots for coating.",
    status: "Completed",
    creation: "2024-01-20",
    modified: "2024-01-20",
  },
  {
    name: "SVC-002",
    tank: "TANK-002",
    site: "SITE-002",
    customer: "CUST-001",
    visit_date: "2024-02-10",
    visit_type: "Maintenance",
    technician: "James Wilson",
    work_performed: "Replaced access ladder safety clips. Lubricated hatch hinges.",
    status: "Completed",
    creation: "2024-02-10",
    modified: "2024-02-10",
  },
]

// Helper functions to simulate API calls
export function getCustomers(): Customer[] {
  return mockCustomers
}

export function getCustomer(id: string): Customer | undefined {
  return mockCustomers.find((c) => c.name === id)
}

export function getSites(customerId?: string): Site[] {
  if (customerId) {
    return mockSites.filter((s) => s.customer === customerId)
  }
  return mockSites
}

export function getSite(id: string): Site | undefined {
  return mockSites.find((s) => s.name === id)
}

export function getTanks(siteId?: string): Tank[] {
  if (siteId) {
    return mockTanks.filter((t) => t.site === siteId)
  }
  return mockTanks
}

export function getTank(id: string): Tank | undefined {
  return mockTanks.find((t) => t.name === id)
}

export function getProposals(customerId?: string): Proposal[] {
  if (customerId) {
    return mockProposals.filter((p) => p.customer === customerId)
  }
  return mockProposals
}

export function getInspections(tankId?: string, customerId?: string): Inspection[] {
  if (tankId) {
    return mockInspections.filter((i) => i.tank === tankId)
  }
  if (customerId) {
    return mockInspections.filter((i) => i.customer === customerId)
  }
  return mockInspections
}

export function getServiceVisits(tankId?: string): ServiceVisit[] {
  if (tankId) {
    return mockServiceVisits.filter((v) => v.tank === tankId)
  }
  return mockServiceVisits
}

// Aggregate stats
export function getCustomerStats(customerId: string) {
  const sites = getSites(customerId)
  const siteIds = sites.map((s) => s.name)
  const tanks = mockTanks.filter((t) => siteIds.includes(t.site!))
  const proposals = getProposals(customerId)
  const inspections = getInspections(undefined, customerId)
  
  const openProposals = proposals.filter((p) => p.status === "Submitted" || p.status === "Draft")
  const totalProposalValue = proposals.reduce((sum, p) => sum + (p.proposal_value || 0), 0)
  const wonValue = proposals.filter((p) => p.status === "Won").reduce((sum, p) => sum + (p.proposal_value || 0), 0)

  return {
    siteCount: sites.length,
    tankCount: tanks.length,
    openProposalCount: openProposals.length,
    totalProposalValue,
    wonValue,
    inspectionCount: inspections.length,
    lastInspectionDate: inspections.length > 0 
      ? inspections.sort((a, b) => new Date(b.inspection_date!).getTime() - new Date(a.inspection_date!).getTime())[0].inspection_date 
      : null,
  }
}
