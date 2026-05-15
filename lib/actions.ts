"use server"

import { revalidatePath } from "next/cache"
import { frappe } from "./frappe"
import type { Customer, Site, Tank, Proposal, Inspection, ServiceVisit } from "@/types/cunningham"

// ============================================================================
// Customer Actions
// ============================================================================

export async function getCustomers(filters?: Record<string, unknown>) {
  try {
    const response = await frappe.getList<Customer>("Customer", {
      fields: ["*"],
      filters,
      orderBy: "modified desc",
      limitPageLength: 100,
    })
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    return { data: [], error: "Failed to fetch customers" }
  }
}

export async function getCustomer(id: string) {
  try {
    const response = await frappe.getDoc<Customer>("Customer", id)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch customer:", error)
    return { data: null, error: "Customer not found" }
  }
}

export async function createCustomer(data: Partial<Customer>) {
  try {
    const response = await frappe.insert<Customer>("Customer", data)
    revalidatePath("/customers")
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to create customer:", error)
    return { data: null, error: "Failed to create customer" }
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  try {
    const response = await frappe.save<Customer>("Customer", { ...data, name: id })
    revalidatePath("/customers")
    revalidatePath(`/customers/${id}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to update customer:", error)
    return { data: null, error: "Failed to update customer" }
  }
}

export async function deleteCustomer(id: string) {
  try {
    await frappe.delete("Customer", id)
    revalidatePath("/customers")
    return { success: true, error: null }
  } catch (error) {
    console.error("Failed to delete customer:", error)
    return { success: false, error: "Failed to delete customer" }
  }
}

// ============================================================================
// Site Actions
// ============================================================================

export async function getSites(customerId?: string) {
  try {
    const filters = customerId ? { customer: customerId } : undefined
    const response = await frappe.getList<Site>("Site", {
      fields: ["*"],
      filters,
      orderBy: "modified desc",
      limitPageLength: 100,
    })
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch sites:", error)
    return { data: [], error: "Failed to fetch sites" }
  }
}

export async function getSite(id: string) {
  try {
    const response = await frappe.getDoc<Site>("Site", id)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch site:", error)
    return { data: null, error: "Site not found" }
  }
}

export async function createSite(data: Partial<Site>) {
  try {
    const response = await frappe.insert<Site>("Site", data)
    revalidatePath("/customers")
    revalidatePath(`/customers/${data.customer}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to create site:", error)
    return { data: null, error: "Failed to create site" }
  }
}

export async function updateSite(id: string, data: Partial<Site>) {
  try {
    const response = await frappe.save<Site>("Site", { ...data, name: id })
    revalidatePath(`/sites/${id}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to update site:", error)
    return { data: null, error: "Failed to update site" }
  }
}

// ============================================================================
// Tank Actions
// ============================================================================

export async function getTanks(siteId?: string) {
  try {
    const filters = siteId ? { site: siteId } : undefined
    const response = await frappe.getList<Tank>("Tank", {
      fields: ["*"],
      filters,
      orderBy: "tank_name asc",
      limitPageLength: 100,
    })
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch tanks:", error)
    return { data: [], error: "Failed to fetch tanks" }
  }
}

export async function getTank(id: string) {
  try {
    const response = await frappe.getDoc<Tank>("Tank", id)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch tank:", error)
    return { data: null, error: "Tank not found" }
  }
}

export async function createTank(data: Partial<Tank>) {
  try {
    const response = await frappe.insert<Tank>("Tank", data)
    revalidatePath(`/sites/${data.site}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to create tank:", error)
    return { data: null, error: "Failed to create tank" }
  }
}

export async function updateTank(id: string, siteId: string, data: Partial<Tank>) {
  try {
    const response = await frappe.save<Tank>("Tank", { ...data, name: id })
    revalidatePath(`/sites/${siteId}`)
    revalidatePath(`/sites/${siteId}/tanks/${id}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to update tank:", error)
    return { data: null, error: "Failed to update tank" }
  }
}

// ============================================================================
// Proposal Actions
// ============================================================================

export async function getProposals(customerId?: string, status?: string) {
  try {
    const filters: Record<string, unknown> = {}
    if (customerId) filters.customer = customerId
    if (status) filters.status = status
    
    const response = await frappe.getList<Proposal>("Proposal", {
      fields: ["*"],
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      orderBy: "modified desc",
      limitPageLength: 100,
    })
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch proposals:", error)
    return { data: [], error: "Failed to fetch proposals" }
  }
}

export async function getProposal(id: string) {
  try {
    const response = await frappe.getDoc<Proposal>("Proposal", id)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch proposal:", error)
    return { data: null, error: "Proposal not found" }
  }
}

export async function createProposal(data: Partial<Proposal>) {
  try {
    const response = await frappe.insert<Proposal>("Proposal", data)
    revalidatePath("/pipeline")
    revalidatePath(`/customers/${data.customer}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to create proposal:", error)
    return { data: null, error: "Failed to create proposal" }
  }
}

export async function updateProposal(id: string, data: Partial<Proposal>) {
  try {
    const response = await frappe.save<Proposal>("Proposal", { ...data, name: id })
    revalidatePath("/pipeline")
    revalidatePath(`/proposals/${id}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to update proposal:", error)
    return { data: null, error: "Failed to update proposal" }
  }
}

export async function updateProposalStatus(id: string, status: string) {
  try {
    const updateData: Partial<Proposal> = { status }
    
    if (status === "Won") {
      updateData.won_date = new Date().toISOString().split("T")[0]
    } else if (status === "Lost") {
      updateData.lost_date = new Date().toISOString().split("T")[0]
    }
    
    const response = await frappe.save<Proposal>("Proposal", { ...updateData, name: id })
    revalidatePath("/pipeline")
    revalidatePath(`/proposals/${id}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to update proposal status:", error)
    return { data: null, error: "Failed to update proposal status" }
  }
}

// ============================================================================
// Inspection Actions
// ============================================================================

export async function getInspections(tankId?: string, customerId?: string) {
  try {
    const filters: Record<string, unknown> = {}
    if (tankId) filters.tank = tankId
    if (customerId) filters.customer = customerId
    
    const response = await frappe.getList<Inspection>("Inspection", {
      fields: ["*"],
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      orderBy: "inspection_date desc",
      limitPageLength: 100,
    })
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch inspections:", error)
    return { data: [], error: "Failed to fetch inspections" }
  }
}

export async function getInspection(id: string) {
  try {
    const response = await frappe.getDoc<Inspection>("Inspection", id)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch inspection:", error)
    return { data: null, error: "Inspection not found" }
  }
}

export async function createInspection(data: Partial<Inspection>) {
  try {
    const response = await frappe.insert<Inspection>("Inspection", data)
    revalidatePath("/inspections")
    revalidatePath(`/sites/${data.site}/tanks/${data.tank}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to create inspection:", error)
    return { data: null, error: "Failed to create inspection" }
  }
}

export async function updateInspection(id: string, data: Partial<Inspection>) {
  try {
    const response = await frappe.save<Inspection>("Inspection", { ...data, name: id })
    revalidatePath("/inspections")
    revalidatePath(`/inspections/${id}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to update inspection:", error)
    return { data: null, error: "Failed to update inspection" }
  }
}

// ============================================================================
// Service Visit Actions
// ============================================================================

export async function getServiceVisits(tankId?: string) {
  try {
    const filters = tankId ? { tank: tankId } : undefined
    const response = await frappe.getList<ServiceVisit>("Service Visit", {
      fields: ["*"],
      filters,
      orderBy: "visit_date desc",
      limitPageLength: 100,
    })
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to fetch service visits:", error)
    return { data: [], error: "Failed to fetch service visits" }
  }
}

export async function createServiceVisit(data: Partial<ServiceVisit>) {
  try {
    const response = await frappe.insert<ServiceVisit>("Service Visit", data)
    revalidatePath("/service")
    revalidatePath(`/sites/${data.site}/tanks/${data.tank}`)
    return { data: response, error: null }
  } catch (error) {
    console.error("Failed to create service visit:", error)
    return { data: null, error: "Failed to create service visit" }
  }
}

// ============================================================================
// Dashboard / Aggregate Actions
// ============================================================================

export async function getDashboardStats() {
  try {
    // These would be custom Frappe whitelisted methods
    const [customers, proposals, inspections] = await Promise.all([
      frappe.getList<Customer>("Customer", { filters: { status: "Active" }, limitPageLength: 0 }),
      frappe.getList<Proposal>("Proposal", { filters: { status: ["in", ["Draft", "Submitted"]] }, limitPageLength: 0 }),
      frappe.getList<Inspection>("Inspection", { 
        filters: { 
          inspection_date: [">=", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]] 
        },
        limitPageLength: 0
      }),
    ])

    return {
      data: {
        activeCustomers: customers.length,
        openProposals: proposals.length,
        recentInspections: inspections.length,
        pipelineValue: proposals.reduce((sum, p) => sum + (p.proposal_value || 0), 0),
      },
      error: null,
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return {
      data: {
        activeCustomers: 0,
        openProposals: 0,
        recentInspections: 0,
        pipelineValue: 0,
      },
      error: "Failed to fetch dashboard stats",
    }
  }
}

export async function getTanksNeedingAttention() {
  try {
    const tanks = await frappe.getList<Tank>("Tank", {
      fields: ["*"],
      filters: {
        overall_condition: ["in", ["Fair", "Poor"]],
        status: "Active",
      },
      orderBy: "overall_condition asc, next_inspection_due asc",
      limitPageLength: 20,
    })
    return { data: tanks, error: null }
  } catch (error) {
    console.error("Failed to fetch tanks needing attention:", error)
    return { data: [], error: "Failed to fetch tanks" }
  }
}

export async function getUpcomingInspections(days: number = 30) {
  try {
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const tanks = await frappe.getList<Tank>("Tank", {
      fields: ["*"],
      filters: {
        next_inspection_due: ["<=", endDate],
        status: "Active",
      },
      orderBy: "next_inspection_due asc",
      limitPageLength: 20,
    })
    return { data: tanks, error: null }
  } catch (error) {
    console.error("Failed to fetch upcoming inspections:", error)
    return { data: [], error: "Failed to fetch upcoming inspections" }
  }
}
