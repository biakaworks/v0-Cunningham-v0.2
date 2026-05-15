"use server"

import { revalidatePath } from "next/cache"

// Types for service actions
interface ScheduleServiceInput {
  tankId: string
  serviceType: string
  scheduledDate: string
  assignedTo?: string
  notes?: string
}

interface RecordServiceInput {
  tankId: string
  serviceType: string
  serviceDate: string
  performedBy: string
  findings?: string
  nextServiceDate?: string
  photos?: string[]
}

interface OutreachInput {
  customerIds: string[]
  templateType: "email" | "letter" | "phone_script"
  serviceType: string
  includeQuote: boolean
}

// Schedule a service visit
export async function scheduleService(input: ScheduleServiceInput) {
  try {
    // In production, this would call Frappe API
    // const result = await frappe.insert("Service Visit", {
    //   tank: input.tankId,
    //   service_type: input.serviceType,
    //   scheduled_date: input.scheduledDate,
    //   assigned_to: input.assignedTo,
    //   notes: input.notes,
    //   status: "Scheduled"
    // })

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    revalidatePath("/service")
    revalidatePath("/map")

    return {
      success: true,
      message: "Service scheduled successfully",
      data: {
        id: `SVC-${Date.now()}`,
        ...input,
        status: "Scheduled"
      }
    }
  } catch (error) {
    console.error("Failed to schedule service:", error)
    return {
      success: false,
      error: "Failed to schedule service. Please try again."
    }
  }
}

// Record a completed service
export async function recordService(input: RecordServiceInput) {
  try {
    // In production, this would call Frappe API
    // const result = await frappe.insert("Service Visit", {
    //   tank: input.tankId,
    //   service_type: input.serviceType,
    //   service_date: input.serviceDate,
    //   performed_by: input.performedBy,
    //   findings: input.findings,
    //   next_service_date: input.nextServiceDate,
    //   status: "Completed"
    // })

    await new Promise(resolve => setTimeout(resolve, 500))

    revalidatePath("/service")
    revalidatePath(`/sites/[id]/tanks/${input.tankId}`)

    return {
      success: true,
      message: "Service recorded successfully",
      data: {
        id: `SVC-${Date.now()}`,
        ...input,
        status: "Completed"
      }
    }
  } catch (error) {
    console.error("Failed to record service:", error)
    return {
      success: false,
      error: "Failed to record service. Please try again."
    }
  }
}

// Bulk schedule services
export async function bulkScheduleServices(
  items: { tankId: string; serviceType: string }[],
  scheduledDate: string,
  assignedTo?: string
) {
  try {
    const results = await Promise.all(
      items.map(item =>
        scheduleService({
          tankId: item.tankId,
          serviceType: item.serviceType,
          scheduledDate,
          assignedTo,
        })
      )
    )

    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    revalidatePath("/service")

    return {
      success: failCount === 0,
      message: `Scheduled ${successCount} services${failCount > 0 ? `, ${failCount} failed` : ""}`,
      results
    }
  } catch (error) {
    console.error("Failed to bulk schedule:", error)
    return {
      success: false,
      error: "Failed to schedule services. Please try again."
    }
  }
}

// Generate outreach materials
export async function generateOutreach(input: OutreachInput) {
  try {
    // In production, this would generate actual templates
    // possibly using AI or template engine
    await new Promise(resolve => setTimeout(resolve, 1000))

    const templates = input.customerIds.map(customerId => ({
      customerId,
      type: input.templateType,
      content: generateTemplateContent(input.templateType, input.serviceType, input.includeQuote),
      generatedAt: new Date().toISOString()
    }))

    return {
      success: true,
      message: `Generated ${templates.length} ${input.templateType} templates`,
      data: templates
    }
  } catch (error) {
    console.error("Failed to generate outreach:", error)
    return {
      success: false,
      error: "Failed to generate outreach materials."
    }
  }
}

function generateTemplateContent(
  type: "email" | "letter" | "phone_script",
  serviceType: string,
  includeQuote: boolean
): string {
  const serviceNames: Record<string, string> = {
    annual_inspection: "Annual Inspection",
    "5_year_interior": "5-Year Interior Inspection",
    washout: "Tank Washout",
    exterior_repaint: "Exterior Repainting",
    interior_recoat: "Interior Recoating",
    sanitary_survey: "Sanitary Survey"
  }

  const serviceName = serviceNames[serviceType] || serviceType

  if (type === "email") {
    return `Subject: ${serviceName} Due - Schedule Your Service

Dear [Customer Name],

Our records indicate that your water storage tank at [Site Address] is due for ${serviceName.toLowerCase()}.

Regular maintenance is essential to:
- Ensure water quality compliance
- Extend the life of your tank
- Prevent costly emergency repairs

${includeQuote ? "We've attached a quote for your review. " : ""}We'd be happy to schedule this service at your earliest convenience.

Please contact us at (555) 123-4567 or reply to this email to arrange a suitable time.

Best regards,
Cunningham Tanks & Towers`
  }

  if (type === "letter") {
    return `[Date]

[Customer Name]
[Customer Address]

RE: ${serviceName} - [Tank Location]

Dear [Customer Name],

This letter is to inform you that based on our service records, your water storage facility at [Site Address] is due for scheduled ${serviceName.toLowerCase()}.

${includeQuote ? "Please find enclosed our service proposal for your review.\n\n" : ""}To schedule this important maintenance, please contact our office at your earliest convenience.

Sincerely,

Cunningham Tanks & Towers
(555) 123-4567`
  }

  // Phone script
  return `PHONE SCRIPT - ${serviceName}

Greeting: "Good [morning/afternoon], this is [Your Name] calling from Cunningham Tanks & Towers. May I speak with the person responsible for water tank maintenance?"

Purpose: "I'm calling because our records show your tank at [Site Address] is coming due for ${serviceName.toLowerCase()}."

Key Points:
- Service is recommended every [X years] per industry standards
- Last service was performed on [Last Service Date]
- We have availability in [upcoming weeks/months]

${includeQuote ? "Quote: \"Based on our previous work, the estimated cost would be approximately $[Amount].\"" : ""}

Close: "Would you like me to schedule a site visit to provide a detailed assessment?"`
}

// Update service schedule
export async function updateServiceSchedule(
  serviceId: string,
  updates: Partial<{
    scheduledDate: string
    assignedTo: string
    status: string
    notes: string
  }>
) {
  try {
    // In production, this would call Frappe API
    await new Promise(resolve => setTimeout(resolve, 500))

    revalidatePath("/service")

    return {
      success: true,
      message: "Service schedule updated",
      data: { id: serviceId, ...updates }
    }
  } catch (error) {
    console.error("Failed to update service:", error)
    return {
      success: false,
      error: "Failed to update service schedule."
    }
  }
}

// Cancel scheduled service
export async function cancelService(serviceId: string, reason: string) {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    revalidatePath("/service")

    return {
      success: true,
      message: "Service cancelled",
      data: { id: serviceId, status: "Cancelled", cancellationReason: reason }
    }
  } catch (error) {
    console.error("Failed to cancel service:", error)
    return {
      success: false,
      error: "Failed to cancel service."
    }
  }
}
