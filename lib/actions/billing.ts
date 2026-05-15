"use server"

import { revalidatePath } from "next/cache"
import { frappe } from "@/lib/frappe"
import type { MilestoneStatus, BillingMilestone } from "@/types/project"
import { mockProjects } from "@/lib/mock-project-data"

const USE_MOCK = true

// =============================================================================
// Milestone Status Management
// =============================================================================

export async function updateMilestoneStatus(
  milestoneId: string,
  newStatus: MilestoneStatus,
  notes?: string
) {
  try {
    if (USE_MOCK) {
      // Find milestone across all projects
      for (const project of mockProjects) {
        const milestoneIdx = project.billing_milestones.findIndex(m => m.id === milestoneId)
        if (milestoneIdx !== -1) {
          const oldStatus = project.billing_milestones[milestoneIdx].status
          project.billing_milestones[milestoneIdx].status = newStatus
          
          if (notes) {
            project.billing_milestones[milestoneIdx].notes = notes
          }
          
          // Add to status history
          if (!project.billing_milestones[milestoneIdx].status_history) {
            project.billing_milestones[milestoneIdx].status_history = []
          }
          project.billing_milestones[milestoneIdx].status_history!.push({
            from_status: oldStatus,
            to_status: newStatus,
            changed_by: "USER-001",
            changed_at: new Date().toISOString(),
            notes,
          })
          
          project.modified = new Date().toISOString()
          
          revalidatePath(`/projects/${project.name}`)
          revalidatePath("/billing")
          return { success: true }
        }
      }
      
      return { success: false, error: "Milestone not found" }
    }
    
    await frappe.save<BillingMilestone>("Billing Milestone", milestoneId, {
      status: newStatus,
      notes,
    })
    
    revalidatePath("/billing")
    return { success: true }
  } catch (error) {
    console.error("Failed to update milestone status:", error)
    return { success: false, error: "Failed to update status" }
  }
}

// =============================================================================
// Reconciliation Notes
// =============================================================================

interface ReconciliationNote {
  note: string
  added_by: string
  added_at: string
}

export async function addReconciliationNote(milestoneId: string, note: string) {
  try {
    if (USE_MOCK) {
      // Find milestone across all projects
      for (const project of mockProjects) {
        const milestoneIdx = project.billing_milestones.findIndex(m => m.id === milestoneId)
        if (milestoneIdx !== -1) {
          // Append note to existing notes
          const existingNotes = project.billing_milestones[milestoneIdx].notes || ""
          const timestamp = new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
          const newNote = `[${timestamp}] ${note}`
          
          project.billing_milestones[milestoneIdx].notes = existingNotes
            ? `${existingNotes}\n${newNote}`
            : newNote
          
          project.modified = new Date().toISOString()
          
          revalidatePath(`/projects/${project.name}`)
          revalidatePath("/billing")
          return { success: true }
        }
      }
      
      return { success: false, error: "Milestone not found" }
    }
    
    await frappe.call("cunningham.api.add_reconciliation_note", {
      milestone_id: milestoneId,
      note,
    })
    
    revalidatePath("/billing")
    return { success: true }
  } catch (error) {
    console.error("Failed to add reconciliation note:", error)
    return { success: false, error: "Failed to add note" }
  }
}

// =============================================================================
// QuickBooks Sync
// =============================================================================

interface QuickBooksInvoiceData {
  invoice_number: string
  invoice_status: string
  payment_status: string
  amount_due: number
  amount_paid: number
}

export async function refreshQuickBooksSync(milestoneId: string) {
  try {
    if (USE_MOCK) {
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Find milestone across all projects
      for (const project of mockProjects) {
        const milestoneIdx = project.billing_milestones.findIndex(m => m.id === milestoneId)
        if (milestoneIdx !== -1) {
          // Update sync timestamp
          project.billing_milestones[milestoneIdx].qb_last_sync = new Date().toISOString()
          
          // If there's an invoice reference, simulate fetching data
          if (project.billing_milestones[milestoneIdx].invoice_reference) {
            // In a real implementation, this would fetch from QuickBooks API
            // For mock, just update the timestamp
          }
          
          project.modified = new Date().toISOString()
          
          revalidatePath(`/projects/${project.name}`)
          revalidatePath("/billing")
          return { 
            success: true, 
            message: "QuickBooks data refreshed",
            last_sync: project.billing_milestones[milestoneIdx].qb_last_sync,
          }
        }
      }
      
      return { success: false, error: "Milestone not found" }
    }
    
    // Call Frappe method to re-fetch QuickBooks invoice state
    const result = await frappe.call<QuickBooksInvoiceData>(
      "cunningham.integrations.quickbooks.refresh_invoice_sync",
      { milestone_id: milestoneId }
    )
    
    revalidatePath("/billing")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to refresh QuickBooks sync:", error)
    return { success: false, error: "Failed to sync with QuickBooks" }
  }
}

// =============================================================================
// Bulk Operations
// =============================================================================

export async function bulkUpdateMilestoneStatus(
  milestoneIds: string[],
  newStatus: MilestoneStatus
) {
  try {
    const results = await Promise.all(
      milestoneIds.map(id => updateMilestoneStatus(id, newStatus))
    )
    
    const failures = results.filter(r => !r.success)
    if (failures.length > 0) {
      return {
        success: false,
        error: `${failures.length} of ${milestoneIds.length} updates failed`,
      }
    }
    
    revalidatePath("/billing")
    return { success: true, message: `${milestoneIds.length} milestones updated` }
  } catch (error) {
    console.error("Failed to bulk update milestones:", error)
    return { success: false, error: "Failed to update milestones" }
  }
}

// =============================================================================
// Billing Reports
// =============================================================================

interface BillingReportFilters {
  status?: MilestoneStatus[]
  customer?: string
  project?: string
  date_from?: string
  date_to?: string
}

export async function generateBillingReport(filters: BillingReportFilters) {
  try {
    if (USE_MOCK) {
      // Filter milestones based on criteria
      const allMilestones: (BillingMilestone & { project_name: string; customer_name: string })[] = []
      
      for (const project of mockProjects) {
        if (filters.customer && project.customer !== filters.customer) continue
        if (filters.project && project.name !== filters.project) continue
        
        for (const milestone of project.billing_milestones) {
          if (filters.status && !filters.status.includes(milestone.status)) continue
          
          if (filters.date_from && milestone.due_date && milestone.due_date < filters.date_from) continue
          if (filters.date_to && milestone.due_date && milestone.due_date > filters.date_to) continue
          
          allMilestones.push({
            ...milestone,
            project_name: project.project_name,
            customer_name: project.customer_name || "",
          })
        }
      }
      
      // Calculate totals
      const totalAmount = allMilestones.reduce((sum, m) => sum + m.amount, 0)
      const byStatus = allMilestones.reduce((acc, m) => {
        if (!acc[m.status]) acc[m.status] = { count: 0, amount: 0 }
        acc[m.status].count++
        acc[m.status].amount += m.amount
        return acc
      }, {} as Record<string, { count: number; amount: number }>)
      
      return {
        success: true,
        data: {
          milestones: allMilestones,
          total_count: allMilestones.length,
          total_amount: totalAmount,
          by_status: byStatus,
        },
      }
    }
    
    const result = await frappe.call(
      "cunningham.reports.billing_report",
      { filters }
    )
    
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to generate billing report:", error)
    return { success: false, error: "Failed to generate report" }
  }
}
