'use client'

import { useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  Wrench, 
  Phone, 
  FileText, 
  Calendar, 
  Check,
  ExternalLink,
  MapPin
} from 'lucide-react'

import type { MapSite } from '@/types/map'
import { MARKER_CONFIG, LOCATION_CONFIDENCE_CONFIG } from '@/types/map'

interface MapMarkerProps {
  site: MapSite
  isSelected: boolean
  onSelect: () => void
  onClose: () => void
}

const ICON_MAP = {
  'alert-triangle': AlertTriangle,
  'wrench': Wrench,
  'phone': Phone,
  'file-text': FileText,
  'calendar': Calendar,
  'check': Check,
  '': null,
}

function createCustomIcon(site: MapSite): L.DivIcon {
  const config = MARKER_CONFIG[site.marker_priority]
  const confidenceConfig = LOCATION_CONFIDENCE_CONFIG[site.location_confidence]
  
  const iconSvg = config.icon ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${getIconPath(config.icon)}
    </svg>
  ` : ''
  
  const confidenceBadge = confidenceConfig.icon === 'triangle' 
    ? `<div style="position: absolute; top: -4px; right: -4px; width: 10px; height: 10px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="${confidenceConfig.color}">
          <path d="M12 2L2 22h20L12 2z"/>
        </svg>
       </div>`
    : confidenceConfig.icon === 'dot'
    ? `<div style="position: absolute; top: -3px; right: -3px; width: 8px; height: 8px; border-radius: 50%; background: ${confidenceConfig.color}; border: 1px solid white;"></div>`
    : ''
  
  const html = `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      background: ${config.bgColor};
      border: 2px solid ${config.borderColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${config.color};
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">
      ${iconSvg}
      ${confidenceBadge}
    </div>
  `
  
  return L.divIcon({
    className: 'custom-marker',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

function getIconPath(icon: string): string {
  switch (icon) {
    case 'alert-triangle':
      return '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
    case 'wrench':
      return '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'
    case 'phone':
      return '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'
    case 'file-text':
      return '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>'
    case 'calendar':
      return '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>'
    case 'check':
      return '<path d="M20 6 9 17l-5-5"/>'
    default:
      return ''
  }
}

function formatDate(date?: string): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function MapMarker({ site, isSelected, onSelect, onClose }: MapMarkerProps) {
  const icon = useMemo(() => createCustomIcon(site), [site])
  const markerConfig = MARKER_CONFIG[site.marker_priority]
  const confidenceConfig = LOCATION_CONFIDENCE_CONFIG[site.location_confidence]
  
  const serviceStatusColor = 
    site.service_status === 'overdue' ? 'bg-status-red text-white' :
    site.service_status === 'due' ? 'bg-status-yellow text-foreground' :
    site.service_status === 'scheduled' ? 'bg-mwi-navy text-white' :
    site.service_status === 'completed' ? 'bg-status-green text-white' :
    'bg-muted text-muted-foreground'
  
  const proposalStatusColor =
    site.proposal_status === 'won' ? 'bg-status-green text-white' :
    site.proposal_status === 'stale' || site.proposal_status === 'follow-up-due' ? 'bg-status-yellow text-foreground' :
    site.proposal_status === 'lost' || site.proposal_status === 'expired' ? 'bg-status-red text-white' :
    site.proposal_status === 'sent' ? 'bg-mwi-water-blue text-white' :
    'bg-muted text-muted-foreground'

  return (
    <Marker 
      position={[site.latitude, site.longitude]} 
      icon={icon}
      eventHandlers={{
        click: onSelect,
      }}
    >
      <Popup className="custom-popup" maxWidth={320} minWidth={280}>
        <div className="p-1">
          {/* Header */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-0.5">{site.customer_name}</p>
            <h3 className="font-semibold text-foreground leading-tight">{site.site_name}</h3>
            <p className="text-sm text-muted-foreground">{site.tank_name}</p>
          </div>
          
          {/* Status badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge className={serviceStatusColor}>
              {site.service_status.replace('-', ' ')}
            </Badge>
            <Badge className={proposalStatusColor}>
              {site.proposal_status.replace('-', ' ')}
            </Badge>
          </div>
          
          <Separator className="my-3" />
          
          {/* Details */}
          {site.can_view_details ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Last Service</p>
                  <p className="font-medium">{formatDate(site.last_service_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Next Due</p>
                  <p className="font-medium">{formatDate(site.next_due_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Open Actions</p>
                  <p className="font-medium">{site.open_action_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tank Type</p>
                  <p className="font-medium text-xs">{site.tank_type}</p>
                </div>
              </div>
              
              {/* Location confidence warning */}
              {confidenceConfig.warning && (
                <div className="bg-status-yellow/10 border border-status-yellow/30 rounded-md p-2 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-status-yellow shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">
                      Location accuracy not confirmed — review in admin.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Location confidence badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3 w-3" />
                <span>Location: {confidenceConfig.label}</span>
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: confidenceConfig.color }}
                />
              </div>
              
              <Button asChild className="w-full" size="sm">
                <Link href={`/sites/${site.name}`}>
                  Open Site Detail
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Restricted</p>
              <p className="text-xs text-muted-foreground mt-1">
                You do not have permission to view details for this site.
              </p>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
