"use server"

import { frappe } from "@/lib/frappe"
import { revalidatePath } from "next/cache"
import type {
  UserRole,
  RecordType,
  PermissionLevel,
  SensitiveFieldVisibility,
  ChecklistTemplate,
} from "@/types/document"

// =============================================================================
// User Management
// =============================================================================

interface CreateUserInput {
  fullName: string
  email: string
  roles: UserRole[]
  languagePreference: "en" | "es"
}

export async function createUser(input: CreateUserInput) {
  try {
    const result = await frappe.insert("User", {
      full_name: input.fullName,
      email: input.email,
      roles: input.roles.map(role => ({ role })),
      language_preference: input.languagePreference,
      enabled: 1,
    })

    revalidatePath("/admin")

    return {
      success: true,
      userId: result.name,
    }
  } catch (error) {
    console.error("Failed to create user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    }
  }
}

interface UpdateUserInput {
  fullName?: string
  email?: string
  roles?: UserRole[]
  languagePreference?: "en" | "es"
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  try {
    const updates: Record<string, unknown> = {}
    if (input.fullName) updates.full_name = input.fullName
    if (input.email) updates.email = input.email
    if (input.roles) updates.roles = input.roles.map(role => ({ role }))
    if (input.languagePreference) updates.language_preference = input.languagePreference

    await frappe.save("User", userId, updates)

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Failed to update user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    }
  }
}

export async function deactivateUser(userId: string) {
  try {
    await frappe.save("User", userId, { enabled: 0 })

    // Audit log
    await frappe.insert("Audit Log", {
      doctype_name: "User",
      document_name: userId,
      action: "Update",
      changes: JSON.stringify({ enabled: { from: 1, to: 0 } }),
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Failed to deactivate user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deactivate user",
    }
  }
}

// =============================================================================
// Permissions Management
// =============================================================================

interface PermissionMatrixEntry {
  recordType: RecordType
  level: PermissionLevel
}

export async function updatePermissionMatrix(roleId: string, permissions: PermissionMatrixEntry[]) {
  try {
    // Update role permissions in Frappe
    const permissionDocs = permissions.map(p => ({
      doctype: p.recordType,
      read: p.level === "Read" || p.level === "Write" ? 1 : 0,
      write: p.level === "Write" ? 1 : 0,
    }))

    await frappe.save("Role", roleId, {
      permissions: permissionDocs,
    })

    // Audit log
    await frappe.insert("Audit Log", {
      doctype_name: "Role",
      document_name: roleId,
      action: "Update",
      changes: JSON.stringify({ permissions: permissionDocs }),
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Failed to update permission matrix:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update permissions",
    }
  }
}

interface SensitiveFieldGatesInput {
  field: string
  visibility: Record<UserRole, SensitiveFieldVisibility>
}

export async function updateSensitiveFieldGates(gates: SensitiveFieldGatesInput[]) {
  try {
    for (const gate of gates) {
      await frappe.save("Sensitive Field Gate", gate.field, {
        visibility: gate.visibility,
      })
    }

    // Audit log
    await frappe.insert("Audit Log", {
      doctype_name: "Sensitive Field Gate",
      document_name: "bulk_update",
      action: "Update",
      changes: JSON.stringify(gates),
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Failed to update sensitive field gates:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update field gates",
    }
  }
}

// =============================================================================
// Duplicate & Low-Confidence Record Management
// =============================================================================

export async function mergeDuplicateRecords(
  recordA: string,
  recordB: string,
  doctype: "Customer" | "Site" | "Tank"
) {
  try {
    // Call Frappe method to merge records
    // This would preserve linked documents, proposals, reports, projects, notes from both
    await frappe.call("cunningham.api.merge_records", {
      doctype,
      record_a: recordA,
      record_b: recordB,
    })

    // Audit log
    await frappe.insert("Audit Log", {
      doctype_name: doctype,
      document_name: recordA,
      action: "Update",
      changes: JSON.stringify({ merged_from: recordB }),
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Failed to merge records:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to merge records",
    }
  }
}

export async function approveLowConfidenceRecord(recordId: string) {
  try {
    // Mark the low-confidence flag as resolved
    await frappe.save("Low Confidence Record", recordId, {
      status: "Approved",
      resolved_date: new Date().toISOString(),
    })

    // Audit log
    await frappe.insert("Audit Log", {
      doctype_name: "Low Confidence Record",
      document_name: recordId,
      action: "Approve",
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Failed to approve record:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve record",
    }
  }
}

export async function rejectLowConfidenceRecord(recordId: string, reason: string) {
  try {
    await frappe.save("Low Confidence Record", recordId, {
      status: "Rejected",
      rejection_reason: reason,
      resolved_date: new Date().toISOString(),
    })

    // Audit log
    await frappe.insert("Audit Log", {
      doctype_name: "Low Confidence Record",
      document_name: recordId,
      action: "Reject",
      changes: JSON.stringify({ reason }),
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Failed to reject record:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject record",
    }
  }
}

// =============================================================================
// Checklist Template Management
// =============================================================================

export async function updateChecklistTemplate(tankType: string, template: Partial<ChecklistTemplate>) {
  try {
    await frappe.save("Checklist Template", tankType, {
      sections: template.sections,
      labels: template.labels,
    })

    // Audit log
    await frappe.insert("Audit Log", {
      doctype_name: "Checklist Template",
      document_name: tankType,
      action: "Update",
      changes: JSON.stringify(template),
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Failed to update checklist template:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update template",
    }
  }
}

export async function approveBilingualLabel(templateTankType: string, labelKey: string) {
  try {
    // Get the current template
    const template = await frappe.getDoc("Checklist Template", templateTankType)
    
    // Update the label's needs_review flag
    const updatedLabels = template.labels.map((label: { key: string; needs_review: boolean }) => 
      label.key === labelKey ? { ...label, needs_review: false } : label
    )

    await frappe.save("Checklist Template", templateTankType, {
      labels: updatedLabels,
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Failed to approve label:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve label",
    }
  }
}

// =============================================================================
// Tower Verification
// =============================================================================

interface VerifyTowerLocationInput {
  siteId: string
  address: string
  latitude: number
  longitude: number
}

export async function verifyTowerLocation(input: VerifyTowerLocationInput) {
  try {
    await frappe.save("Site", input.siteId, {
      address_line1: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      location_confidence: "Verified",
      location_verified_date: new Date().toISOString(),
    })

    // Audit log
    await frappe.insert("Audit Log", {
      doctype_name: "Site",
      document_name: input.siteId,
      action: "Update",
      changes: JSON.stringify({
        location_confidence: { from: "Unknown", to: "Verified" },
        latitude: input.latitude,
        longitude: input.longitude,
      }),
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Failed to verify tower location:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify location",
    }
  }
}
