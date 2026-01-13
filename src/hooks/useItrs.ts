import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type ItrTemplate = Tables<"itr_templates">;
type ItrTemplateInsert = TablesInsert<"itr_templates">;
type ItrTemplateUpdate = TablesUpdate<"itr_templates">;

type Itr = Tables<"itrs">;
type ItrInsert = TablesInsert<"itrs">;
type ItrUpdate = TablesUpdate<"itrs">;

type Signoff = Tables<"signoffs">;
type SignoffInsert = TablesInsert<"signoffs">;

// ITR Templates
export function useItrTemplates() {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["itr-templates", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("itr_templates")
        .select("*, discipline:disciplines(name, code, color)")
        .eq("org_id", currentOrg.id)
        .order("code");

      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });
}

export function useItrTemplate(id: string | undefined) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["itr-template", id],
    queryFn: async () => {
      if (!id || !currentOrg) return null;
      const { data, error } = await supabase
        .from("itr_templates")
        .select("*, discipline:disciplines(name, code, color)")
        .eq("id", id)
        .eq("org_id", currentOrg.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!currentOrg,
  });
}

export function useCreateItrTemplate() {
  const queryClient = useQueryClient();
  const { currentOrg, user } = useAuth();

  return useMutation({
    mutationFn: async (template: Omit<ItrTemplateInsert, "org_id" | "created_by">) => {
      if (!currentOrg || !user) throw new Error("No organization selected");
      const { data, error } = await supabase
        .from("itr_templates")
        .insert({
          ...template,
          org_id: currentOrg.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itr-templates"] });
      toast.success("Plantilla creada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear plantilla: " + error.message);
    },
  });
}

export function useUpdateItrTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...template }: ItrTemplateUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("itr_templates")
        .update(template)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["itr-templates"] });
      queryClient.invalidateQueries({ queryKey: ["itr-template", data.id] });
      toast.success("Plantilla actualizada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar plantilla: " + error.message);
    },
  });
}

// ITRs
export function useItrs(filters?: { tagId?: string; status?: string; assignedTo?: string }) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["itrs", currentOrg?.id, filters],
    queryFn: async () => {
      if (!currentOrg) return [];
      let query = supabase
        .from("itrs")
        .select(`
          *,
          template:itr_templates(name, code),
          tag:tags(
            tag_number,
            subsystem:subsystems(
              name,
              code,
              system:systems(name, code, project:projects(name, code))
            )
          )
        `)
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (filters?.tagId) query = query.eq("tag_id", filters.tagId);
      if (filters?.status) query = query.eq("status", filters.status as Itr["status"]);
      if (filters?.assignedTo) query = query.eq("assigned_to", filters.assignedTo);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });
}

export function useItr(id: string | undefined) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["itr", id],
    queryFn: async () => {
      if (!id || !currentOrg) return null;
      const { data, error } = await supabase
        .from("itrs")
        .select(`
          *,
          template:itr_templates(*),
          tag:tags(
            *,
            subsystem:subsystems(
              *,
              system:systems(*, project:projects(*))
            ),
            discipline:disciplines(*)
          )
        `)
        .eq("id", id)
        .eq("org_id", currentOrg.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!currentOrg,
  });
}

export function useCreateItr() {
  const queryClient = useQueryClient();
  const { currentOrg, user } = useAuth();

  return useMutation({
    mutationFn: async (itr: Omit<ItrInsert, "org_id" | "created_by">) => {
      if (!currentOrg || !user) throw new Error("No organization selected");
      const { data, error } = await supabase
        .from("itrs")
        .insert({
          ...itr,
          org_id: currentOrg.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itrs"] });
      toast.success("ITR creado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear ITR: " + error.message);
    },
  });
}

export function useUpdateItr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...itr }: ItrUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("itrs")
        .update(itr)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["itrs"] });
      queryClient.invalidateQueries({ queryKey: ["itr", data.id] });
      toast.success("ITR actualizado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar ITR: " + error.message);
    },
  });
}

// Signoffs
export function useSignoffs(itrId: string | undefined) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["signoffs", itrId],
    queryFn: async () => {
      if (!itrId || !currentOrg) return [];
      const { data, error } = await supabase
        .from("signoffs")
        .select("*")
        .eq("itr_id", itrId)
        .eq("org_id", currentOrg.id)
        .order("signed_at");

      if (error) throw error;
      return data;
    },
    enabled: !!itrId && !!currentOrg,
  });
}

export function useCreateSignoff() {
  const queryClient = useQueryClient();
  const { currentOrg, user } = useAuth();

  return useMutation({
    mutationFn: async (signoff: Omit<SignoffInsert, "org_id" | "user_id">) => {
      if (!currentOrg || !user) throw new Error("No organization selected");
      const { data, error } = await supabase
        .from("signoffs")
        .insert({
          ...signoff,
          org_id: currentOrg.id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["signoffs", data.itr_id] });
      queryClient.invalidateQueries({ queryKey: ["itr", data.itr_id] });
      queryClient.invalidateQueries({ queryKey: ["itrs"] });
      toast.success("Firma registrada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al registrar firma: " + error.message);
    },
  });
}
