"use server"

import { frappe } from "@/lib/frappe"
import { revalidatePath } from "next/cache"
import type { DocumentType, AttachableDoctype } from "@/types/document"

// =============================================================================
// Document Actions
// =============================================================================

interface UploadDocumentInput {
  fileName: string
  fileData: string // Base64 encoded
  fileType: string
  documentType: DocumentType
  description?: string
  attachments: Array<{ doctype: AttachableDoctype; name: string }>
  isPrivate?: boolean
}

export async function uploadDocument(input: UploadDocumentInput) {
  try {
    // Generate standardized file name
    // Pattern: [CUST-CODE]-[YYYYMMDD]-[USER-PROVIDED-NAME].[ext]
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
    const customerAtt = input.attachments.find(a => a.doctype === "Customer")
    const customerCode = customerAtt?.name || "GEN"
    const ext = input.fileName.split(".").pop() || ""
    const baseName = input.fileName.replace(/\.[^.]+$/, "")
    const standardizedName = `${customerCode}-${dateStr}-${baseName}.${ext}`

    // Upload file to Frappe
    const uploadResult = await frappe.uploadFile({
      file: input.fileData,
      filename: standardizedName,
      is_private: input.isPrivate ? 1 : 0,
    })

    // Create Document record
    const docResult = await frappe.insert("Document", {
      file_name: standardizedName,
      file_url: uploadResult.file_url,
      file_type: input.fileType,
      document_type: input.documentType,
      description: input.description,
      is_private: input.isPrivate ? 1 : 0,
    })

    // Create attachment mappings
    for (const attachment of input.attachments) {
      await frappe.insert("Document Attachment", {
        document: docResult.name,
        attached_to_doctype: attachment.doctype,
        attached_to_name: attachment.name,
      })
    }

    revalidatePath("/documents")

    return {
      success: true,
      documentId: docResult.name,
      fileName: standardizedName,
    }
  } catch (error) {
    console.error("Failed to upload document:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload document",
    }
  }
}

interface UpdateDocumentAttachmentsInput {
  documentId: string
  attachments: Array<{ doctype: AttachableDoctype; name: string }>
}

export async function updateDocumentAttachments(input: UpdateDocumentAttachmentsInput) {
  try {
    // Delete existing attachments
    const existingAttachments = await frappe.getList("Document Attachment", {
      filters: { document: input.documentId },
      fields: ["name"],
    })

    for (const att of existingAttachments) {
      await frappe.delete("Document Attachment", att.name)
    }

    // Create new attachments
    for (const attachment of input.attachments) {
      await frappe.insert("Document Attachment", {
        document: input.documentId,
        attached_to_doctype: attachment.doctype,
        attached_to_name: attachment.name,
      })
    }

    revalidatePath("/documents")

    return { success: true }
  } catch (error) {
    console.error("Failed to update document attachments:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update attachments",
    }
  }
}

export async function deleteDocument(documentId: string) {
  try {
    // Delete attachment mappings first
    const attachments = await frappe.getList("Document Attachment", {
      filters: { document: documentId },
      fields: ["name"],
    })

    for (const att of attachments) {
      await frappe.delete("Document Attachment", att.name)
    }

    // Delete the document record
    await frappe.delete("Document", documentId)

    revalidatePath("/documents")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete document:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete document",
    }
  }
}
