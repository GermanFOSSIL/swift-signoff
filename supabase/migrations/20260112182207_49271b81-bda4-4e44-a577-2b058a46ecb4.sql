-- =============================================
-- COMPLETIONS MANAGEMENT SAAS - DATABASE SCHEMA
-- =============================================

-- 1. ENUMS
-- =============================================

-- Role types for organization members
CREATE TYPE public.app_role AS ENUM ('admin', 'inspector', 'supervisor', 'user');

-- ITR status machine
CREATE TYPE public.itr_status AS ENUM ('draft', 'in_review', 'approved', 'rejected');

-- Punch item category (A = critical safety, B = other defects, C = minor)
CREATE TYPE public.punch_category AS ENUM ('A', 'B', 'C');

-- Punch item status machine
CREATE TYPE public.punch_status AS ENUM ('open', 'in_progress', 'cleared', 'closed');

-- Org member status
CREATE TYPE public.member_status AS ENUM ('pending', 'active', 'inactive');

-- Signoff type
CREATE TYPE public.signoff_type AS ENUM ('inspector', 'supervisor');

-- =============================================
-- 2. CORE TABLES
-- =============================================

-- Organizations (tenants)
CREATE TABLE public.orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization members (user-to-org mapping)
CREATE TABLE public.org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status public.member_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, user_id)
);

-- User roles (separate table for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, org_id, role)
);

-- Organization invites
CREATE TABLE public.org_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.app_role NOT NULL DEFAULT 'user',
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Disciplines (Electrical, Mechanical, Safety, etc.)
CREATE TABLE public.disciplines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, code)
);

-- =============================================
-- 3. PROJECT HIERARCHY TABLES
-- =============================================

-- Projects
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    location TEXT,
    client TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, code)
);

-- Systems (within projects)
CREATE TABLE public.systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, code)
);

-- Subsystems (within systems)
CREATE TABLE public.subsystems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    system_id UUID NOT NULL REFERENCES public.systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(system_id, code)
);

-- Tags (equipment identifiers)
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    subsystem_id UUID NOT NULL REFERENCES public.subsystems(id) ON DELETE CASCADE,
    discipline_id UUID REFERENCES public.disciplines(id) ON DELETE SET NULL,
    tag_number TEXT NOT NULL,
    description TEXT,
    equipment_type TEXT,
    location TEXT,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, tag_number)
);

-- =============================================
-- 4. ITR TABLES
-- =============================================

-- ITR Templates (form schemas)
CREATE TABLE public.itr_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    discipline_id UUID REFERENCES public.disciplines(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    schema_json JSONB NOT NULL DEFAULT '{"steps": [], "fields": []}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, code, version)
);

-- ITRs (inspection test records - instances)
CREATE TABLE public.itrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.itr_templates(id) ON DELETE RESTRICT,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    itr_number TEXT NOT NULL,
    status public.itr_status NOT NULL DEFAULT 'draft',
    responses JSONB DEFAULT '{}',
    current_step INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    pdf_url TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, itr_number)
);

-- Signoffs (dual sign-off tracking)
CREATE TABLE public.signoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    itr_id UUID NOT NULL REFERENCES public.itrs(id) ON DELETE CASCADE,
    signoff_type public.signoff_type NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    signature_data TEXT,
    comments TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(itr_id, signoff_type)
);

-- =============================================
-- 5. PUNCH LIST TABLE
-- =============================================

CREATE TABLE public.punch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    system_id UUID REFERENCES public.systems(id) ON DELETE SET NULL,
    subsystem_id UUID REFERENCES public.subsystems(id) ON DELETE SET NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE SET NULL,
    itr_id UUID REFERENCES public.itrs(id) ON DELETE SET NULL,
    punch_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category public.punch_category NOT NULL DEFAULT 'B',
    status public.punch_status NOT NULL DEFAULT 'open',
    priority INTEGER DEFAULT 3,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date DATE,
    cleared_at TIMESTAMPTZ,
    cleared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, punch_number)
);

-- =============================================
-- 6. ATTACHMENTS TABLE
-- =============================================

CREATE TABLE public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    file_url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for polymorphic lookup
CREATE INDEX idx_attachments_entity ON public.attachments(entity_type, entity_id);

-- =============================================
-- 7. AUDIT LOG TABLE
-- =============================================

CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.orgs(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for audit log queries
CREATE INDEX idx_audit_log_org ON public.audit_log(org_id);
CREATE INDEX idx_audit_log_table ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_record ON public.audit_log(record_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);

-- =============================================
-- 8. SECURITY DEFINER FUNCTIONS
-- =============================================

-- Get user's org_id (first active membership)
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT org_id 
    FROM public.org_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
    LIMIT 1
$$;

-- Check if user has a specific role in their org
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.org_members om ON ur.org_id = om.org_id AND ur.user_id = om.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role = _role
        AND om.status = 'active'
    )
$$;

-- Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.org_members om ON ur.org_id = om.org_id AND ur.user_id = om.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role = ANY(_roles)
        AND om.status = 'active'
    )
$$;

-- Check if user is member of an org
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.org_members
        WHERE org_id = _org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
$$;

-- Check if user is admin of an org
CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.org_members om ON ur.org_id = om.org_id AND ur.user_id = om.user_id
        WHERE ur.org_id = _org_id
        AND ur.user_id = auth.uid()
        AND ur.role = 'admin'
        AND om.status = 'active'
    )
$$;

-- =============================================
-- 9. ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsystems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itr_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 10. RLS POLICIES
-- =============================================

-- ORGS policies
CREATE POLICY "Users can view their orgs" ON public.orgs
    FOR SELECT USING (public.is_org_member(id));

CREATE POLICY "Users can create orgs" ON public.orgs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update their org" ON public.orgs
    FOR UPDATE USING (public.is_org_admin(id));

-- ORG_MEMBERS policies
CREATE POLICY "Users can view org members" ON public.org_members
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Admins can manage org members" ON public.org_members
    FOR ALL USING (public.is_org_admin(org_id) OR user_id = auth.uid());

-- USER_ROLES policies
CREATE POLICY "Users can view roles in their org" ON public.user_roles
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.is_org_admin(org_id));

-- ORG_INVITES policies
CREATE POLICY "Admins can manage invites" ON public.org_invites
    FOR ALL USING (public.is_org_admin(org_id));

CREATE POLICY "Anyone can view invite by token" ON public.org_invites
    FOR SELECT USING (true);

-- PROFILES policies
CREATE POLICY "Users can view profiles in their org" ON public.profiles
    FOR SELECT USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.org_members om1
            JOIN public.org_members om2 ON om1.org_id = om2.org_id
            WHERE om1.user_id = auth.uid() AND om2.user_id = profiles.id
            AND om1.status = 'active' AND om2.status = 'active'
        )
    );

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- DISCIPLINES policies
CREATE POLICY "Users can view disciplines" ON public.disciplines
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Admins can manage disciplines" ON public.disciplines
    FOR ALL USING (public.is_org_admin(org_id));

-- PROJECTS policies
CREATE POLICY "Users can view projects" ON public.projects
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Users can create projects" ON public.projects
    FOR INSERT WITH CHECK (public.is_org_member(org_id));

CREATE POLICY "Users can update projects" ON public.projects
    FOR UPDATE USING (public.is_org_member(org_id));

CREATE POLICY "Admins can delete projects" ON public.projects
    FOR DELETE USING (public.is_org_admin(org_id));

-- SYSTEMS policies
CREATE POLICY "Users can view systems" ON public.systems
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Users can manage systems" ON public.systems
    FOR ALL USING (public.is_org_member(org_id));

-- SUBSYSTEMS policies
CREATE POLICY "Users can view subsystems" ON public.subsystems
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Users can manage subsystems" ON public.subsystems
    FOR ALL USING (public.is_org_member(org_id));

-- TAGS policies
CREATE POLICY "Users can view tags" ON public.tags
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Users can manage tags" ON public.tags
    FOR ALL USING (public.is_org_member(org_id));

-- ITR_TEMPLATES policies
CREATE POLICY "Users can view templates" ON public.itr_templates
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Admins can manage templates" ON public.itr_templates
    FOR ALL USING (public.is_org_admin(org_id) OR public.has_any_role(ARRAY['admin'::public.app_role, 'supervisor'::public.app_role]));

-- ITRS policies
CREATE POLICY "Users can view ITRs" ON public.itrs
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Users can create ITRs" ON public.itrs
    FOR INSERT WITH CHECK (public.is_org_member(org_id) AND created_by = auth.uid());

CREATE POLICY "Users can update ITRs" ON public.itrs
    FOR UPDATE USING (
        public.is_org_member(org_id) AND 
        (assigned_to = auth.uid() OR created_by = auth.uid() OR public.has_any_role(ARRAY['admin'::public.app_role, 'supervisor'::public.app_role]))
    );

-- SIGNOFFS policies
CREATE POLICY "Users can view signoffs" ON public.signoffs
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Inspectors can sign as inspector" ON public.signoffs
    FOR INSERT WITH CHECK (
        public.is_org_member(org_id) AND
        user_id = auth.uid() AND
        (
            (signoff_type = 'inspector' AND public.has_role('inspector')) OR
            (signoff_type = 'supervisor' AND public.has_role('supervisor'))
        )
    );

-- PUNCH_ITEMS policies
CREATE POLICY "Users can view punch items" ON public.punch_items
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Users can create punch items" ON public.punch_items
    FOR INSERT WITH CHECK (public.is_org_member(org_id) AND created_by = auth.uid());

CREATE POLICY "Users can update punch items" ON public.punch_items
    FOR UPDATE USING (
        public.is_org_member(org_id) AND 
        (assigned_to = auth.uid() OR created_by = auth.uid() OR public.has_any_role(ARRAY['admin'::public.app_role, 'supervisor'::public.app_role]))
    );

-- ATTACHMENTS policies
CREATE POLICY "Users can view attachments" ON public.attachments
    FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Users can upload attachments" ON public.attachments
    FOR INSERT WITH CHECK (public.is_org_member(org_id) AND uploaded_by = auth.uid());

CREATE POLICY "Users can delete own attachments" ON public.attachments
    FOR DELETE USING (uploaded_by = auth.uid() OR public.is_org_admin(org_id));

-- AUDIT_LOG policies (read-only for users)
CREATE POLICY "Users can view audit logs" ON public.audit_log
    FOR SELECT USING (public.is_org_member(org_id));

-- Allow system to insert audit logs
CREATE POLICY "System can insert audit logs" ON public.audit_log
    FOR INSERT WITH CHECK (true);

-- =============================================
-- 11. TRIGGERS FOR AUDIT LOG
-- =============================================

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _org_id UUID;
    _old_data JSONB;
    _new_data JSONB;
BEGIN
    -- Determine org_id from the record
    IF TG_OP = 'DELETE' THEN
        _org_id := COALESCE(OLD.org_id, NULL);
        _old_data := to_jsonb(OLD);
        _new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        _org_id := COALESCE(NEW.org_id, OLD.org_id, NULL);
        _old_data := to_jsonb(OLD);
        _new_data := to_jsonb(NEW);
    ELSE
        _org_id := COALESCE(NEW.org_id, NULL);
        _old_data := NULL;
        _new_data := to_jsonb(NEW);
    END IF;

    INSERT INTO public.audit_log (
        org_id,
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data
    ) VALUES (
        _org_id,
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        _old_data,
        _new_data
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Create audit triggers for main tables
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_systems AFTER INSERT OR UPDATE OR DELETE ON public.systems
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_subsystems AFTER INSERT OR UPDATE OR DELETE ON public.subsystems
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_tags AFTER INSERT OR UPDATE OR DELETE ON public.tags
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_itr_templates AFTER INSERT OR UPDATE OR DELETE ON public.itr_templates
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_itrs AFTER INSERT OR UPDATE OR DELETE ON public.itrs
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_signoffs AFTER INSERT OR UPDATE OR DELETE ON public.signoffs
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_punch_items AFTER INSERT OR UPDATE OR DELETE ON public.punch_items
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- =============================================
-- 12. UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON public.orgs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON public.org_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disciplines_updated_at BEFORE UPDATE ON public.disciplines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_systems_updated_at BEFORE UPDATE ON public.systems
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subsystems_updated_at BEFORE UPDATE ON public.subsystems
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itr_templates_updated_at BEFORE UPDATE ON public.itr_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itrs_updated_at BEFORE UPDATE ON public.itrs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_punch_items_updated_at BEFORE UPDATE ON public.punch_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 13. PROFILE AUTO-CREATE TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 14. STORAGE BUCKET FOR ATTACHMENTS
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'attachments',
    'attachments',
    false,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- Storage RLS policies
CREATE POLICY "Users can view org attachments"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'attachments' AND
    EXISTS (
        SELECT 1 FROM public.org_members
        WHERE user_id = auth.uid()
        AND org_id::text = (storage.foldername(name))[1]
        AND status = 'active'
    )
);

CREATE POLICY "Users can upload org attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'attachments' AND
    EXISTS (
        SELECT 1 FROM public.org_members
        WHERE user_id = auth.uid()
        AND org_id::text = (storage.foldername(name))[1]
        AND status = 'active'
    )
);

CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[2]
);

-- =============================================
-- 15. USEFUL INDEXES
-- =============================================

CREATE INDEX idx_org_members_user ON public.org_members(user_id);
CREATE INDEX idx_org_members_org ON public.org_members(org_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_org ON public.user_roles(org_id);
CREATE INDEX idx_projects_org ON public.projects(org_id);
CREATE INDEX idx_systems_project ON public.systems(project_id);
CREATE INDEX idx_subsystems_system ON public.subsystems(system_id);
CREATE INDEX idx_tags_subsystem ON public.tags(subsystem_id);
CREATE INDEX idx_tags_discipline ON public.tags(discipline_id);
CREATE INDEX idx_itrs_template ON public.itrs(template_id);
CREATE INDEX idx_itrs_tag ON public.itrs(tag_id);
CREATE INDEX idx_itrs_status ON public.itrs(status);
CREATE INDEX idx_punch_items_project ON public.punch_items(project_id);
CREATE INDEX idx_punch_items_status ON public.punch_items(status);
CREATE INDEX idx_punch_items_assigned ON public.punch_items(assigned_to);