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

// UI-friendly maps used by pages (badges, filters)
export const ITR_STATUSES = {
  draft: { label: "Borrador", class: "status-draft" },
  in_review: { label: "En Revisión", class: "status-in-review" },
  approved: { label: "Aprobado", class: "status-approved" },
  rejected: { label: "Rechazado", class: "status-rejected" },
} as const;

export const PUNCH_STATUSES = {
  open: { label: "Abierto", class: "bg-destructive text-destructive-foreground" },
  in_progress: { label: "En Progreso", class: "bg-warning text-warning-foreground" },
  cleared: { label: "Despejado", class: "bg-info text-info-foreground" },
  closed: { label: "Cerrado", class: "bg-success text-success-foreground" },
} as const;

export const PUNCH_CATEGORIES = {
  A: { label: "Categoría A", class: "punch-category-a" },
  B: { label: "Categoría B", class: "punch-category-b" },
  C: { label: "Categoría C", class: "punch-category-c" },
} as const;

export const ROLES = {
  admin: { label: "Administrador", class: "bg-primary text-primary-foreground" },
  supervisor: { label: "Supervisor", class: "bg-info text-info-foreground" },
  inspector: { label: "Inspector", class: "bg-success text-success-foreground" },
  user: { label: "Usuario", class: "bg-muted text-muted-foreground" },
} as const;

export const MEMBER_STATUSES = {
  pending: { label: "Pendiente", class: "bg-warning text-warning-foreground" },
  active: { label: "Activo", class: "bg-success text-success-foreground" },
  inactive: { label: "Inactivo", class: "bg-muted text-muted-foreground" },
} as const;

