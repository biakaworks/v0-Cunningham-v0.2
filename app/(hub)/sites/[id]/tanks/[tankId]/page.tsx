"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  RecordHeader,
  StatsRow,
  RecordEditor,
  ActivityTimeline,
  QuickActions,
  DataTable,
  DateCell,
  StatusBadge,
  inspectionToActivity,
  serviceVisitToActivity,
  mergeActivities,
} from "@/components/records"
import type { FieldConfig, Column } from "@/components/records"
import {
  getTank,
  getSite,
  getCustomer,
  getInspections,
  getServiceVisits,
  getProposals,
} from "@/lib/mock-data"
import type { Tank, Inspection, ServiceVisit } from "@/types/cunningham"
import {
  ClipboardCheck,
  Wrench,
  Camera,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from "lucide-react"

export default function TankDetailPage({
  params,
}: {
  params: Promise<{ id: string; tankId: string }>
}) {
  const { id, tankId } = use(params)
  const tank = getTank(tankId)

  if (!tank) {
    notFound()
  }

  const site = getSite(tank.site!)
  const customer = site ? getCustomer(site.customer!) : null
  const inspections = getInspections(tankId)
  const serviceVisits = getServiceVisits(tankId)
  const proposals = getProposals().filter((p) => p.tank === tankId)

  // Build activity timeline
  const activities = mergeActivities(
    inspections.map(inspectionToActivity),
    serviceVisits.map(serviceVisitToActivity)
  )

  // Tank specification fields
  const specFields: FieldConfig[] = [
    { name: "tank_name", label: "Tank Name", type: "text", required: true, colSpan: 2 },
    {
      name: "tank_type",
      label: "Tank Type",
      type: "select",
      options: [
        { value: "Elevated - Leg", label: "Elevated - Leg" },
        { value: "Elevated - Pedestal", label: "Elevated - Pedestal" },
        { value: "Elevated - Spheroid", label: "Elevated - Spheroid" },
        { value: "Elevated - Composite", label: "Elevated - Composite" },
        { value: "Ground - Welded", label: "Ground - Welded" },
        { value: "Ground - Bolted", label: "Ground - Bolted" },
        { value: "Standpipe", label: "Standpipe" },
        { value: "Reservoir", label: "Reservoir" },
        { value: "Clearwell", label: "Clearwell" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "Active", label: "Active" },
        { value: "Out of Service", label: "Out of Service" },
        { value: "Decommissioned", label: "Decommissioned" },
      ],
    },
    { name: "capacity_gallons", label: "Capacity (Gallons)", type: "number" },
    { name: "year_built", label: "Year Built", type: "number" },
    { name: "diameter_feet", label: "Diameter (Feet)", type: "number" },
    { name: "height_feet", label: "Height (Feet)", type: "number" },
    { name: "material", label: "Material", type: "text" },
    { name: "coating_type", label: "Coating Type", type: "text", colSpan: 2 },
    { name: "last_coating_date", label: "Last Coating Date", type: "date" },
    { name: "last_inspection_date", label: "Last Inspection", type: "readonly" },
    { name: "next_inspection_due", label: "Next Inspection Due", type: "date" },
    { name: "notes", label: "Notes", type: "textarea", colSpan: 2 },
  ]

  // Condition fields
  const conditionFields: FieldConfig[] = [
    {
      name: "overall_condition",
      label: "Overall Condition",
      type: "select",
      options: [
        { value: "Good", label: "Good" },
        { value: "Fair", label: "Fair" },
        { value: "Poor", label: "Poor" },
      ],
    },
    {
      name: "interior_condition",
      label: "Interior Condition",
      type: "select",
      options: [
        { value: "Good", label: "Good" },
        { value: "Fair", label: "Fair" },
        { value: "Poor", label: "Poor" },
      ],
    },
    {
      name: "exterior_condition",
      label: "Exterior Condition",
      type: "select",
      options: [
        { value: "Good", label: "Good" },
        { value: "Fair", label: "Fair" },
        { value: "Poor", label: "Poor" },
      ],
    },
    {
      name: "foundation_condition",
      label: "Foundation Condition",
      type: "select",
      options: [
        { value: "Good", label: "Good" },
        { value: "Fair", label: "Fair" },
        { value: "Poor", label: "Poor" },
      ],
    },
  ]

  // Inspection table columns
  const inspectionColumns: Column<Inspection>[] = [
    {
      key: "inspection_date",
      header: "Date",
      sortable: true,
      render: (value) => <DateCell value={value as string} />,
    },
    {
      key: "inspection_type",
      header: "Type",
      sortable: true,
      render: (value) => <Badge variant="outline">{value as string}</Badge>,
    },
    {
      key: "inspector",
      header: "Inspector",
      sortable: true,
    },
    {
      key: "overall_condition",
      header: "Condition",
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={value as string}
          variant={
            value === "Good"
              ? "default"
              : value === "Fair"
              ? "secondary"
              : "destructive"
          }
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => <Badge variant="outline">{value as string}</Badge>,
    },
  ]

  // Service visit table columns
  const serviceColumns: Column<ServiceVisit>[] = [
    {
      key: "visit_date",
      header: "Date",
      sortable: true,
      render: (value) => <DateCell value={value as string} />,
    },
    {
      key: "visit_type",
      header: "Type",
      sortable: true,
      render: (value) => <Badge variant="outline">{value as string}</Badge>,
    },
    {
      key: "technician",
      header: "Technician",
      sortable: true,
    },
    {
      key: "work_performed",
      header: "Work Performed",
      className: "max-w-xs truncate",
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => <Badge variant="outline">{value as string}</Badge>,
    },
  ]

  // Calculate days until next inspection
  const daysUntilInspection = tank.next_inspection_due
    ? Math.ceil(
        (new Date(tank.next_inspection_due).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  // Calculate coating age
  const coatingAge = tank.last_coating_date
    ? Math.floor(
        (new Date().getTime() - new Date(tank.last_coating_date).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
      )
    : null

  const handleSave = async (data: Partial<Tank>) => {
    // TODO: Implement Frappe save
    console.log("Saving tank:", data)
  }

  const quickActions = [
    {
      id: "start-inspection",
      label: "Start Inspection",
      icon: ClipboardCheck,
      onClick: () => console.log("Start inspection"),
      variant: "default" as const,
    },
    {
      id: "log-service",
      label: "Log Service",
      icon: Wrench,
      onClick: () => console.log("Log service"),
    },
    {
      id: "upload-photos",
      label: "Upload Photos",
      icon: Camera,
      onClick: () => console.log("Upload photos"),
    },
    {
      id: "create-proposal",
      label: "Create Proposal",
      icon: DollarSign,
      onClick: () => console.log("Create proposal"),
    },
  ]

  // Condition score calculation (for visual)
  const conditionScore = {
    Good: 100,
    Fair: 60,
    Poor: 20,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <RecordHeader
        title={tank.tank_name!}
        subtitle={`${tank.tank_type} - ${tank.capacity_gallons?.toLocaleString()} gallons`}
        status={tank.overall_condition}
        statusVariant={
          tank.overall_condition === "Good"
            ? "default"
            : tank.overall_condition === "Fair"
            ? "secondary"
            : "destructive"
        }
        icon="tank"
        breadcrumbs={[
          { label: "Customers", href: "/customers" },
          { label: customer?.customer_name || "Unknown", href: `/customers/${site?.customer}` },
          { label: site?.site_name || "Unknown Site", href: `/sites/${id}` },
          { label: tank.tank_name! },
        ]}
        backHref={`/sites/${id}`}
      >
        <QuickActions actions={quickActions} maxVisible={3} />
      </RecordHeader>

      {/* Stats Row */}
      <StatsRow
        stats={[
          {
            label: "Year Built",
            value: tank.year_built || "-",
            subValue: tank.year_built ? `${new Date().getFullYear() - tank.year_built} years old` : undefined,
          },
          {
            label: "Next Inspection",
            value:
              daysUntilInspection !== null
                ? daysUntilInspection > 0
                  ? `${daysUntilInspection} days`
                  : "Overdue"
                : "Not scheduled",
            subValue: tank.next_inspection_due || undefined,
          },
          {
            label: "Coating Age",
            value: coatingAge !== null ? `${coatingAge} years` : "-",
            subValue: tank.last_coating_date || undefined,
          },
          {
            label: "Inspections",
            value: inspections.length,
            subValue: `${serviceVisits.length} service visits`,
          },
        ]}
      />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inspections">Inspections ({inspections.length})</TabsTrigger>
          <TabsTrigger value="service">Service ({serviceVisits.length})</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Condition Summary */}
            <div className="space-y-6 lg:col-span-2">
              {/* Condition Alert */}
              {tank.overall_condition !== "Good" && (
                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
                  <CardContent className="flex items-start gap-3 py-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        This tank requires attention
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Overall condition rated as {tank.overall_condition}. Review inspection
                        history and recommendations below.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Condition Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Condition Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(["overall", "interior", "exterior", "foundation"] as const).map((area) => {
                    const key = `${area}_condition` as keyof Tank
                    const value = tank[key] as string
                    const score = conditionScore[value as keyof typeof conditionScore] || 0

                    return (
                      <div key={area} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize">{area}</span>
                          <Badge
                            variant={
                              value === "Good"
                                ? "default"
                                : value === "Fair"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {value}
                          </Badge>
                        </div>
                        <Progress
                          value={score}
                          className={`h-2 ${
                            value === "Good"
                              ? "[&>div]:bg-green-500"
                              : value === "Fair"
                              ? "[&>div]:bg-yellow-500"
                              : "[&>div]:bg-red-500"
                          }`}
                        />
                      </div>
                    )
                  })}

                  {/* Last inspection info */}
                  {inspections.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-muted-foreground text-sm">
                        Last inspected on{" "}
                        {new Date(inspections[0].inspection_date!).toLocaleDateString()} by{" "}
                        {inspections[0].inspector}
                      </p>
                      {inspections[0].recommendations && (
                        <p className="mt-2 text-sm">
                          <span className="font-medium">Recommendations: </span>
                          {inspections[0].recommendations}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex h-10 w-10 items-center justify-center rounded-lg">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Inspections</p>
                        <p className="text-2xl font-semibold">{inspections.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 flex h-10 w-10 items-center justify-center rounded-lg">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Service Visits</p>
                        <p className="text-2xl font-semibold">{serviceVisits.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex h-10 w-10 items-center justify-center rounded-lg">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Proposals</p>
                        <p className="text-2xl font-semibold">{proposals.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="space-y-6">
              <ActivityTimeline
                title="Recent Activity"
                activities={activities.slice(0, 10)}
                maxHeight={450}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          <DataTable
            columns={inspectionColumns}
            data={inspections}
            searchPlaceholder="Search inspections..."
            emptyMessage="No inspections recorded for this tank."
            onRowClick={(row) => console.log("View inspection", row.name)}
            rowActions={[
              {
                label: "View Details",
                onClick: (row) => console.log("View inspection", row.name),
              },
              {
                label: "Download Report",
                onClick: (row) => console.log("Download report", row.name),
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <DataTable
            columns={serviceColumns}
            data={serviceVisits}
            searchPlaceholder="Search service visits..."
            emptyMessage="No service visits recorded for this tank."
            onRowClick={(row) => console.log("View service visit", row.name)}
          />
        </TabsContent>

        <TabsContent value="specs" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <RecordEditor
              title="Tank Specifications"
              data={tank}
              fields={specFields}
              onSave={handleSave}
            />

            <RecordEditor
              title="Condition Ratings"
              data={tank}
              fields={conditionFields}
              onSave={handleSave}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
