"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { frappe } from "@/lib/frappe"
import type {
  ProjectFull,
  ProjectStatus,
  SetupChecklistItem,
  ProjectMaterial,
  ProjectEquipment,
  ProjectDailyLog,
  MaterialException,
  ExceptionType,
  CloseoutChecklistItem,
} from "@/types/project"
import { mockProjects, getProjectById } from "@/lib/mock-project-data"
import { mockPipelineProposals } from "@/lib/mock-pipeline"

const USE_MOCK = true

// =============================================================================
// Project CRUD
// =============================================================================

interface CreateProjectInput {
  project_name: string
  customer: string
  site: string
  tank?: string
  contract_value: number
  owner?: string
  start_date?: string
  projected_end_date?: string
}

export async function createProject(input: CreateProjectInput) {
  try {
    if (USE_MOCK) {
      const projectNumber = `PROJ-${new Date().getFullYear()}-${String(mockProjects.length + 1).padStart(3, "0")}`
      
      // Create new project with default checklists
      const newProject: ProjectFull = {
        name: projectNumber,
        project_number: projectNumber,
        project_name: input.project_name,
        customer: input.customer,
        customer_name: input.customer, // Would be looked up
        site: input.site,
        site_name: input.site, // Would be looked up
        tank: input.tank,
        contract_value: input.contract_value,
        owner: input.owner,
        status: "Setup",
        percent_complete: 0,
        start_date: input.start_date,
        projected_end_date: input.projected_end_date,
        creation: new Date().toISOString(),
        modified: new Date().toISOString(),
        modified_by: "USER-001",
        docstatus: 1,
        setup_checklist: [
          { id: `SC-${Date.now()}-1`, name: "Contract signed", status: "Not Started" },
          { id: `SC-${Date.now()}-2`, name: "Job sheet created", status: "Not Started" },
          { id: `SC-${Date.now()}-3`, name: "Materials list finalized", status: "Not Started" },
          { id: `SC-${Date.now()}-4`, name: "Paint specified", status: "Not Started" },
          { id: `SC-${Date.now()}-5`, name: "Equipment booked", status: "Not Started" },
          { id: `SC-${Date.now()}-6`, name: "Dumpsters arranged", status: "Not Started" },
          { id: `SC-${Date.now()}-7`, name: "Containment planned", status: "Not Started" },
          { id: `SC-${Date.now()}-8`, name: "Crew assigned", status: "Not Started" },
          { id: `SC-${Date.now()}-9`, name: "Schedule confirmed", status: "Not Started" },
          { id: `SC-${Date.now()}-10`, name: "Safety plan completed", status: "Not Started" },
          { id: `SC-${Date.now()}-11`, name: "Billing milestones defined", status: "Not Started" },
        ],
        materials: [],
        equipment: [],
        daily_logs: [],
        material_exceptions: [],
        billing_milestones: [],
        closeout_checklist: [
          { id: `CO-${Date.now()}-1`, name: "Completion form signed", is_required: true, status: "Required" },
          { id: `CO-${Date.now()}-2`, name: "Final photos uploaded", is_required: true, status: "Required" },
          { id: `CO-${Date.now()}-3`, name: "Customer signoff received", is_required: true, status: "Required" },
          { id: `CO-${Date.now()}-4`, name: "Final notes documented", is_required: false, status: "Required" },
          { id: `CO-${Date.now()}-5`, name: "Billing trigger fired", is_required: true, status: "Required" },
          { id: `CO-${Date.now()}-6`, name: "Document package archived", is_required: false, status: "Required" },
        ],
      }
      
      mockProjects.push(newProject)
      revalidatePath("/projects")
      
      return { success: true, data: newProject }
    }
    
    const doc = await frappe.insert<ProjectFull>("Project", input)
    revalidatePath("/projects")
    return { success: true, data: doc }
  } catch (error) {
    console.error("Failed to create project:", error)
    return { success: false, error: "Failed to create project" }
  }
}

// =============================================================================
// Convert Proposal to Project
// =============================================================================

export async function convertProposalToProject(proposalName: string) {
  try {
    if (USE_MOCK) {
      const proposal = mockPipelineProposals.find(p => p.name === proposalName)
      if (!proposal) {
        return { success: false, error: "Proposal not found" }
      }
      
      // Generate project number
      const projectNumber = `PROJ-${new Date().getFullYear()}-${String(mockProjects.length + 1).padStart(3, "0")}`
      
      // Create project from proposal
      const newProject: ProjectFull = {
        name: projectNumber,
        project_number: projectNumber,
        project_name: `${proposal.customer_name} - ${proposal.title || "New Project"}`,
        customer: proposal.customer,
        customer_name: proposal.customer_name,
        site: proposal.site || "",
        site_name: proposal.site_name || "",
        tank: proposal.tank,
        tank_name: proposal.tank_name,
        contract_value: proposal.total || 0,
        owner: proposal.prepared_by,
        status: "Setup",
        percent_complete: 0,
        source_proposal: proposalName,
        source_proposal_number: proposal.proposal_number,
        creation: new Date().toISOString(),
        modified: new Date().toISOString(),
        modified_by: "USER-001",
        docstatus: 1,
        // Generate setup checklist from proposal scope
        setup_checklist: [
          { id: `SC-${Date.now()}-1`, name: "Contract signed", status: "Not Started" },
          { id: `SC-${Date.now()}-2`, name: "Job sheet created", status: "Not Started" },
          { id: `SC-${Date.now()}-3`, name: "Materials list finalized", status: "Not Started" },
          { id: `SC-${Date.now()}-4`, name: "Paint specified", status: "Not Started" },
          { id: `SC-${Date.now()}-5`, name: "Equipment booked", status: "Not Started" },
          { id: `SC-${Date.now()}-6`, name: "Dumpsters arranged", status: "Not Started" },
          { id: `SC-${Date.now()}-7`, name: "Containment planned", status: "Not Started" },
          { id: `SC-${Date.now()}-8`, name: "Crew assigned", status: "Not Started" },
          { id: `SC-${Date.now()}-9`, name: "Schedule confirmed", status: "Not Started" },
          { id: `SC-${Date.now()}-10`, name: "Safety plan completed", status: "Not Started" },
          { id: `SC-${Date.now()}-11`, name: "Billing milestones defined", status: "Not Started" },
        ],
        materials: [],
        equipment: [],
        daily_logs: [],
        material_exceptions: [],
        // Generate default billing milestones from proposal
        billing_milestones: [
          {
            id: `BM-${Date.now()}-1`,
            project_id: projectNumber,
            milestone_name: "Mobilization (10%)",
            amount: Math.round((proposal.total || 0) * 0.1),
            status: "Not Ready",
          },
          {
            id: `BM-${Date.now()}-2`,
            project_id: projectNumber,
            milestone_name: "Midpoint (40%)",
            amount: Math.round((proposal.total || 0) * 0.4),
            status: "Not Ready",
          },
          {
            id: `BM-${Date.now()}-3`,
            project_id: projectNumber,
            milestone_name: "Completion (40%)",
            amount: Math.round((proposal.total || 0) * 0.4),
            status: "Not Ready",
          },
          {
            id: `BM-${Date.now()}-4`,
            project_id: projectNumber,
            milestone_name: "Retainage (10%)",
            amount: Math.round((proposal.total || 0) * 0.1),
            status: "Not Ready",
          },
        ],
        closeout_checklist: [
          { id: `CO-${Date.now()}-1`, name: "Completion form signed", is_required: true, status: "Required" },
          { id: `CO-${Date.now()}-2`, name: "Final photos uploaded", is_required: true, status: "Required" },
          { id: `CO-${Date.now()}-3`, name: "Customer signoff received", is_required: true, status: "Required" },
          { id: `CO-${Date.now()}-4`, name: "Final notes documented", is_required: false, status: "Required" },
          { id: `CO-${Date.now()}-5`, name: "Billing trigger fired", is_required: true, status: "Required" },
          { id: `CO-${Date.now()}-6`, name: "Document package archived", is_required: false, status: "Required" },
        ],
      }
      
      mockProjects.push(newProject)
      
      // Update proposal with project link
      proposal.project = projectNumber
      
      revalidatePath("/projects")
      revalidatePath("/pipeline")
      revalidatePath(`/proposals/${proposalName}`)
      
      return { success: true, data: newProject, redirect: `/projects/${projectNumber}` }
    }
    
    // Frappe implementation
    const result = await frappe.call<{ project_name: string }>(
      "cunningham.api.convert_proposal_to_project",
      { proposal_name: proposalName }
    )
    
    revalidatePath("/projects")
    revalidatePath("/pipeline")
    return { success: true, redirect: `/projects/${result.project_name}` }
  } catch (error) {
    console.error("Failed to convert proposal to project:", error)
    return { success: false, error: "Failed to convert proposal to project" }
  }
}

// =============================================================================
// Project Status Management
// =============================================================================

interface BlockedMetadata {
  blocked_reason: string
  blocked_next_action: string
}

export async function updateProjectStatus(
  projectName: string,
  newStatus: ProjectStatus,
  metadata?: BlockedMetadata
) {
  try {
    const project = getProjectById(projectName)
    if (!project) {
      return { success: false, error: "Project not found" }
    }
    
    // Validate Blocked status
    if (newStatus === "Blocked") {
      if (!metadata?.blocked_reason || !metadata?.blocked_next_action) {
        return { success: false, error: "Blocked reason and next action are required" }
      }
    }
    
    // Validate Closed status
    if (newStatus === "Closed") {
      const incompleteRequired = project.closeout_checklist.filter(
        item => item.is_required && item.status === "Required"
      )
      if (incompleteRequired.length > 0) {
        return { 
          success: false, 
          error: "Required closeout items must be completed or waived before closing" 
        }
      }
    }
    
    if (USE_MOCK) {
      const idx = mockProjects.findIndex(p => p.name === projectName)
      if (idx !== -1) {
        const oldStatus = mockProjects[idx].status
        mockProjects[idx].status = newStatus
        mockProjects[idx].modified = new Date().toISOString()
        
        if (newStatus === "Blocked" && metadata) {
          mockProjects[idx].blocked_reason = metadata.blocked_reason
          mockProjects[idx].blocked_next_action = metadata.blocked_next_action
          mockProjects[idx].blocked_date = new Date().toISOString().split("T")[0]
        } else {
          mockProjects[idx].blocked_reason = undefined
          mockProjects[idx].blocked_next_action = undefined
          mockProjects[idx].blocked_date = undefined
        }
        
        // Add to status history
        if (!mockProjects[idx].status_history) {
          mockProjects[idx].status_history = []
        }
        mockProjects[idx].status_history!.push({
          from_status: oldStatus,
          to_status: newStatus,
          changed_by: "USER-001",
          changed_at: new Date().toISOString(),
          reason: metadata?.blocked_reason,
          next_action: metadata?.blocked_next_action,
        })
      }
      
      revalidatePath(`/projects/${projectName}`)
      revalidatePath("/projects")
      return { success: true }
    }
    
    await frappe.save<ProjectFull>("Project", projectName, {
      status: newStatus,
      ...metadata,
    })
    
    revalidatePath(`/projects/${projectName}`)
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("Failed to update project status:", error)
    return { success: false, error: "Failed to update status" }
  }
}

// =============================================================================
// Materials
// =============================================================================

interface AddMaterialInput {
  item: string
  vendor?: string
  quantity: number
  unit: string
  cost_estimate?: number
  expected_delivery?: string
  delivery_location?: string
}

export async function addMaterial(projectName: string, input: AddMaterialInput) {
  try {
    if (USE_MOCK) {
      const idx = mockProjects.findIndex(p => p.name === projectName)
      if (idx !== -1) {
        const newMaterial: ProjectMaterial = {
          id: `MAT-${Date.now()}`,
          ...input,
          status: "Not Ordered",
          last_update: new Date().toISOString(),
        }
        mockProjects[idx].materials.push(newMaterial)
        mockProjects[idx].modified = new Date().toISOString()
      }
      
      revalidatePath(`/projects/${projectName}`)
      return { success: true }
    }
    
    await frappe.call("cunningham.api.add_project_material", {
      project_name: projectName,
      ...input,
    })
    
    revalidatePath(`/projects/${projectName}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to add material:", error)
    return { success: false, error: "Failed to add material" }
  }
}

export async function updateMaterial(
  projectName: string,
  materialId: string,
  updates: Partial<ProjectMaterial>
) {
  try {
    if (USE_MOCK) {
      const idx = mockProjects.findIndex(p => p.name === projectName)
      if (idx !== -1) {
        const matIdx = mockProjects[idx].materials.findIndex(m => m.id === materialId)
        if (matIdx !== -1) {
          Object.assign(mockProjects[idx].materials[matIdx], updates, {
            last_update: new Date().toISOString(),
          })
          mockProjects[idx].modified = new Date().toISOString()
        }
      }
      
      revalidatePath(`/projects/${projectName}`)
      return { success: true }
    }
    
    await frappe.call("cunningham.api.update_project_material", {
      project_name: projectName,
      material_id: materialId,
      ...updates,
    })
    
    revalidatePath(`/projects/${projectName}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update material:", error)
    return { success: false, error: "Failed to update material" }
  }
}

// =============================================================================
// Material Exceptions
// =============================================================================

export async function flagMaterialException(
  projectName: string,
  materialId: string,
  exceptionType: ExceptionType,
  notes?: string
) {
  try {
    if (USE_MOCK) {
      const idx = mockProjects.findIndex(p => p.name === projectName)
      if (idx !== -1) {
        const material = mockProjects[idx].materials.find(m => m.id === materialId)
        if (material) {
          const newException: MaterialException = {
            id: `EXC-${Date.now()}`,
            material_id: materialId,
            vendor: material.vendor || "",
            item: material.item,
            expected_date: material.expected_delivery,
            issue_type: exceptionType,
            notes,
            resolution_status: "Open",
          }
          mockProjects[idx].material_exceptions.push(newException)
          mockProjects[idx].modified = new Date().toISOString()
        }
      }
      
      revalidatePath(`/projects/${projectName}`)
      return { success: true }
    }
    
    await frappe.call("cunningham.api.flag_material_exception", {
      project_name: projectName,
      material_id: materialId,
      exception_type: exceptionType,
      notes,
    })
    
    revalidatePath(`/projects/${projectName}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to flag exception:", error)
    return { success: false, error: "Failed to flag exception" }
  }
}

export async function resolveException(
  projectName: string,
  exceptionId: string,
  resolution: string
) {
  try {
    if (USE_MOCK) {
      const idx = mockProjects.findIndex(p => p.name === projectName)
      if (idx !== -1) {
        const excIdx = mockProjects[idx].material_exceptions.findIndex(e => e.id === exceptionId)
        if (excIdx !== -1) {
          mockProjects[idx].material_exceptions[excIdx].resolution_status = "Resolved"
          mockProjects[idx].material_exceptions[excIdx].resolution_notes = resolution
          mockProjects[idx].material_exceptions[excIdx].resolved_date = new Date().toISOString().split("T")[0]
          mockProjects[idx].material_exceptions[excIdx].resolved_by = "USER-001"
          mockProjects[idx].modified = new Date().toISOString()
        }
      }
      
      revalidatePath(`/projects/${projectName}`)
      return { success: true }
    }
    
    await frappe.call("cunningham.api.resolve_material_exception", {
      project_name: projectName,
      exception_id: exceptionId,
      resolution,
    })
    
    revalidatePath(`/projects/${projectName}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to resolve exception:", error)
    return { success: false, error: "Failed to resolve exception" }
  }
}

// =============================================================================
// Daily Logs
// =============================================================================

interface AddDailyLogInput {
  date: string
  crew: string
  weather?: string
  work_completed: string
  issues?: string
  photos?: string[]
  inspector_notes?: string
  next_steps?: string
}

export async function addDailyLog(projectName: string, input: AddDailyLogInput) {
  try {
    if (USE_MOCK) {
      const idx = mockProjects.findIndex(p => p.name === projectName)
      if (idx !== -1) {
        const newLog: ProjectDailyLog = {
          id: `LOG-${Date.now()}`,
          ...input,
          submitted_by: "USER-001",
          submitted_at: new Date().toISOString(),
        }
        mockProjects[idx].daily_logs.unshift(newLog) // Add to beginning
        mockProjects[idx].modified = new Date().toISOString()
      }
      
      revalidatePath(`/projects/${projectName}`)
      return { success: true }
    }
    
    await frappe.call("cunningham.api.add_daily_log", {
      project_name: projectName,
      ...input,
    })
    
    revalidatePath(`/projects/${projectName}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to add daily log:", error)
    return { success: false, error: "Failed to add daily log" }
  }
}

// =============================================================================
// Closeout Checklist
// =============================================================================

export async function completeCloseoutItem(
  projectName: string,
  itemId: string,
  waived?: boolean,
  waivedReason?: string
) {
  try {
    if (USE_MOCK) {
      const idx = mockProjects.findIndex(p => p.name === projectName)
      if (idx !== -1) {
        const itemIdx = mockProjects[idx].closeout_checklist.findIndex(i => i.id === itemId)
        if (itemIdx !== -1) {
          if (waived) {
            mockProjects[idx].closeout_checklist[itemIdx].status = "Waived"
            mockProjects[idx].closeout_checklist[itemIdx].waived_reason = waivedReason
          } else {
            mockProjects[idx].closeout_checklist[itemIdx].status = "Complete"
            mockProjects[idx].closeout_checklist[itemIdx].completed_date = new Date().toISOString().split("T")[0]
            mockProjects[idx].closeout_checklist[itemIdx].completed_by = "USER-001"
          }
          mockProjects[idx].modified = new Date().toISOString()
        }
      }
      
      revalidatePath(`/projects/${projectName}`)
      return { success: true }
    }
    
    await frappe.call("cunningham.api.complete_closeout_item", {
      project_name: projectName,
      item_id: itemId,
      waived,
      waived_reason: waivedReason,
    })
    
    revalidatePath(`/projects/${projectName}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to complete closeout item:", error)
    return { success: false, error: "Failed to complete closeout item" }
  }
}
