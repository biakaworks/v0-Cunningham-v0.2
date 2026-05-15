"use server"

import { revalidateTag } from "next/cache"
import { frappeList, frappeGet, frappeCreate, frappeUpdate } from "@/lib/frappe"
import { z } from "zod"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Stage = 'Lead' | 'Inspection' | 'Proposal' | 'Scheduled' | 'In Progress' | 'Billed'
export type ProjectType = 'Negotiated' | 'Engineered-spec'
export type ServiceType =
  | 'Visual Inspection'
  | 'Washout & Inspection — Standpipe'
  | 'Washout & Inspection — Clear Well'
  | 'Maintenance Coating'
  | 'Sandblast & Reline'
  | 'Leak/Weld Repair'

export interface PipelineProject {
  name: string
  customer: string
  customer_name: string
  site: string
  site_name: string
  project_type: ProjectType
  service_type: ServiceType
  value: number
  owner: string
  owner_name: string
  owner_initials: string
  stage: Stage
  days_in_stage: number
  is_stale: boolean
  needs_attention: boolean
  attention_reason?: string
  scheduled_date?: string
  last_contact?: string
  expected_close?: string
  next_action?: string
  next_action_overdue?: boolean
  tank_specs?: string
  location?: string
  gps_coords?: string
  last_service_date?: string
  proposal_status?: 'Draft' | 'Sent' | 'Negotiating' | 'Accepted' | 'Declined'
  crew_assigned?: string
  start_date?: string
  end_date?: string
  invoice_status?: 'Pending' | 'Sent' | 'Paid'
  creation: string
  modified: string
}

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const CreateLeadSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  site: z.string().optional(),
  site_name: z.string().min(1, "Site name is required"),
  project_type: z.enum(['Negotiated', 'Engineered-spec']),
  service_type: z.enum([
    'Visual Inspection',
    'Washout & Inspection — Standpipe',
    'Washout & Inspection — Clear Well',
    'Maintenance Coating',
    'Sandblast & Reline',
    'Leak/Weld Repair',
  ]),
  value: z.number().min(0),
  owner: z.string().min(1, "Owner is required"),
})

const UpdateStageSchema = z.object({
  project_id: z.string().min(1),
  new_stage: z.enum(['Lead', 'Inspection', 'Proposal', 'Scheduled', 'In Progress', 'Billed']),
  reason: z.string().optional(),
})

const UpdateProjectSchema = z.object({
  next_action: z.string().optional(),
  scheduled_date: z.string().optional(),
  crew_assigned: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

// ─── Stale Thresholds ─────────────────────────────────────────────────────────

const staleThresholds: Record<Stage, number> = {
  Lead: 14,
  Inspection: 10,
  Proposal: 30,
  Scheduled: 21,
  'In Progress': 14,
  Billed: 30,
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function getPipelineProjects(): Promise<PipelineProject[]> {
  try {
    const projects = await frappeList<PipelineProject>("Pipeline Project", {
      fields: [
        "name", "customer", "customer_name", "site", "site_name",
        "project_type", "service_type", "value", "owner", "owner_name",
        "stage", "stage_entered_date", "next_action", "next_action_due",
        "scheduled_date", "crew_assigned", "start_date", "end_date",
        "invoice_status", "proposal_status", "gps_coords",
        "creation", "modified"
      ],
      filters: [
        ["stage", "!=", "Closed"]
      ],
      order_by: "stage asc, modified desc",
      limit: 500,
    })

    // Calculate derived fields
    const now = new Date()
    return projects.map(p => {
      const stageEnteredDate = new Date(p.creation) // Use stage_entered_date when available
      const daysInStage = Math.floor((now.getTime() - stageEnteredDate.getTime()) / (1000 * 60 * 60 * 24))
      const threshold = staleThresholds[p.stage] || 14
      const isStale = daysInStage > threshold
      const nextActionOverdue = p.next_action && p.next_action_due ? new Date(p.next_action_due) < now : false

      return {
        ...p,
        owner_initials: p.owner_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'XX',
        days_in_stage: daysInStage,
        is_stale: isStale,
        needs_attention: nextActionOverdue,
        next_action_overdue: nextActionOverdue,
      }
    })
  } catch (error) {
    console.error("Failed to fetch pipeline projects:", error)
    throw new Error("Failed to load pipeline data")
  }
}

export async function getProjectDetail(name: string): Promise<PipelineProject> {
  try {
    const project = await frappeGet<PipelineProject>("Pipeline Project", name)
    
    const now = new Date()
    const stageEnteredDate = new Date(project.creation)
    const daysInStage = Math.floor((now.getTime() - stageEnteredDate.getTime()) / (1000 * 60 * 60 * 24))
    const threshold = staleThresholds[project.stage] || 14
    
    return {
      ...project,
      owner_initials: project.owner_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'XX',
      days_in_stage: daysInStage,
      is_stale: daysInStage > threshold,
    }
  } catch (error) {
    console.error("Failed to fetch project detail:", error)
    throw new Error("Failed to load project")
  }
}

export async function createLead(input: z.infer<typeof CreateLeadSchema>) {
  const parsed = CreateLeadSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const project = await frappeCreate<PipelineProject>("Pipeline Project", {
      ...parsed.data,
      stage: "Lead",
      stage_entered_date: new Date().toISOString().split("T")[0],
    } as Partial<PipelineProject>)

    revalidateTag("Pipeline Project")
    return { success: true, data: project }
  } catch (error) {
    console.error("Failed to create lead:", error)
    return { success: false, error: "Failed to create lead" }
  }
}

export async function updateProjectStage(input: z.infer<typeof UpdateStageSchema>) {
  const parsed = UpdateStageSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    await frappeUpdate<PipelineProject>("Pipeline Project", parsed.data.project_id, {
      stage: parsed.data.new_stage,
      stage_entered_date: new Date().toISOString().split("T")[0],
      stage_change_reason: parsed.data.reason,
    } as Partial<PipelineProject>)

    revalidateTag("Pipeline Project")
    return { success: true }
  } catch (error) {
    console.error("Failed to update project stage:", error)
    return { success: false, error: "Failed to update stage" }
  }
}

export async function updateProject(name: string, input: z.infer<typeof UpdateProjectSchema>) {
  const parsed = UpdateProjectSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    await frappeUpdate<PipelineProject>("Pipeline Project", name, parsed.data as Partial<PipelineProject>)

    revalidateTag("Pipeline Project")
    revalidateTag(`Pipeline Project:${name}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update project:", error)
    return { success: false, error: "Failed to update project" }
  }
}

export async function getPipelineOwners(): Promise<{ name: string; full_name: string; initials: string }[]> {
  try {
    const users = await frappeList<{ name: string; full_name: string }>("User", {
      fields: ["name", "full_name"],
      filters: [
        ["enabled", "=", 1],
        ["user_type", "=", "System User"]
      ],
      limit: 50,
    })

    return users.map(u => ({
      name: u.name,
      full_name: u.full_name || u.name,
      initials: (u.full_name || u.name).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    }))
  } catch (error) {
    console.error("Failed to fetch owners:", error)
    return []
  }
}
