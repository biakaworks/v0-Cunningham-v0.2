/**
 * Customer and site data types for pipeline map view
 * This will be populated from Frappe in production
 */

export interface CustomerSite {
  name: string
  gpsCoords: string
  tankType?: string
}

export interface CustomerData {
  name: string
  shortName: string
  sites: CustomerSite[]
}

// Demo data - will be replaced by Frappe API calls
export const customers: CustomerData[] = [
  {
    name: 'City of Springfield',
    shortName: 'Springfield',
    sites: [
      { name: 'Tower #2', gpsCoords: '37.2089, -93.2923' },
      { name: 'Tower #1', gpsCoords: '37.1989, -93.2823' },
    ]
  },
  {
    name: 'MO DNR — Marshall',
    shortName: 'Marshall',
    sites: [
      { name: 'Standpipe', gpsCoords: '39.1230, -93.1967' },
    ]
  },
  {
    name: 'Neosho Municipal',
    shortName: 'Neosho',
    sites: [
      { name: 'Water Tower #1', gpsCoords: '36.8689, -94.3680' },
    ]
  },
  {
    name: 'City of Joplin',
    shortName: 'Joplin',
    sites: [
      { name: 'Tower #4 — Azure Lane', gpsCoords: '37.0842, -94.5133' },
      { name: 'Tower #1', gpsCoords: '37.0742, -94.5033' },
    ]
  },
  {
    name: 'Branson Water',
    shortName: 'Branson',
    sites: [
      { name: 'Clear Well', gpsCoords: '36.6437, -93.2185' },
    ]
  },
  {
    name: 'Monett Utilities',
    shortName: 'Monett',
    sites: [
      { name: 'North Tank', gpsCoords: '36.9287, -93.9277' },
    ]
  },
  {
    name: 'Town of Lebanon',
    shortName: 'Lebanon',
    sites: [
      { name: 'Hilltop Tank', gpsCoords: '37.6806, -92.6638' },
    ]
  },
  {
    name: 'AR Highway Dept',
    shortName: 'AR Highway',
    sites: [
      { name: 'Site 47', gpsCoords: '36.0726, -94.1574' },
    ]
  },
  {
    name: 'Pittsburg Township',
    shortName: 'Pittsburg',
    sites: [
      { name: 'Main Tower', gpsCoords: '37.4109, -94.7049' },
    ]
  },
  {
    name: 'City of Carthage',
    shortName: 'Carthage',
    sites: [
      { name: 'East Tower', gpsCoords: '37.1764, -94.3103' },
    ]
  },
  {
    name: 'OK Rural Water',
    shortName: 'OK Rural',
    sites: [
      { name: 'Tank 12', gpsCoords: '36.1540, -95.9928' },
    ]
  },
  {
    name: 'Joplin Industrial Park',
    shortName: 'Joplin Industrial',
    sites: [
      { name: 'Process Tank', gpsCoords: '37.0542, -94.4833' },
    ]
  },
  {
    name: 'KS Municipal',
    shortName: 'KS Municipal',
    sites: [
      { name: 'Standpipe #3', gpsCoords: '37.6922, -97.3375' },
    ]
  },
  {
    name: 'City of Webb City',
    shortName: 'Webb City',
    sites: [
      { name: 'Tower', gpsCoords: '37.1461, -94.4630' },
    ]
  },
  {
    name: 'MO 109 Authority',
    shortName: 'MO 109',
    sites: [
      { name: 'Clear Well', gpsCoords: '38.6270, -90.1994' },
    ]
  },
  {
    name: 'Grove OK Water',
    shortName: 'Grove OK',
    sites: [
      { name: 'Tank #2', gpsCoords: '36.5937, -94.7691' },
    ]
  },
]
