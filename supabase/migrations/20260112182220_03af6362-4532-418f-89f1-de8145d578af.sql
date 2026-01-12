-- Fix security warnings

-- 1. Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2. Fix overly permissive RLS policy for audit_log insert
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

-- Create a more restrictive policy - only authenticated users can create audit logs
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_log
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);