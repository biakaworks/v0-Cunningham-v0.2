import { ServiceTowerMap } from '@/components/map'

export const metadata = {
  title: 'Service Tower Map | Cunningham Operations Hub',
  description: 'Interactive map of all Cunningham service towers with status filtering',
}

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <ServiceTowerMap />
    </div>
  )
}
