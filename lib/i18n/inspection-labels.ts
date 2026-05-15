// =============================================================================
// Bilingual Labels for Field Inspection Workflow
// =============================================================================

export type Language = 'en' | 'es'

export const translations = {
  // Navigation & Actions
  back: { en: 'Back', es: 'Atrás' },
  next: { en: 'Next', es: 'Siguiente' },
  save_draft: { en: 'Save Draft', es: 'Guardar Borrador' },
  submit: { en: 'Submit for Review', es: 'Enviar para Revisión' },
  cancel: { en: 'Cancel', es: 'Cancelar' },
  
  // Sync status
  sync_synced: { en: 'Synced', es: 'Sincronizado' },
  sync_queued: { en: 'Will sync when online', es: 'Se sincronizará cuando haya conexión' },
  sync_syncing: { en: 'Syncing...', es: 'Sincronizando...' },
  sync_failed: { en: 'Sync failed', es: 'Error de sincronización' },
  retry: { en: 'Retry', es: 'Reintentar' },
  queued_inspections: { en: 'inspections queued', es: 'inspecciones en cola' },
  last_sync: { en: 'Last sync', es: 'Última sincronización' },
  
  // Steps
  step_1_title: { en: 'Confirm Context', es: 'Confirmar Contexto' },
  step_2_title: { en: 'Guided Checklist', es: 'Lista de Verificación' },
  step_3_title: { en: 'Measurements', es: 'Mediciones' },
  step_4_title: { en: 'Photo Upload', es: 'Subir Fotos' },
  step_5_title: { en: 'Review & Submit', es: 'Revisar y Enviar' },
  
  // Step 1 - Context
  customer: { en: 'Customer', es: 'Cliente' },
  site: { en: 'Site', es: 'Sitio' },
  tank: { en: 'Tank', es: 'Tanque' },
  crew: { en: 'Crew', es: 'Equipo' },
  service_date: { en: 'Service Date', es: 'Fecha de Servicio' },
  weather: { en: 'Weather', es: 'Clima' },
  temperature: { en: 'Temperature', es: 'Temperatura' },
  language: { en: 'Language', es: 'Idioma' },
  initial_photo_required: { en: 'Take initial tank photo to continue', es: 'Tome foto inicial del tanque para continuar' },
  take_photo: { en: 'Take Photo', es: 'Tomar Foto' },
  
  // Step 2 - Checklist sections
  wet_interior: { en: 'Wet Interior', es: 'Interior Húmedo' },
  exterior: { en: 'Exterior', es: 'Exterior' },
  foundation: { en: 'Foundation', es: 'Cimentación' },
  anchor_bolts: { en: 'Anchor Bolts', es: 'Pernos de Anclaje' },
  overflow: { en: 'Overflow', es: 'Rebosadero' },
  manway: { en: 'Manway', es: 'Boca de Hombre' },
  ladder: { en: 'Ladder', es: 'Escalera' },
  safety_climb: { en: 'Safety Climb', es: 'Sistema de Seguridad' },
  vent: { en: 'Vent', es: 'Ventilación' },
  hatch: { en: 'Hatch', es: 'Escotilla' },
  aviation_light: { en: 'Aviation Light', es: 'Luz de Aviación' },
  cables: { en: 'Cables', es: 'Cables' },
  catwalk: { en: 'Catwalk', es: 'Pasarela' },
  coatings: { en: 'Coatings', es: 'Recubrimientos' },
  
  // Section status
  required: { en: 'Required', es: 'Requerido' },
  optional: { en: 'Optional', es: 'Opcional' },
  completed: { en: 'Completed', es: 'Completado' },
  missing: { en: 'Missing', es: 'Faltante' },
  
  // Photos
  photos: { en: 'Photos', es: 'Fotos' },
  required_photos: { en: 'Required Photos', es: 'Fotos Requeridas' },
  add_photo: { en: 'Add Photo', es: 'Agregar Foto' },
  remove_photo: { en: 'Remove Photo', es: 'Quitar Foto' },
  photo_caption: { en: 'Caption', es: 'Descripción' },
  
  // Measurements
  measurements: { en: 'Measurements', es: 'Mediciones' },
  overflow_size: { en: 'Overflow Size', es: 'Tamaño de Rebosadero' },
  hatch_size: { en: 'Hatch Size', es: 'Tamaño de Escotilla' },
  manway_size: { en: 'Manway Size', es: 'Tamaño de Boca de Hombre' },
  vent_size: { en: 'Vent Size', es: 'Tamaño de Ventilación' },
  standpipe_diameter: { en: 'Standpipe Diameter', es: 'Diámetro de Tubo Vertical' },
  standpipe_height: { en: 'Standpipe Height', es: 'Altura de Tubo Vertical' },
  
  // Notes & Deficiencies
  notes: { en: 'Notes', es: 'Notas' },
  deficiency: { en: 'Deficiency Found', es: 'Deficiencia Encontrada' },
  deficiency_severity: { en: 'Severity', es: 'Severidad' },
  minor: { en: 'Minor', es: 'Menor' },
  moderate: { en: 'Moderate', es: 'Moderada' },
  severe: { en: 'Severe', es: 'Severa' },
  
  // Step 4 - Bulk upload
  drag_drop_photos: { en: 'Drag and drop photos here, or click to browse', es: 'Arrastre y suelte fotos aquí, o haga clic para explorar' },
  assign_photos: { en: 'Assign Photos to Sections', es: 'Asignar Fotos a Secciones' },
  unassigned_photos: { en: 'Unassigned Photos', es: 'Fotos Sin Asignar' },
  
  // Step 5 - Validation
  validation_summary: { en: 'Validation Summary', es: 'Resumen de Validación' },
  missing_required_items: { en: 'Missing Required Items', es: 'Elementos Requeridos Faltantes' },
  waive_requirement: { en: 'Waive Requirement', es: 'Omitir Requisito' },
  waiver_reason: { en: 'Reason for waiver', es: 'Razón de la omisión' },
  all_requirements_met: { en: 'All requirements met', es: 'Todos los requisitos cumplidos' },
  
  // Status
  status_draft: { en: 'Draft', es: 'Borrador' },
  status_in_progress: { en: 'In Progress', es: 'En Progreso' },
  status_submitted: { en: 'Submitted', es: 'Enviado' },
  status_office_review: { en: 'Office Review', es: 'Revisión de Oficina' },
  status_corrections_requested: { en: 'Corrections Requested', es: 'Correcciones Solicitadas' },
  status_ready_for_report: { en: 'Ready for Report', es: 'Listo para Reporte' },
  
  // Office review
  flag_for_correction: { en: 'Flag for Correction', es: 'Marcar para Corrección' },
  correction_notes: { en: 'Correction Notes', es: 'Notas de Corrección' },
  approve_for_report: { en: 'Approve for Report Drafting', es: 'Aprobar para Elaboración de Reporte' },
  
  // Errors
  error_required_field: { en: 'This field is required', es: 'Este campo es requerido' },
  error_photo_required: { en: 'Photo is required for this section', es: 'Se requiere foto para esta sección' },
  error_measurement_required: { en: 'Measurement is required', es: 'Se requiere medición' },
  
  // Reports
  report: { en: 'Report', es: 'Reporte' },
  report_sections: { en: 'Report Sections', es: 'Secciones del Reporte' },
  recommendations: { en: 'Recommendations', es: 'Recomendaciones' },
  create_opportunity: { en: 'Create Opportunity', es: 'Crear Oportunidad' },
  
  // Report status
  report_draft: { en: 'Draft', es: 'Borrador' },
  report_in_review: { en: 'In Review', es: 'En Revisión' },
  report_approved: { en: 'Approved', es: 'Aprobado' },
  report_delivered: { en: 'Delivered', es: 'Entregado' },
  report_archived: { en: 'Archived', es: 'Archivado' },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Language): string {
  return translations[key][lang]
}

// Helper to get all translations for a language
export function getTranslations(lang: Language): Record<TranslationKey, string> {
  const result = {} as Record<TranslationKey, string>
  for (const key of Object.keys(translations) as TranslationKey[]) {
    result[key] = translations[key][lang]
  }
  return result
}
