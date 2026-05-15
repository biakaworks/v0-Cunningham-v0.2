// Mock data for Service Due List

import type { ServiceDueItem, ServiceFilters, ServiceDueListStatus } from '@/types/service'

// Calculate days until a date
function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  const diff = date.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const mockServiceDueItems: ServiceDueItem[] = [
  {
    name: 'SVC-DUE-001',
    customer: 'CUST-001',
    customer_name: 'City of Springfield Water Department',
    site: 'SITE-001',
    site_name: 'Springfield Main Water Tower',
    tank: 'TANK-001',
    tank_name: 'Springfield Main Tower #1',
    next_due_date: '2024-06-15',
    days_until: daysUntil('2024-06-15'),
    service_cycle: 'Every 2 years',
    crew_assignment: 'CREW-001',
    crew_name: 'Alpha Crew',
    status: 'due',
    outreach_status: 'sent',
    last_service_date: '2022-06-15',
    state: 'IL',
    region: 'Central',
  },
  {
    name: 'SVC-DUE-002',
    customer: 'CUST-001',
    customer_name: 'City of Springfield Water Department',
    site: 'SITE-002',
    site_name: 'Springfield North Reservoir',
    tank: 'TANK-002',
    tank_name: 'Springfield North Reservoir',
    next_due_date: '2025-08-15',
    days_until: daysUntil('2025-08-15'),
    service_cycle: 'Every 2 years',
    crew_assignment: 'CREW-002',
    crew_name: 'Beta Crew',
    status: 'scheduled',
    outreach_status: 'scheduled',
    last_service_date: '2023-08-15',
    state: 'IL',
    region: 'Central',
  },
  {
    name: 'SVC-DUE-003',
    customer: 'CUST-002',
    customer_name: 'Greenville Municipal Utilities',
    site: 'SITE-003',
    site_name: 'Greenville Central Tower',
    tank: 'TANK-003',
    tank_name: 'Greenville Spheroid',
    next_due_date: '2024-10-12',
    days_until: daysUntil('2024-10-12'),
    service_cycle: 'Every 2 years',
    status: 'due',
    outreach_status: 'not-sent',
    last_service_date: '2022-10-12',
    state: 'TX',
    region: 'North Texas',
  },
  {
    name: 'SVC-DUE-004',
    customer: 'CUST-003',
    customer_name: 'Riverside Water District',
    site: 'SITE-004',
    site_name: 'Riverside Hilltop Station',
    tank: 'TANK-004',
    tank_name: 'Riverside Hilltop Standpipe',
    next_due_date: '2025-01-15',
    days_until: daysUntil('2025-01-15'),
    service_cycle: 'Annual',
    crew_assignment: 'CREW-003',
    crew_name: 'West Coast Crew',
    status: 'scheduled',
    outreach_status: 'replied',
    last_service_date: '2024-01-15',
    state: 'CA',
    region: 'Southern California',
  },
  {
    name: 'SVC-DUE-005',
    customer: 'CUST-006',
    customer_name: 'Champaign-Urbana Water District',
    site: 'SITE-005',
    site_name: 'Champaign East Tower',
    tank: 'TANK-005',
    tank_name: 'Champaign East Tower',
    next_due_date: '2025-03-10',
    days_until: daysUntil('2025-03-10'),
    service_cycle: 'Every 2 years',
    status: 'scheduled',
    outreach_status: 'scheduled',
    last_service_date: '2023-03-10',
    state: 'IL',
    region: 'Central',
  },
  {
    name: 'SVC-DUE-006',
    customer: 'CUST-007',
    customer_name: 'Decatur Municipal Utilities',
    site: 'SITE-006',
    site_name: 'Decatur Industrial Park',
    tank: 'TANK-006',
    tank_name: 'Decatur Industrial Tank',
    next_due_date: '2024-11-20',
    days_until: daysUntil('2024-11-20'),
    service_cycle: 'Every 2 years',
    status: 'due',
    outreach_status: 'sent',
    last_service_date: '2022-11-20',
    state: 'IL',
    region: 'Central',
  },
  {
    name: 'SVC-DUE-007',
    customer: 'CUST-008',
    customer_name: 'Dallas Water Utilities',
    site: 'SITE-007',
    site_name: 'Dallas Heights Station',
    tank: 'TANK-007',
    tank_name: 'Dallas Heights Tower',
    next_due_date: '2026-02-01',
    days_until: daysUntil('2026-02-01'),
    service_cycle: 'Every 2 years',
    status: 'completed',
    outreach_status: 'scheduled',
    last_service_date: '2024-02-01',
    state: 'TX',
    region: 'North Texas',
  },
  {
    name: 'SVC-DUE-008',
    customer: 'CUST-010',
    customer_name: 'LA Department of Water and Power',
    site: 'SITE-009',
    site_name: 'Los Angeles West Basin',
    tank: 'TANK-009',
    tank_name: 'LA West Basin Reservoir',
    next_due_date: '2023-05-20',
    days_until: daysUntil('2023-05-20'),
    service_cycle: 'Every 2 years',
    status: 'due',
    outreach_status: 'no-response',
    last_service_date: '2021-05-20',
    state: 'CA',
    region: 'Southern California',
  },
  {
    name: 'SVC-DUE-009',
    customer: 'CUST-005',
    customer_name: 'Valley View Water Authority',
    site: 'SITE-010',
    site_name: 'Phoenix North Tower',
    tank: 'TANK-010',
    tank_name: 'Phoenix North Elevated',
    next_due_date: '2025-09-01',
    days_until: daysUntil('2025-09-01'),
    service_cycle: 'Every 2 years',
    crew_assignment: 'CREW-004',
    crew_name: 'Southwest Crew',
    status: 'scheduled',
    outreach_status: 'replied',
    last_service_date: '2023-09-01',
    state: 'AZ',
    region: 'Phoenix Metro',
  },
  {
    name: 'SVC-DUE-010',
    customer: 'CUST-011',
    customer_name: 'Tucson Water',
    site: 'SITE-011',
    site_name: 'Tucson Central',
    tank: 'TANK-011',
    tank_name: 'Tucson Central Tower',
    next_due_date: '2024-12-01',
    days_until: daysUntil('2024-12-01'),
    service_cycle: 'Every 2 years',
    status: 'due',
    outreach_status: 'sent',
    last_service_date: '2022-12-01',
    state: 'AZ',
    region: 'Southern Arizona',
  },
]

// Mock crews
export const mockCrews = [
  { name: 'CREW-001', label: 'Alpha Crew' },
  { name: 'CREW-002', label: 'Beta Crew' },
  { name: 'CREW-003', label: 'West Coast Crew' },
  { name: 'CREW-004', label: 'Southwest Crew' },
]

// Get filter options from data
export function getServiceFilterOptions() {
  const states = [...new Set(mockServiceDueItems.map(s => s.state))].sort()
  const regions = [...new Set(mockServiceDueItems.map(s => s.region).filter(Boolean))] as string[]
  const customers = [...new Set(mockServiceDueItems.map(s => ({ name: s.customer, label: s.customer_name })))]
  const sites = mockServiceDueItems.map(s => ({ name: s.site, label: s.site_name }))
  const years = [2023, 2024, 2025, 2026]
  
  return { states, regions, customers, sites, crews: mockCrews, years }
}

// Apply filters to service items
export function filterServiceItems(items: ServiceDueItem[], filters: ServiceFilters): ServiceDueItem[] {
  return items.filter(item => {
    // Year filter (check if next_due_date is in the selected year)
    if (filters.year) {
      const itemYear = new Date(item.next_due_date).getFullYear()
      if (itemYear !== filters.year) return false
    }
    
    // State filter
    if (filters.state.length > 0 && !filters.state.includes(item.state)) {
      return false
    }
    
    // Region filter
    if (filters.region.length > 0 && (!item.region || !filters.region.includes(item.region))) {
      return false
    }
    
    // Customer filter
    if (filters.customer && item.customer !== filters.customer) {
      return false
    }
    
    // Site filter
    if (filters.site && item.site !== filters.site) {
      return false
    }
    
    // Crew filter
    if (filters.crew && item.crew_assignment !== filters.crew) {
      return false
    }
    
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(item.status)) {
      return false
    }
    
    return true
  })
}

// Sort by days_until (most urgent first)
export function sortServiceItems(items: ServiceDueItem[], sortBy: keyof ServiceDueItem, sortDir: 'asc' | 'desc'): ServiceDueItem[] {
  return [...items].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]
    
    // Handle undefined values
    if (aVal === undefined) aVal = '' as never
    if (bVal === undefined) bVal = '' as never
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    return 0
  })
}
