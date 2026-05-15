// Mock data for Service Tower Map

import type { MapSite, MapFilters, MARKER_PRIORITY_ORDER } from '@/types/map'

export const mockMapSites: MapSite[] = [
  // Illinois sites
  {
    name: 'SITE-001',
    site_name: 'Springfield Main Water Tower',
    customer: 'CUST-001',
    customer_name: 'City of Springfield Water Department',
    tank_id: 'TANK-001',
    tank_name: 'Springfield Main Tower #1',
    latitude: 39.7817,
    longitude: -89.6501,
    state: 'IL',
    region: 'Central',
    tank_type: 'Elevated - Multi-Leg',
    service_year: 2024,
    marker_priority: 'overdue-service',
    service_status: 'overdue',
    proposal_status: 'no-proposal',
    location_confidence: 'verified',
    last_service_date: '2022-06-15',
    next_due_date: '2024-06-15',
    open_action_count: 2,
    can_view_details: true,
  },
  {
    name: 'SITE-002',
    site_name: 'Springfield North Reservoir',
    customer: 'CUST-001',
    customer_name: 'City of Springfield Water Department',
    tank_id: 'TANK-002',
    tank_name: 'Springfield North Reservoir',
    latitude: 39.8012,
    longitude: -89.6234,
    state: 'IL',
    region: 'Central',
    tank_type: 'Ground - Standpipe',
    service_year: 2024,
    marker_priority: 'scheduled-service',
    service_status: 'scheduled',
    proposal_status: 'won',
    location_confidence: 'verified',
    last_service_date: '2023-08-15',
    next_due_date: '2025-08-15',
    open_action_count: 0,
    can_view_details: true,
  },
  {
    name: 'SITE-005',
    site_name: 'Champaign East Tower',
    customer: 'CUST-006',
    customer_name: 'Champaign-Urbana Water District',
    tank_id: 'TANK-005',
    tank_name: 'Champaign East Tower',
    latitude: 40.1164,
    longitude: -88.2434,
    state: 'IL',
    region: 'Central',
    tank_type: 'Elevated - Spheroid',
    service_year: 2025,
    marker_priority: 'active-project',
    service_status: 'scheduled',
    proposal_status: 'won',
    location_confidence: 'verified',
    last_service_date: '2023-03-10',
    next_due_date: '2025-03-10',
    open_action_count: 3,
    can_view_details: true,
  },
  {
    name: 'SITE-006',
    site_name: 'Decatur Industrial Park',
    customer: 'CUST-007',
    customer_name: 'Decatur Municipal Utilities',
    tank_id: 'TANK-006',
    tank_name: 'Decatur Industrial Tank',
    latitude: 39.8403,
    longitude: -88.9548,
    state: 'IL',
    region: 'Central',
    tank_type: 'Ground - Reservoir',
    service_year: 2024,
    marker_priority: 'follow-up-due',
    service_status: 'due',
    proposal_status: 'follow-up-due',
    location_confidence: 'needs-review',
    last_service_date: '2022-11-20',
    next_due_date: '2024-11-20',
    open_action_count: 1,
    can_view_details: true,
  },
  // Texas sites
  {
    name: 'SITE-003',
    site_name: 'Greenville Central Tower',
    customer: 'CUST-002',
    customer_name: 'Greenville Municipal Utilities',
    tank_id: 'TANK-003',
    tank_name: 'Greenville Spheroid',
    latitude: 33.1384,
    longitude: -96.1108,
    state: 'TX',
    region: 'North Texas',
    tank_type: 'Elevated - Spheroid',
    service_year: 2024,
    marker_priority: 'stale-proposal',
    service_status: 'due',
    proposal_status: 'stale',
    location_confidence: 'verified',
    last_service_date: '2022-10-12',
    next_due_date: '2024-10-12',
    open_action_count: 1,
    can_view_details: true,
  },
  {
    name: 'SITE-007',
    site_name: 'Dallas Heights Station',
    customer: 'CUST-008',
    customer_name: 'Dallas Water Utilities',
    tank_id: 'TANK-007',
    tank_name: 'Dallas Heights Tower',
    latitude: 32.8998,
    longitude: -96.7897,
    state: 'TX',
    region: 'North Texas',
    tank_type: 'Elevated - Pedestal',
    service_year: 2025,
    marker_priority: 'on-schedule',
    service_status: 'completed',
    proposal_status: 'no-proposal',
    location_confidence: 'verified',
    last_service_date: '2024-02-01',
    next_due_date: '2026-02-01',
    open_action_count: 0,
    can_view_details: true,
  },
  {
    name: 'SITE-008',
    site_name: 'Fort Worth West Tank',
    customer: 'CUST-009',
    customer_name: 'Fort Worth Water Department',
    tank_id: 'TANK-008',
    tank_name: 'Fort Worth West Standpipe',
    latitude: 32.7357,
    longitude: -97.4203,
    state: 'TX',
    region: 'North Texas',
    tank_type: 'Ground - Standpipe',
    service_year: 2024,
    marker_priority: 'no-activity',
    service_status: 'not-scheduled',
    proposal_status: 'no-proposal',
    location_confidence: 'approximate',
    last_service_date: undefined,
    next_due_date: undefined,
    open_action_count: 0,
    can_view_details: true,
  },
  // California sites
  {
    name: 'SITE-004',
    site_name: 'Riverside Hilltop Station',
    customer: 'CUST-003',
    customer_name: 'Riverside Water District',
    tank_id: 'TANK-004',
    tank_name: 'Riverside Hilltop Standpipe',
    latitude: 33.9806,
    longitude: -117.3755,
    state: 'CA',
    region: 'Southern California',
    tank_type: 'Ground - Standpipe',
    service_year: 2025,
    marker_priority: 'on-schedule',
    service_status: 'completed',
    proposal_status: 'won',
    location_confidence: 'verified',
    last_service_date: '2024-01-15',
    next_due_date: '2025-01-15',
    open_action_count: 0,
    can_view_details: true,
  },
  {
    name: 'SITE-009',
    site_name: 'Los Angeles West Basin',
    customer: 'CUST-010',
    customer_name: 'LA Department of Water and Power',
    tank_id: 'TANK-009',
    tank_name: 'LA West Basin Reservoir',
    latitude: 34.0522,
    longitude: -118.4437,
    state: 'CA',
    region: 'Southern California',
    tank_type: 'Ground - Reservoir',
    service_year: 2024,
    marker_priority: 'overdue-service',
    service_status: 'overdue',
    proposal_status: 'sent',
    location_confidence: 'unverified',
    last_service_date: '2021-05-20',
    next_due_date: '2023-05-20',
    open_action_count: 4,
    can_view_details: true,
  },
  // Arizona sites
  {
    name: 'SITE-010',
    site_name: 'Phoenix North Tower',
    customer: 'CUST-005',
    customer_name: 'Valley View Water Authority',
    tank_id: 'TANK-010',
    tank_name: 'Phoenix North Elevated',
    latitude: 33.5722,
    longitude: -112.0891,
    state: 'AZ',
    region: 'Phoenix Metro',
    tank_type: 'Elevated - Fluted Column',
    service_year: 2024,
    marker_priority: 'scheduled-service',
    service_status: 'scheduled',
    proposal_status: 'no-proposal',
    location_confidence: 'verified',
    last_service_date: '2023-09-01',
    next_due_date: '2025-09-01',
    open_action_count: 0,
    can_view_details: true,
  },
  {
    name: 'SITE-011',
    site_name: 'Tucson Central',
    customer: 'CUST-011',
    customer_name: 'Tucson Water',
    tank_id: 'TANK-011',
    tank_name: 'Tucson Central Tower',
    latitude: 32.2226,
    longitude: -110.9747,
    state: 'AZ',
    region: 'Southern Arizona',
    tank_type: 'Elevated - Multi-Leg',
    service_year: 2024,
    marker_priority: 'follow-up-due',
    service_status: 'due',
    proposal_status: 'follow-up-due',
    location_confidence: 'needs-review',
    last_service_date: '2022-12-01',
    next_due_date: '2024-12-01',
    open_action_count: 2,
    can_view_details: true,
  },
  // Restricted site example
  {
    name: 'SITE-012',
    site_name: 'Classified Federal Facility',
    customer: 'CUST-012',
    customer_name: 'Federal Government',
    tank_id: 'TANK-012',
    tank_name: 'Restricted Tank',
    latitude: 35.0844,
    longitude: -106.6504,
    state: 'NM',
    region: 'New Mexico',
    tank_type: 'Ground - Clearwell',
    service_year: 2024,
    marker_priority: 'on-schedule',
    service_status: 'scheduled',
    proposal_status: 'won',
    location_confidence: 'verified',
    last_service_date: '2023-07-01',
    next_due_date: '2025-07-01',
    open_action_count: 0,
    can_view_details: false, // Restricted
  },
]

// Helper to get unique filter options from data
export function getFilterOptions() {
  const states = [...new Set(mockMapSites.map(s => s.state))].sort()
  const regions = [...new Set(mockMapSites.map(s => s.region).filter(Boolean))] as string[]
  const tankTypes = [...new Set(mockMapSites.map(s => s.tank_type))].sort()
  const customers = [...new Set(mockMapSites.map(s => ({ name: s.customer, label: s.customer_name })))]
  const sites = mockMapSites.map(s => ({ name: s.name, label: s.site_name }))
  const years = [...new Set(mockMapSites.map(s => s.service_year).filter(Boolean))] as number[]
  
  return { states, regions, tankTypes, customers, sites, years: years.sort() }
}

// Apply filters to sites
export function filterMapSites(sites: MapSite[], filters: MapFilters): MapSite[] {
  return sites.filter(site => {
    // Service status filter
    if (filters.service_status.length > 0 && !filters.service_status.includes(site.service_status)) {
      return false
    }
    
    // Proposal status filter
    if (filters.proposal_status.length > 0 && !filters.proposal_status.includes(site.proposal_status)) {
      return false
    }
    
    // Customer filter
    if (filters.customer && site.customer !== filters.customer) {
      return false
    }
    
    // Site filter
    if (filters.site && site.name !== filters.site) {
      return false
    }
    
    // State filter
    if (filters.state.length > 0 && !filters.state.includes(site.state)) {
      return false
    }
    
    // Region filter
    if (filters.region.length > 0 && (!site.region || !filters.region.includes(site.region))) {
      return false
    }
    
    // Tank type filter
    if (filters.tank_type.length > 0 && !filters.tank_type.includes(site.tank_type)) {
      return false
    }
    
    // Service year filter
    if (filters.service_year && site.service_year !== filters.service_year) {
      return false
    }
    
    // Location confidence filter
    if (filters.location_confidence.length > 0 && !filters.location_confidence.includes(site.location_confidence)) {
      return false
    }
    
    return true
  })
}

// Calculate bounding box for a set of sites
export function getBoundingBox(sites: MapSite[]): [[number, number], [number, number]] | null {
  if (sites.length === 0) return null
  
  const lats = sites.map(s => s.latitude)
  const lngs = sites.map(s => s.longitude)
  
  const padding = 0.5 // degrees
  
  return [
    [Math.min(...lats) - padding, Math.min(...lngs) - padding],
    [Math.max(...lats) + padding, Math.max(...lngs) + padding],
  ]
}
