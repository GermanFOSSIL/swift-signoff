import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Discipline = Tables<"disciplines">;
type DisciplineInsert = TablesInsert<"disciplines">;
type DisciplineUpdate = TablesUpdate<"disciplines">;

export function useDisciplines() {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["disciplines", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("disciplines")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("code");

      if (error) throw error;
      return data as Discipline[];
    },
    enabled: !!currentOrg,
  });
}

export function useDiscipline(id: string | undefined) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["discipline", id],
    queryFn: async () => {
      if (!id || !currentOrg) return null;
      const { data, error } = await supabase
        .from("disciplines")
        .select("*")
        .eq("id", id)
        .eq("org_id", currentOrg.id)
        .single();

      if (error) throw error;
      return data as Discipline;
    },
    enabled: !!id && !!currentOrg,
  });
}

export function useCreateDiscipline() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async (discipline: Omit<DisciplineInsert, "org_id">) => {
      if (!currentOrg) throw new Error("No organization selected");
      const { data, error } = await supabase
        .from("disciplines")
        .insert({
          ...discipline,
          org_id: currentOrg.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplines"] });
      toast.success("Disciplina creada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear disciplina: " + error.message);
    },
  });
}

export function useUpdateDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...discipline }: DisciplineUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("disciplines")
        .update(discipline)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["disciplines"] });
      queryClient.invalidateQueries({ queryKey: ["discipline", data.id] });
      toast.success("Disciplina actualizada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar disciplina: " + error.message);
    },
  });
}

export function useDeleteDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("disciplines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplines"] });
      toast.success("Disciplina eliminada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar disciplina: " + error.message);
    },
  });
}
