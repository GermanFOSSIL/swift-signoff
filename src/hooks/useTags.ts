import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Tag = Tables<"tags">;
type TagInsert = TablesInsert<"tags">;

export function useTags(subsystemId?: string) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["tags", currentOrg?.id, subsystemId],
    queryFn: async () => {
      if (!currentOrg) return [];
      let query = supabase
        .from("tags")
        .select(`*, subsystem:subsystems(name, code), discipline:disciplines(name, code, color)`)
        .eq("org_id", currentOrg.id)
        .order("tag_number");

      if (subsystemId) query = query.eq("subsystem_id", subsystemId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });
}

export function useTag(id: string | undefined) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["tag", id],
    queryFn: async () => {
      if (!id || !currentOrg) return null;
      const { data, error } = await supabase
        .from("tags")
        .select(`*, subsystem:subsystems(name, code), discipline:disciplines(name, code, color)`)
        .eq("id", id)
        .eq("org_id", currentOrg.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!currentOrg,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async (tag: Omit<TagInsert, "org_id">) => {
      if (!currentOrg) throw new Error("No organization selected");
      const { data, error } = await supabase
        .from("tags")
        .insert({ ...tag, org_id: currentOrg.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag creado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear tag: " + error.message);
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tag }: Partial<Tag> & { id: string }) => {
      const { data, error } = await supabase
        .from("tags")
        .update(tag)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["tag", data.id] });
      toast.success("Tag actualizado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar tag: " + error.message);
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag eliminado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar tag: " + error.message);
    },
  });
}
