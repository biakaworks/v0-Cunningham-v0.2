"use server"

import { revalidatePath } from "next/cache"
import { frappe } from "@/lib/frappe"
import type { Proposal, ProposalStatus, ProposalType } from "@/types/cunningham"
import { mockPipelineProposals } from "@/lib/mock-pipeline"

// For now, use mock data. Replace with frappe calls when backend is ready.
const USE_MOCK = true

interface CreateProposalInput {
  customer: string
  site?: string
  tank?: string
  proposal_type: ProposalType
  title: string
  scope_of_work?: string
  valid_until?: string
}

interface UpdateProposalInput {
  title?: string
  scope_of_work?: string
  total?: number
  valid_until?: string
  next_follow_up_date?: string
  follow_up_notes?: string
  bid_due_date?: string
  bid_opening_date?: string
  engineer_of_record?: string
  bonding_required?: 0 | 1
  bond_amount?: number
  prevailing_wage?: 0 | 1
}

interface UpdateStatusMetadata {
  lost_reason?: string
  lost_date?: string
  competitor?: string
  won_date?: string
  revisit_date?: string
}

export async function createProposal(input: CreateProposalInput) {
  try {
    if (USE_MOCK) {
      // Generate mock proposal
      const proposalNumber = `PROP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`
      const newProposal = {
        name: proposalNumber,
        proposal_number: proposalNumber,
        ...input,
        status: "Draft" as ProposalStatus,
        creation: new Date().toISOString(),
        modified: new Date().toISOString(),
        docstatus: 0 as const,
        modified_by: "USER-001",
        owner: "USER-001",
        bonding_required: 0 as const,
        prevailing_wage: 0 as const,
      }
      
      revalidatePath("/pipeline")
      return { success: true, data: newProposal }
    }

    const doc = await frappe.insert<Proposal>("Proposal", {
      ...input,
      status: "Draft",
    })

    revalidatePath("/pipeline")
    return { success: true, data: doc }
  } catch (error) {
    console.error("Failed to create proposal:", error)
    return { success: false, error: "Failed to create proposal" }
  }
}

export async function updateProposal(name: string, input: UpdateProposalInput) {
  try {
    if (USE_MOCK) {
      // Find and update mock proposal
      const index = mockPipelineProposals.findIndex((p) => p.name === name)
      if (index !== -1) {
        Object.assign(mockPipelineProposals[index], input, {
          modified: new Date().toISOString(),
        })
      }
      revalidatePath("/pipeline")
      revalidatePath(`/proposals/${name}`)
      return { success: true }
    }

    await frappe.save<Proposal>("Proposal", name, input)
    revalidatePath("/pipeline")
    revalidatePath(`/proposals/${name}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update proposal:", error)
    return { success: false, error: "Failed to update proposal" }
  }
}

export async function updateProposalStatus(
  name: string,
  status: ProposalStatus,
  metadata?: UpdateStatusMetadata
) {
  try {
    const updateData: Record<string, unknown> = { status }

    // Handle special status transitions
    if (status === "Lost") {
      if (!metadata?.lost_reason) {
        return { success: false, error: "Loss reason is required" }
      }
      updateData.lost_reason = metadata.lost_reason
      updateData.lost_date = metadata.lost_date || new Date().toISOString().split("T")[0]
      if (metadata.competitor) {
        updateData.competitor = metadata.competitor
      }
    }

    if (status === "Won") {
      updateData.won_date = metadata?.won_date || new Date().toISOString().split("T")[0]
      // TODO: Trigger project creation when Stage 6 is built
      // For now, just update the status
    }

    if (status === "Dormant") {
      if (!metadata?.revisit_date) {
        return { success: false, error: "Revisit date is required" }
      }
      updateData.notes = `Revisit on ${metadata.revisit_date}`
    }

    if (USE_MOCK) {
      const index = mockPipelineProposals.findIndex((p) => p.name === name)
      if (index !== -1) {
        Object.assign(mockPipelineProposals[index], updateData, {
          modified: new Date().toISOString(),
        })
      }
      revalidatePath("/pipeline")
      revalidatePath(`/proposals/${name}`)
      
      // Return toast message for Won status
      if (status === "Won") {
        return { 
          success: true, 
          message: "Proposal marked as Won. Project will be created." 
        }
      }
      return { success: true }
    }

    await frappe.save<Proposal>("Proposal", name, updateData)
    revalidatePath("/pipeline")
    revalidatePath(`/proposals/${name}`)

    if (status === "Won") {
      return { 
        success: true, 
        message: "Proposal marked as Won. Project will be created." 
      }
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to update proposal status:", error)
    return { success: false, error: "Failed to update status" }
  }
}

export async function reviveDormantProposal(name: string) {
  try {
    if (USE_MOCK) {
      // Find the dormant proposal
      const original = mockPipelineProposals.find((p) => p.name === name)
      if (!original) {
        return { success: false, error: "Proposal not found" }
      }
      if (original.status !== "Dormant") {
        return { success: false, error: "Only dormant proposals can be revived" }
      }

      // Create a new linked proposal
      const newNumber = `PROP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`
      const revivedProposal = {
        ...original,
        name: newNumber,
        proposal_number: newNumber,
        status: "Draft" as ProposalStatus,
        title: `${original.title} (Revised)`,
        is_revived: true,
        original_proposal: name,
        sent_date: undefined,
        won_date: undefined,
        lost_date: undefined,
        lost_reason: undefined,
        age_days: 0,
        is_stale: false,
        creation: new Date().toISOString(),
        modified: new Date().toISOString(),
      }

      // Link original to revived
      original.revived_to = newNumber

      // Add to mock data (in real app, this would be persisted)
      mockPipelineProposals.push(revivedProposal as any)

      revalidatePath("/pipeline")
      revalidatePath(`/proposals/${name}`)
      
      return { success: true, data: revivedProposal }
    }

    // Frappe implementation would go here
    // 1. Get original proposal
    // 2. Create new proposal with link to original
    // 3. Update original with link to new proposal

    return { success: false, error: "Not implemented" }
  } catch (error) {
    console.error("Failed to revive proposal:", error)
    return { success: false, error: "Failed to revive proposal" }
  }
}

export async function addFollowUpNote(name: string, note: string) {
  try {
    if (USE_MOCK) {
      const proposal = mockPipelineProposals.find((p) => p.name === name)
      if (proposal) {
        proposal.follow_up_notes = note
        proposal.last_follow_up_date = new Date().toISOString().split("T")[0]
        proposal.modified = new Date().toISOString()
      }
      revalidatePath(`/proposals/${name}`)
      return { success: true }
    }

    await frappe.save<Proposal>("Proposal", name, {
      follow_up_notes: note,
      last_follow_up_date: new Date().toISOString().split("T")[0],
    })
    revalidatePath(`/proposals/${name}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to add follow-up note:", error)
    return { success: false, error: "Failed to add follow-up note" }
  }
}
