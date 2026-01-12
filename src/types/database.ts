// Database types for the Completions Management System

export type AppRole = "admin" | "inspector" | "supervisor" | "user";
export type ItrStatus = "draft" | "in_review" | "approved" | "rejected";
export type PunchCategory = "A" | "B" | "C";
export type PunchStatus = "open" | "in_progress" | "cleared" | "closed";
export type MemberStatus = "pending" | "active" | "inactive";
export type SignoffType = "inspector" | "supervisor";

// Organization
export interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Organization member
export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: Profile;
  user_roles?: UserRole[];
}

// User role
export interface UserRole {
  id: string;
  user_id: string;
  org_id: string;
  role: AppRole;
  created_at: string;
}

// Organization invite
export interface OrgInvite {
  id: string;
  org_id: string;
  email: string;
  role: AppRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

// User profile
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// Discipline
export interface Discipline {
  id: string;
  org_id: string;
  name: string;
  code: string;
  color: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Project
export interface Project {
  id: string;
  org_id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  client: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Computed/joined
  systems_count?: number;
  itrs_count?: number;
  punch_count?: number;
}

// System
export interface System {
  id: string;
  org_id: string;
  project_id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined
  project?: Project;
  subsystems_count?: number;
}

// Subsystem
export interface Subsystem {
  id: string;
  org_id: string;
  system_id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined
  system?: System;
  tags_count?: number;
}

// Tag (Equipment)
export interface Tag {
  id: string;
  org_id: string;
  subsystem_id: string;
  discipline_id: string | null;
  tag_number: string;
  description: string | null;
  equipment_type: string | null;
  location: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined
  subsystem?: Subsystem;
  discipline?: Discipline;
  itrs_count?: number;
}

// ITR Template field schema
export interface TemplateField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditionalOn?: {
    fieldId: string;
    value: unknown;
  };
}

// ITR Template step schema
export interface TemplateStep {
  id: string;
  title: string;
  description?: string;
  fields: TemplateField[];
}

// ITR Template schema
export interface TemplateSchema {
  steps: TemplateStep[];
  version: number;
}

// ITR Template
export interface ItrTemplate {
  id: string;
  org_id: string;
  discipline_id: string | null;
  name: string;
  code: string;
  description: string | null;
  version: number;
  is_active: boolean;
  schema_json: TemplateSchema;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  discipline?: Discipline;
}

// ITR (Inspection Test Record)
export interface Itr {
  id: string;
  org_id: string;
  template_id: string;
  tag_id: string;
  itr_number: string;
  status: ItrStatus;
  responses: Record<string, unknown>;
  current_step: number;
  started_at: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  pdf_url: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  template?: ItrTemplate;
  tag?: Tag;
  assigned_user?: Profile;
  created_user?: Profile;
  signoffs?: Signoff[];
}

// Signoff
export interface Signoff {
  id: string;
  org_id: string;
  itr_id: string;
  signoff_type: SignoffType;
  user_id: string;
  signature_data: string | null;
  comments: string | null;
  signed_at: string;
  created_at: string;
  // Joined
  user?: Profile;
}

// Punch Item
export interface PunchItem {
  id: string;
  org_id: string;
  project_id: string;
  system_id: string | null;
  subsystem_id: string | null;
  tag_id: string | null;
  itr_id: string | null;
  punch_number: string;
  title: string;
  description: string | null;
  category: PunchCategory;
  status: PunchStatus;
  priority: number;
  assigned_to: string | null;
  due_date: string | null;
  cleared_at: string | null;
  cleared_by: string | null;
  closed_at: string | null;
  closed_by: string | null;
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  project?: Project;
  system?: System;
  subsystem?: Subsystem;
  tag?: Tag;
  itr?: Itr;
  assigned_user?: Profile;
  created_user?: Profile;
}

// Attachment
export interface Attachment {
  id: string;
  org_id: string;
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  // Joined
  uploader?: Profile;
}

// Audit Log
export interface AuditLog {
  id: string;
  org_id: string | null;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Joined
  user?: Profile;
}
