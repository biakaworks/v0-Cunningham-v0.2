'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { MapMarker } from './map-marker'
import { MapFilterPanel } from './map-filter-panel'
import { Button } from '@/components/ui/button'
import { PanelRightOpen, PanelRightClose } from 'lucide-react'

import { mockMapSites, filterMapSites, getBoundingBox, getFilterOptions } from '@/lib/mock-map-data'
import type { MapSite, MapFilters } from '@/types/map'
import { DEFAULT_MAP_FILTERS } from '@/types/map'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function FitBounds({ sites }: { sites: MapSite[] }) {
  const map = useMap()
  
  useEffect(() => {
    const bounds = getBoundingBox(sites)
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, sites])
  
  return null
}

export default function MapContainerComponent() {
  const [filterPanelOpen, setFilterPanelOpen] = useState(true)
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_MAP_FILTERS)
  const [selectedSite, setSelectedSite] = useState<string | null>(null)
  
  const filterOptions = useMemo(() => getFilterOptions(), [])
  
  const filteredSites = useMemo(() => {
    return filterMapSites(mockMapSites, filters)
  }, [filters])
  
  const handleResetFilters = () => {
    setFilters(DEFAULT_MAP_FILTERS)
  }
  
  const handleResetToDefaultView = () => {
    setFilters(DEFAULT_MAP_FILTERS)
    setSelectedSite(null)
  }
  
  // Calculate initial center from all sites
  const initialCenter = useMemo(() => {
    if (mockMapSites.length === 0) return [39.8283, -98.5795] as [number, number] // US center
    const bounds = getBoundingBox(mockMapSites)
    if (!bounds) return [39.8283, -98.5795] as [number, number]
    return [
      (bounds[0][0] + bounds[1][0]) / 2,
      (bounds[0][1] + bounds[1][1]) / 2
    ] as [number, number]
  }, [])

  return (
    <div className="relative w-full h-full flex">
      {/* Map */}
      <div className={`flex-1 h-full transition-all duration-300 ${filterPanelOpen ? 'mr-80' : ''}`}>
        <MapContainer
          center={initialCenter}
          zoom={5}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds sites={filteredSites} />
          {filteredSites.map((site) => (
            <MapMarker
              key={site.name}
              site={site}
              isSelected={selectedSite === site.name}
              onSelect={() => setSelectedSite(site.name)}
              onClose={() => setSelectedSite(null)}
            />
          ))}
        </MapContainer>
        
        {/* Toggle filter panel button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-[1000] shadow-md"
          onClick={() => setFilterPanelOpen(!filterPanelOpen)}
          style={{ right: filterPanelOpen ? '336px' : '16px' }}
        >
          {filterPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>
        
        {/* Site count badge */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur px-3 py-1.5 rounded-md shadow-md border">
          <span className="text-sm font-medium">
            {filteredSites.length} of {mockMapSites.length} towers
          </span>
        </div>
      </div>
      
      {/* Filter Panel */}
      <MapFilterPanel
        open={filterPanelOpen}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={filterOptions}
        onReset={handleResetFilters}
        onResetToDefaultView={handleResetToDefaultView}
      />
    </div>
  )
}
