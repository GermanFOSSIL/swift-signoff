import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type System = Tables<"systems">;
type SystemInsert = TablesInsert<"systems">;
type Subsystem = Tables<"subsystems">;
type SubsystemInsert = TablesInsert<"subsystems">;

export function useSystems(projectId?: string) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["systems", currentOrg?.id, projectId],
    queryFn: async () => {
      if (!currentOrg) return [];
      let query = supabase
        .from("systems")
        .select("*, project:projects(name, code)")
        .eq("org_id", currentOrg.id)
        .order("code");

      if (projectId) query = query.eq("project_id", projectId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });
}

export function useSystem(id: string | undefined) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["system", id],
    queryFn: async () => {
      if (!id || !currentOrg) return null;
      const { data, error } = await supabase
        .from("systems")
        .select("*, project:projects(name, code)")
        .eq("id", id)
        .eq("org_id", currentOrg.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!currentOrg,
  });
}

export function useCreateSystem() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async (system: Omit<SystemInsert, "org_id">) => {
      if (!currentOrg) throw new Error("No organization selected");
      const { data, error } = await supabase
        .from("systems")
        .insert({ ...system, org_id: currentOrg.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systems"] });
      toast.success("Sistema creado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear sistema: " + error.message);
    },
  });
}

export function useUpdateSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...system }: Partial<System> & { id: string }) => {
      const { data, error } = await supabase
        .from("systems")
        .update(system)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["systems"] });
      queryClient.invalidateQueries({ queryKey: ["system", data.id] });
      toast.success("Sistema actualizado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar sistema: " + error.message);
    },
  });
}

export function useSubsystems(systemId?: string) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["subsystems", currentOrg?.id, systemId],
    queryFn: async () => {
      if (!currentOrg) return [];
      let query = supabase
        .from("subsystems")
        .select("*, system:systems(name, code)")
        .eq("org_id", currentOrg.id)
        .order("code");

      if (systemId) query = query.eq("system_id", systemId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });
}

export function useSubsystem(id: string | undefined) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["subsystem", id],
    queryFn: async () => {
      if (!id || !currentOrg) return null;
      const { data, error } = await supabase
        .from("subsystems")
        .select("*, system:systems(name, code)")
        .eq("id", id)
        .eq("org_id", currentOrg.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!currentOrg,
  });
}

export function useCreateSubsystem() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async (subsystem: Omit<SubsystemInsert, "org_id">) => {
      if (!currentOrg) throw new Error("No organization selected");
      const { data, error } = await supabase
        .from("subsystems")
        .insert({ ...subsystem, org_id: currentOrg.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subsystems"] });
      toast.success("Subsistema creado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear subsistema: " + error.message);
    },
  });
}

export function useUpdateSubsystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...subsystem }: Partial<Subsystem> & { id: string }) => {
      const { data, error } = await supabase
        .from("subsystems")
        .update(subsystem)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subsystems"] });
      queryClient.invalidateQueries({ queryKey: ["subsystem", data.id] });
      toast.success("Subsistema actualizado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar subsistema: " + error.message);
    },
  });
}
