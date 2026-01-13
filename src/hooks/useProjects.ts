import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Project = Tables<"projects">;
type ProjectInsert = TablesInsert<"projects">;
type ProjectUpdate = TablesUpdate<"projects">;

export function useProjects() {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["projects", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });
}

export function useProject(id: string | undefined) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id || !currentOrg) return null;
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("org_id", currentOrg.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!currentOrg,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async (project: Omit<ProjectInsert, "org_id">) => {
      if (!currentOrg) throw new Error("No organization selected");
      const { data, error } = await supabase
        .from("projects")
        .insert({ ...project, org_id: currentOrg.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Proyecto creado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear proyecto: " + error.message);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...project }: ProjectUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("projects")
        .update(project)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.id] });
      toast.success("Proyecto actualizado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar proyecto: " + error.message);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Proyecto eliminado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar proyecto: " + error.message);
    },
  });
}
