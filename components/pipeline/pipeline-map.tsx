"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import type { PipelineProposal, TypeFilter } from "@/types/pipeline"
import { STATUS_DOT_COLORS } from "@/types/pipeline"
import dynamic from "next/dynamic"

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

interface PipelineMapProps {
  proposals: PipelineProposal[]
  typeFilter: TypeFilter
}

// Mock site locations for proposals
const SITE_LOCATIONS: Record<string, [number, number]> = {
  "SITE-001": [39.7817, -89.6501], // Springfield, IL
  "SITE-002": [39.8012, -89.6234],
  "SITE-003": [33.1384, -96.1108], // Greenville, TX
  "SITE-004": [33.9806, -117.3755], // Riverside, CA
  "SITE-005": [33.4484, -112.074], // Phoenix, AZ
  "SITE-006": [40.5267, -79.8284], // Oakmont, PA
}

export function PipelineMap({ proposals, typeFilter }: PipelineMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filteredProposals = proposals.filter((p) => {
    // Only active proposals
    if (!["Draft", "Sent", "Follow-Up Due", "Pending Board Approval"].includes(p.status)) {
      return false
    }
    if (typeFilter === "engineered") return p.proposal_type === "Engineered Spec"
    if (typeFilter === "negotiated") return p.proposal_type === "Negotiated"
    return true
  })

  // Group proposals by site
  const proposalsBySite = filteredProposals.reduce((acc, p) => {
    const siteId = p.site || "unknown"
    if (!acc[siteId]) acc[siteId] = []
    acc[siteId].push(p)
    return acc
  }, {} as Record<string, PipelineProposal[]>)

  if (!isMounted) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex h-full items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="mx-auto h-12 w-12 opacity-50" />
            <p className="mt-2">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] overflow-hidden">
      <CardContent className="h-full p-0">
        <MapContainer
          center={[39.8283, -98.5795]} // Center of US
          zoom={4}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.entries(proposalsBySite).map(([siteId, siteProposals]) => {
            const location = SITE_LOCATIONS[siteId]
            if (!location) return null

            const totalValue = siteProposals.reduce((sum, p) => sum + (p.total || 0), 0)
            const primaryProposal = siteProposals[0]

            return (
              <Marker key={siteId} position={location}>
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold">{primaryProposal.site_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {primaryProposal.customer_name}
                    </p>
                    <div className="mt-2 space-y-1">
                      {siteProposals.map((p) => (
                        <div
                          key={p.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-1">
                            <div
                              className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[p.status]}`}
                            />
                            <span className="truncate max-w-[120px]">{p.title}</span>
                          </div>
                          <span className="font-medium">
                            {(p.total || 0).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 border-t pt-2">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>Total</span>
                        <span>
                          {totalValue.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </CardContent>
    </Card>
  )
}
