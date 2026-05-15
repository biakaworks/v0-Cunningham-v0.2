"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RecordHeader,
  StatsRow,
  RecordEditor,
  ActivityTimeline,
  QuickActions,
  RelatedRecordsCard,
  inspectionToActivity,
  proposalToActivity,
  serviceVisitToActivity,
  mergeActivities,
} from "@/components/records"
import type { FieldConfig, RelatedRecord } from "@/components/records"
import {
  getCustomer,
  getSites,
  getProposals,
  getInspections,
  getServiceVisits,
  getCustomerStats,
  mockTanks,
} from "@/lib/mock-data"
import type { Customer } from "@/types/cunningham"
import {
  Phone,
  Mail,
  MapPin,
  ClipboardCheck,
  DollarSign,
  FileText,
} from "lucide-react"

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const customer = getCustomer(id)

  if (!customer) {
    notFound()
  }

  const sites = getSites(id)
  const proposals = getProposals(id)
  const inspections = getInspections(undefined, id)
  const stats = getCustomerStats(id)

  // Get all service visits for this customer's tanks
  const siteIds = sites.map((s) => s.name)
  const tanks = mockTanks.filter((t) => siteIds.includes(t.site!))
  const serviceVisits = tanks.flatMap((t) => getServiceVisits(t.name))

  // Build activity timeline
  const activities = mergeActivities(
    inspections.map(inspectionToActivity),
    proposals.map(proposalToActivity),
    serviceVisits.map(serviceVisitToActivity)
  )

  // Customer info fields
  const customerFields: FieldConfig[] = [
    { name: "customer_name", label: "Customer Name", type: "text", required: true, colSpan: 2 },
    {
      name: "customer_type",
      label: "Type",
      type: "select",
      options: [
        { value: "Municipality", label: "Municipality" },
        { value: "Water District", label: "Water District" },
        { value: "Water Authority", label: "Water Authority" },
        { value: "Private Utility", label: "Private Utility" },
        { value: "Industrial", label: "Industrial" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
    { name: "primary_contact", label: "Primary Contact", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "billing_address", label: "Billing Address", type: "textarea", colSpan: 2 },
    { name: "notes", label: "Notes", type: "textarea", colSpan: 2 },
  ]

  // Transform sites to related records
  const siteRecords: RelatedRecord[] = sites.map((site) => {
    const siteTanks = tanks.filter((t) => t.site === site.name)
    return {
      id: site.name!,
      title: site.site_name!,
      subtitle: `${site.city}, ${site.state}`,
      status: site.status,
      statusVariant: site.status === "Active" ? "default" : "secondary",
      href: `/sites/${site.name}`,
      metadata: [{ label: "Tanks", value: String(siteTanks.length) }],
    }
  })

  // Transform proposals to related records
  const proposalRecords: RelatedRecord[] = proposals.map((p) => ({
    id: p.name!,
    title: p.work_scope || "Proposal",
    subtitle: p.description,
    status: p.status,
    statusVariant:
      p.status === "Won"
        ? "default"
        : p.status === "Lost"
        ? "destructive"
        : "outline",
    href: `/proposals/${p.name}`,
    metadata: [
      {
        label: "Value",
        value: p.proposal_value?.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }) || "-",
      },
    ],
  }))

  const handleSave = async (data: Partial<Customer>) => {
    // TODO: Implement Frappe save
    console.log("Saving customer:", data)
  }

  const quickActions = [
    {
      id: "new-proposal",
      label: "New Proposal",
      icon: DollarSign,
      onClick: () => console.log("Create proposal"),
      variant: "default" as const,
    },
    {
      id: "schedule-inspection",
      label: "Schedule Inspection",
      icon: ClipboardCheck,
      onClick: () => console.log("Schedule inspection"),
    },
    {
      id: "call",
      label: "Call",
      icon: Phone,
      onClick: () => window.open(`tel:${customer.phone}`),
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      onClick: () => window.open(`mailto:${customer.email}`),
    },
    {
      id: "view-map",
      label: "View on Map",
      icon: MapPin,
      onClick: () => console.log("View on map"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <RecordHeader
        title={customer.customer_name!}
        subtitle={customer.customer_type}
        status={customer.status}
        statusVariant={customer.status === "Active" ? "default" : "secondary"}
        icon="customer"
        breadcrumbs={[
          { label: "Customers", href: "/customers" },
          { label: customer.customer_name! },
        ]}
        backHref="/customers"
      >
        <QuickActions actions={quickActions} maxVisible={3} />
      </RecordHeader>

      {/* Stats Row */}
      <StatsRow
        stats={[
          { label: "Sites", value: stats.siteCount },
          { label: "Tanks", value: stats.tankCount },
          { label: "Open Proposals", value: stats.openProposalCount },
          {
            label: "Pipeline Value",
            value: stats.totalProposalValue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }),
          },
        ]}
      />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sites">Sites ({sites.length})</TabsTrigger>
          <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Customer Info */}
            <div className="space-y-6 lg:col-span-2">
              <RecordEditor
                title="Customer Information"
                data={customer}
                fields={customerFields}
                onSave={handleSave}
              />
            </div>

            {/* Right Column - Activity & Related */}
            <div className="space-y-6">
              <RelatedRecordsCard
                title="Sites"
                icon="site"
                records={siteRecords}
                onAdd={() => console.log("Add site")}
                addLabel="Add Site"
                emptyMessage="No sites added yet"
              />

              <ActivityTimeline
                title="Recent Activity"
                activities={activities.slice(0, 10)}
                maxHeight={350}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sites" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => {
              const siteTanks = tanks.filter((t) => t.site === site.name)
              return (
                <a
                  key={site.name}
                  href={`/sites/${site.name}`}
                  className="bg-card hover:bg-muted/50 block rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{site.site_name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {site.city}, {site.state}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {siteTanks.length} tank{siteTanks.length !== 1 ? "s" : ""}
                    </span>
                    <span
                      className={`${
                        site.status === "Active"
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>
                </a>
              )
            })}
            {sites.length === 0 && (
              <div className="text-muted-foreground col-span-full py-12 text-center">
                No sites added yet. Add a site to track tanks and service history.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          <RelatedRecordsCard
            title="All Proposals"
            icon="proposal"
            records={proposalRecords}
            onAdd={() => console.log("Add proposal")}
            addLabel="New Proposal"
            emptyMessage="No proposals yet"
            maxHeight={500}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ActivityTimeline
            title="Complete History"
            activities={activities}
            maxHeight={600}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
