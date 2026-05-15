// =============================================================================
// Project & Billing I18n Labels (EN/ES)
// =============================================================================

export type Language = 'en' | 'es'

export const projectLabels = {
  en: {
    // Page titles
    projects: 'Projects',
    newProject: 'New Project',
    projectDetails: 'Project Details',
    fieldView: 'Field View',
    billing: 'Billing',
    
    // Status
    status: 'Status',
    setup: 'Setup',
    scheduled: 'Scheduled',
    active: 'Active',
    blocked: 'Blocked',
    completed: 'Completed',
    billingPending: 'Billing Pending',
    closed: 'Closed',
    canceled: 'Canceled',
    
    // Sections
    overview: 'Overview',
    setupChecklist: 'Setup Checklist',
    materials: 'Materials',
    equipment: 'Equipment',
    dailyLogs: 'Daily Logs',
    exceptions: 'Delivery Exceptions',
    billingMilestones: 'Billing Milestones',
    closeoutChecklist: 'Closeout Checklist',
    documents: 'Documents',
    
    // Fields
    customer: 'Customer',
    site: 'Site',
    tank: 'Tank',
    contractValue: 'Contract Value',
    owner: 'Owner',
    startDate: 'Start Date',
    projectedEnd: 'Projected End',
    actualEnd: 'Actual End',
    percentComplete: 'Percent Complete',
    sourceProposal: 'Source Proposal',
    sourceContract: 'Source Contract',
    blockedReason: 'Blocked Reason',
    nextAction: 'Next Action',
    
    // Setup checklist
    contractSigned: 'Contract signed',
    jobSheet: 'Job sheet created',
    materialsList: 'Materials list finalized',
    paintSpecified: 'Paint specified',
    equipmentBooked: 'Equipment booked',
    dumpstersArranged: 'Dumpsters arranged',
    containmentPlanned: 'Containment planned',
    crewAssigned: 'Crew assigned',
    scheduleConfirmed: 'Schedule confirmed',
    safetyPlan: 'Safety plan completed',
    billingMilestonesDefined: 'Billing milestones defined',
    
    // Materials
    item: 'Item',
    vendor: 'Vendor',
    quantity: 'Quantity',
    costEstimate: 'Cost Estimate',
    orderDate: 'Order Date',
    expectedDelivery: 'Expected Delivery',
    deliveryLocation: 'Delivery Location',
    notOrdered: 'Not Ordered',
    ordered: 'Ordered',
    inTransit: 'In Transit',
    delivered: 'Delivered',
    delayed: 'Delayed',
    missing: 'Missing',
    changed: 'Changed',
    
    // Equipment
    deliveryDate: 'Delivery Date',
    returnDate: 'Return Date',
    location: 'Location',
    
    // Daily logs
    date: 'Date',
    crew: 'Crew',
    weather: 'Weather',
    workCompleted: 'Work Completed',
    issues: 'Issues',
    photos: 'Photos',
    inspectorNotes: 'Inspector Notes',
    nextSteps: 'Next Steps',
    addDailyLog: 'Add Daily Log',
    
    // Exceptions
    issueType: 'Issue Type',
    late: 'Late',
    damaged: 'Damaged',
    short: 'Short',
    overage: 'Overage',
    wrongItem: 'Wrong Item',
    open: 'Open',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    flagException: 'Flag Exception',
    resolveException: 'Resolve Exception',
    
    // Billing
    milestoneName: 'Milestone',
    amount: 'Amount',
    dueDate: 'Due Date',
    invoiceReference: 'Invoice #',
    lastSync: 'Last Sync',
    notReady: 'Not Ready',
    readyToBill: 'Ready to Bill',
    submitted: 'Submitted',
    approved: 'Approved',
    invoiced: 'Invoiced',
    paid: 'Paid',
    
    // Closeout
    completionForm: 'Completion form signed',
    finalPhotos: 'Final photos uploaded',
    customerSignoff: 'Customer signoff received',
    finalNotes: 'Final notes documented',
    billingTrigger: 'Billing trigger fired',
    documentPackage: 'Document package archived',
    waive: 'Waive',
    waiveReason: 'Waive Reason',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    add: 'Add',
    delete: 'Delete',
    complete: 'Complete',
    
    // Messages
    requiredItemsIncomplete: 'Required closeout items must be completed or waived before closing',
    blockedReasonRequired: 'Reason and next action required when blocking a project',
    saved: 'Saved',
    error: 'Error',
  },
  es: {
    // Page titles
    projects: 'Proyectos',
    newProject: 'Nuevo Proyecto',
    projectDetails: 'Detalles del Proyecto',
    fieldView: 'Vista de Campo',
    billing: 'Facturación',
    
    // Status
    status: 'Estado',
    setup: 'Configuración',
    scheduled: 'Programado',
    active: 'Activo',
    blocked: 'Bloqueado',
    completed: 'Completado',
    billingPending: 'Facturación Pendiente',
    closed: 'Cerrado',
    canceled: 'Cancelado',
    
    // Sections
    overview: 'Resumen',
    setupChecklist: 'Lista de Configuración',
    materials: 'Materiales',
    equipment: 'Equipo',
    dailyLogs: 'Registros Diarios',
    exceptions: 'Excepciones de Entrega',
    billingMilestones: 'Hitos de Facturación',
    closeoutChecklist: 'Lista de Cierre',
    documents: 'Documentos',
    
    // Fields
    customer: 'Cliente',
    site: 'Sitio',
    tank: 'Tanque',
    contractValue: 'Valor del Contrato',
    owner: 'Responsable',
    startDate: 'Fecha de Inicio',
    projectedEnd: 'Fin Proyectado',
    actualEnd: 'Fin Real',
    percentComplete: 'Porcentaje Completado',
    sourceProposal: 'Propuesta Origen',
    sourceContract: 'Contrato Origen',
    blockedReason: 'Razón de Bloqueo',
    nextAction: 'Próxima Acción',
    
    // Setup checklist
    contractSigned: 'Contrato firmado',
    jobSheet: 'Hoja de trabajo creada',
    materialsList: 'Lista de materiales finalizada',
    paintSpecified: 'Pintura especificada',
    equipmentBooked: 'Equipo reservado',
    dumpstersArranged: 'Contenedores organizados',
    containmentPlanned: 'Contención planificada',
    crewAssigned: 'Equipo asignado',
    scheduleConfirmed: 'Horario confirmado',
    safetyPlan: 'Plan de seguridad completado',
    billingMilestonesDefined: 'Hitos de facturación definidos',
    
    // Materials
    item: 'Artículo',
    vendor: 'Proveedor',
    quantity: 'Cantidad',
    costEstimate: 'Estimación de Costo',
    orderDate: 'Fecha de Pedido',
    expectedDelivery: 'Entrega Esperada',
    deliveryLocation: 'Ubicación de Entrega',
    notOrdered: 'No Pedido',
    ordered: 'Pedido',
    inTransit: 'En Tránsito',
    delivered: 'Entregado',
    delayed: 'Retrasado',
    missing: 'Faltante',
    changed: 'Cambiado',
    
    // Equipment
    deliveryDate: 'Fecha de Entrega',
    returnDate: 'Fecha de Devolución',
    location: 'Ubicación',
    
    // Daily logs
    date: 'Fecha',
    crew: 'Equipo',
    weather: 'Clima',
    workCompleted: 'Trabajo Completado',
    issues: 'Problemas',
    photos: 'Fotos',
    inspectorNotes: 'Notas del Inspector',
    nextSteps: 'Próximos Pasos',
    addDailyLog: 'Agregar Registro Diario',
    
    // Exceptions
    issueType: 'Tipo de Problema',
    late: 'Tardío',
    damaged: 'Dañado',
    short: 'Faltante',
    overage: 'Exceso',
    wrongItem: 'Artículo Incorrecto',
    open: 'Abierto',
    inProgress: 'En Progreso',
    resolved: 'Resuelto',
    flagException: 'Reportar Excepción',
    resolveException: 'Resolver Excepción',
    
    // Billing
    milestoneName: 'Hito',
    amount: 'Monto',
    dueDate: 'Fecha de Vencimiento',
    invoiceReference: 'Factura #',
    lastSync: 'Última Sincronización',
    notReady: 'No Listo',
    readyToBill: 'Listo para Facturar',
    submitted: 'Enviado',
    approved: 'Aprobado',
    invoiced: 'Facturado',
    paid: 'Pagado',
    
    // Closeout
    completionForm: 'Formulario de finalización firmado',
    finalPhotos: 'Fotos finales subidas',
    customerSignoff: 'Aprobación del cliente recibida',
    finalNotes: 'Notas finales documentadas',
    billingTrigger: 'Disparador de facturación activado',
    documentPackage: 'Paquete de documentos archivado',
    waive: 'Eximir',
    waiveReason: 'Razón de Exención',
    
    // Actions
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    add: 'Agregar',
    delete: 'Eliminar',
    complete: 'Completar',
    
    // Messages
    requiredItemsIncomplete: 'Los elementos de cierre requeridos deben completarse o eximirse antes de cerrar',
    blockedReasonRequired: 'Se requiere razón y próxima acción al bloquear un proyecto',
    saved: 'Guardado',
    error: 'Error',
  },
} as const

export type ProjectLabelKey = keyof typeof projectLabels.en

export function getProjectLabel(key: ProjectLabelKey, lang: Language = 'en'): string {
  return projectLabels[lang][key] || projectLabels.en[key] || key
}
