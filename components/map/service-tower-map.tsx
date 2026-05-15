'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('./map-container'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-64 h-64 rounded-lg" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }
)

export function ServiceTowerMap() {
  return <MapContainer />
}
