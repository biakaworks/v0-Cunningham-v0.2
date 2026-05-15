"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  RecordHeader,
  StatsRow,
  RecordEditor,
  ActivityTimeline,
  QuickActions,
  RelatedRecordsCard,
  inspectionToActivity,
  serviceVisitToActivity,
  mergeActivities,
} from "@/components/records"
import type { FieldConfig, RelatedRecord } from "@/components/records"
import {
  getSite,
  getCustomer,
  getTanks,
  getInspections,
  getServiceVisits,
} from "@/lib/mock-data"
import type { Site } from "@/types/cunningham"
import {
  Plus,
  ClipboardCheck,
  MapPin,
  Droplets,
  Navigation,
  Phone,
  AlertCircle,
} from "lucide-react"

export default function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const site = getSite(id)

  if (!site) {
    notFound()
  }

  const customer = getCustomer(site.customer!)
  const tanks = getTanks(id)

  // Get all inspections and service visits for this site's tanks
  const allInspections = tanks.flatMap((t) => getInspections(t.name))
  const allServiceVisits = tanks.flatMap((t) => getServiceVisits(t.name))

  // Build activity timeline
  const activities = mergeActivities(
    allInspections.map(inspectionToActivity),
    allServiceVisits.map(serviceVisitToActivity)
  )

  // Site info fields
  const siteFields: FieldConfig[] = [
    { name: "site_name", label: "Site Name", type: "text", required: true, colSpan: 2 },
    { name: "customer", label: "Customer", type: "readonly", colSpan: 2 },
    { name: "address", label: "Address", type: "text", colSpan: 2 },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    { name: "zip_code", label: "ZIP Code", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
    { name: "latitude", label: "Latitude", type: "number" },
    { name: "longitude", label: "Longitude", type: "number" },
    { name: "site_contact", label: "Site Contact", type: "text" },
    { name: "site_phone", label: "Site Phone", type: "text" },
    { name: "access_notes", label: "Access Notes", type: "textarea", colSpan: 2 },
  ]

  // Transform tanks to related records with condition-based styling
  const tankRecords: RelatedRecord[] = tanks.map((tank) => {
    const conditionVariant =
      tank.overall_condition === "Good"
        ? "default"
        : tank.overall_condition === "Fair"
        ? "secondary"
        : "destructive"

    return {
      id: tank.name!,
      title: tank.tank_name!,
      subtitle: `${tank.tank_type} - ${tank.capacity_gallons?.toLocaleString()} gal`,
      status: tank.overall_condition,
      statusVariant: conditionVariant,
      href: `/sites/${id}/tanks/${tank.name}`,
      metadata: [
        { label: "Built", value: String(tank.year_built || "-") },
        { label: "Last Inspected", value: tank.last_inspection_date || "-" },
      ],
    }
  })

  // Calculate stats
  const tanksNeedingAttention = tanks.filter(
    (t) => t.overall_condition === "Poor" || t.overall_condition === "Fair"
  ).length
  const nextInspectionDue = tanks
    .filter((t) => t.next_inspection_due)
    .sort(
      (a, b) =>
        new Date(a.next_inspection_due!).getTime() -
        new Date(b.next_inspection_due!).getTime()
    )[0]?.next_inspection_due

  const handleSave = async (data: Partial<Site>) => {
    // TODO: Implement Frappe save
    console.log("Saving site:", data)
  }

  const quickActions = [
    {
      id: "add-tank",
      label: "Add Tank",
      icon: Plus,
      onClick: () => console.log("Add tank"),
      variant: "default" as const,
    },
    {
      id: "schedule-inspection",
      label: "Schedule Inspection",
      icon: ClipboardCheck,
      onClick: () => console.log("Schedule inspection"),
    },
    {
      id: "directions",
      label: "Directions",
      icon: Navigation,
      onClick: () =>
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`
        ),
    },
    {
      id: "call-site",
      label: "Call Site",
      icon: Phone,
      onClick: () => window.open(`tel:${site.site_phone}`),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <RecordHeader
        title={site.site_name!}
        subtitle={`${site.city}, ${site.state} ${site.zip_code}`}
        status={site.status}
        statusVariant={site.status === "Active" ? "default" : "secondary"}
        icon="site"
        breadcrumbs={[
          { label: "Customers", href: "/customers" },
          { label: customer?.customer_name || "Unknown", href: `/customers/${site.customer}` },
          { label: site.site_name! },
        ]}
        backHref={`/customers/${site.customer}`}
      >
        <QuickActions actions={quickActions} maxVisible={3} />
      </RecordHeader>

      {/* Stats Row */}
      <StatsRow
        stats={[
          { label: "Total Tanks", value: tanks.length },
          {
            label: "Needs Attention",
            value: tanksNeedingAttention,
            subValue: tanksNeedingAttention > 0 ? "Fair or Poor condition" : undefined,
          },
          { label: "Inspections", value: allInspections.length },
          {
            label: "Next Inspection",
            value: nextInspectionDue
              ? new Date(nextInspectionDue).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Not scheduled",
          },
        ]}
      />

      {/* Main Content */}
      <Tabs defaultValue="tanks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tanks">Tanks ({tanks.length})</TabsTrigger>
          <TabsTrigger value="details">Site Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="tanks" className="space-y-6">
          {/* Alert for tanks needing attention */}
          {tanksNeedingAttention > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
              <CardContent className="flex items-center gap-3 py-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {tanksNeedingAttention} tank{tanksNeedingAttention !== 1 ? "s" : ""}{" "}
                  require attention due to Fair or Poor condition ratings.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tanks Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {tanks.map((tank) => {
              const conditionColor =
                tank.overall_condition === "Good"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : tank.overall_condition === "Fair"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"

              return (
                <a
                  key={tank.name}
                  href={`/sites/${id}/tanks/${tank.name}`}
                  className="bg-card hover:bg-muted/50 block rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                      <Droplets className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{tank.tank_name}</h3>
                          <p className="text-muted-foreground text-sm">
                            {tank.tank_type}
                          </p>
                        </div>
                        <Badge className={conditionColor}>
                          {tank.overall_condition}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Capacity</p>
                          <p>{tank.capacity_gallons?.toLocaleString()} gal</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Year Built</p>
                          <p>{tank.year_built || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Last Inspection</p>
                          <p>
                            {tank.last_inspection_date
                              ? new Date(tank.last_inspection_date).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Next Due</p>
                          <p>
                            {tank.next_inspection_due
                              ? new Date(tank.next_inspection_due).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              )
            })}

            {tanks.length === 0 && (
              <div className="text-muted-foreground col-span-full py-12 text-center">
                No tanks registered at this site. Add a tank to start tracking.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Site Info */}
            <div className="space-y-6 lg:col-span-2">
              <RecordEditor
                title="Site Information"
                data={{ ...site, customer: customer?.customer_name || site.customer }}
                fields={siteFields}
                onSave={handleSave}
              />

              {/* Map Placeholder */}
              {site.latitude && site.longitude && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
                      <div className="text-center">
                        <MapPin className="text-muted-foreground mx-auto h-8 w-8" />
                        <p className="text-muted-foreground mt-2 text-sm">
                          {site.latitude?.toFixed(4)}, {site.longitude?.toFixed(4)}
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${site.latitude},${site.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary mt-2 inline-block text-sm underline-offset-4 hover:underline"
                        >
                          View on Google Maps
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Related Records */}
            <div className="space-y-6">
              <RelatedRecordsCard
                title="Tanks"
                icon="tank"
                records={tankRecords}
                onAdd={() => console.log("Add tank")}
                addLabel="Add Tank"
                emptyMessage="No tanks registered"
              />

              <ActivityTimeline
                title="Recent Activity"
                activities={activities.slice(0, 8)}
                maxHeight={300}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ActivityTimeline
            title="Complete Site History"
            activities={activities}
            maxHeight={600}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
