import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type PunchItem = Tables<"punch_items">;
type PunchItemInsert = TablesInsert<"punch_items">;
type PunchItemUpdate = TablesUpdate<"punch_items">;

export function usePunchItems(filters?: {
  projectId?: string;
  systemId?: string;
  status?: string;
  category?: string;
  assignedTo?: string;
}) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["punch-items", currentOrg?.id, filters],
    queryFn: async () => {
      if (!currentOrg) return [];
      let query = supabase
        .from("punch_items")
        .select(`
          *,
          project:projects(name, code),
          system:systems(name, code),
          subsystem:subsystems(name, code),
          tag:tags(tag_number),
          itr:itrs(itr_number)
        `)
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (filters?.projectId) query = query.eq("project_id", filters.projectId);
      if (filters?.systemId) query = query.eq("system_id", filters.systemId);
      if (filters?.status) query = query.eq("status", filters.status as PunchItem["status"]);
      if (filters?.category) query = query.eq("category", filters.category as PunchItem["category"]);
      if (filters?.assignedTo) query = query.eq("assigned_to", filters.assignedTo);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });
}

export function usePunchItem(id: string | undefined) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["punch-item", id],
    queryFn: async () => {
      if (!id || !currentOrg) return null;
      const { data, error } = await supabase
        .from("punch_items")
        .select(`
          *,
          project:projects(*),
          system:systems(*),
          subsystem:subsystems(*),
          tag:tags(*),
          itr:itrs(*)
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

export function useCreatePunchItem() {
  const queryClient = useQueryClient();
  const { currentOrg, user } = useAuth();

  return useMutation({
    mutationFn: async (punchItem: Omit<PunchItemInsert, "org_id" | "created_by" | "punch_number">) => {
      if (!currentOrg || !user) throw new Error("No organization selected");
      
      // Generate punch number
      const { count } = await supabase
        .from("punch_items")
        .select("*", { count: "exact", head: true })
        .eq("org_id", currentOrg.id);

      const punchNumber = `PI-${String((count || 0) + 1).padStart(5, "0")}`;

      const { data, error } = await supabase
        .from("punch_items")
        .insert({
          ...punchItem,
          org_id: currentOrg.id,
          created_by: user.id,
          punch_number: punchNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punch-items"] });
      toast.success("Punch item creado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear punch item: " + error.message);
    },
  });
}

export function useUpdatePunchItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...punchItem }: PunchItemUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("punch_items")
        .update(punchItem)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["punch-items"] });
      queryClient.invalidateQueries({ queryKey: ["punch-item", data.id] });
      toast.success("Punch item actualizado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar punch item: " + error.message);
    },
  });
}

export function useClearPunchItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("punch_items")
        .update({
          status: "cleared" as const,
          cleared_at: new Date().toISOString(),
          cleared_by: user.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["punch-items"] });
      queryClient.invalidateQueries({ queryKey: ["punch-item", data.id] });
      toast.success("Punch item marcado como resuelto");
    },
    onError: (error) => {
      toast.error("Error al actualizar punch item: " + error.message);
    },
  });
}

export function useClosePunchItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("punch_items")
        .update({
          status: "closed" as const,
          closed_at: new Date().toISOString(),
          closed_by: user.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["punch-items"] });
      queryClient.invalidateQueries({ queryKey: ["punch-item", data.id] });
      toast.success("Punch item cerrado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al cerrar punch item: " + error.message);
    },
  });
}
