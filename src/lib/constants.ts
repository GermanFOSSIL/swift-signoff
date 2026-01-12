// Application constants

export const APP_NAME = "CompletionHub";
export const APP_DESCRIPTION = "Enterprise Completions Management System";

// Status labels and colors
export const ITR_STATUS_CONFIG = {
  draft: {
    label: "Borrador",
    color: "muted",
    bgClass: "status-draft",
  },
  in_review: {
    label: "En Revisión",
    color: "info",
    bgClass: "status-in-review",
  },
  approved: {
    label: "Aprobado",
    color: "success",
    bgClass: "status-approved",
  },
  rejected: {
    label: "Rechazado",
    color: "destructive",
    bgClass: "status-rejected",
  },
} as const;

export const PUNCH_STATUS_CONFIG = {
  open: {
    label: "Abierto",
    color: "destructive",
  },
  in_progress: {
    label: "En Progreso",
    color: "warning",
  },
  cleared: {
    label: "Despejado",
    color: "info",
  },
  closed: {
    label: "Cerrado",
    color: "success",
  },
} as const;

export const PUNCH_CATEGORY_CONFIG = {
  A: {
    label: "Categoría A",
    description: "Defectos de seguridad críticos",
    color: "destructive",
    bgClass: "punch-category-a",
  },
  B: {
    label: "Categoría B",
    description: "Otros defectos",
    color: "warning",
    bgClass: "punch-category-b",
  },
  C: {
    label: "Categoría C",
    description: "Menor prioridad",
    color: "info",
    bgClass: "punch-category-c",
  },
} as const;

export const ROLE_CONFIG = {
  admin: {
    label: "Administrador",
    description: "Acceso completo al sistema",
  },
  supervisor: {
    label: "Supervisor",
    description: "Puede aprobar ITRs y gestionar equipos",
  },
  inspector: {
    label: "Inspector",
    description: "Puede ejecutar y firmar ITRs",
  },
  user: {
    label: "Usuario",
    description: "Acceso de solo lectura",
  },
} as const;

export const MEMBER_STATUS_CONFIG = {
  pending: {
    label: "Pendiente",
    color: "warning",
  },
  active: {
    label: "Activo",
    color: "success",
  },
  inactive: {
    label: "Inactivo",
    color: "muted",
  },
} as const;

// Form field types for ITR templates
export const FIELD_TYPES = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "checkbox", label: "Casilla de verificación" },
  { value: "select", label: "Selección" },
  { value: "date", label: "Fecha" },
  { value: "signature", label: "Firma" },
  { value: "file", label: "Archivo adjunto" },
  { value: "textarea", label: "Texto largo" },
  { value: "radio", label: "Opción única" },
] as const;
