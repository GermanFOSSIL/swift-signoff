import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useOrgMembers() {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["org-members", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      
      const { data: members, error: membersError } = await supabase
        .from("org_members")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at");

      if (membersError) throw membersError;

      // Fetch profiles and roles separately
      const userIds = members.map(m => m.user_id);
      
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").in("id", userIds),
        supabase.from("user_roles").select("*").eq("org_id", currentOrg.id).in("user_id", userIds),
      ]);

      return members.map(member => ({
        ...member,
        profile: profilesRes.data?.find(p => p.id === member.user_id),
        roles: rolesRes.data?.filter(r => r.user_id === member.user_id) || [],
      }));
    },
    enabled: !!currentOrg,
  });
}

export function useOrgInvites() {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["org-invites", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("org_invites")
        .select("*")
        .eq("org_id", currentOrg.id)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  const { currentOrg, user } = useAuth();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!currentOrg || !user) throw new Error("No organization selected");
      const { data, error } = await supabase
        .from("org_invites")
        .insert({
          org_id: currentOrg.id,
          invited_by: user.id,
          email,
          role: role as "admin" | "inspector" | "supervisor" | "user",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-invites"] });
      toast.success("Invitación enviada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al enviar invitación: " + error.message);
    },
  });
}

export function useDeleteInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("org_invites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-invites"] });
      toast.success("Invitación cancelada");
    },
    onError: (error) => {
      toast.error("Error al cancelar invitación: " + error.message);
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      if (!currentOrg) throw new Error("No organization selected");
      
      await supabase.from("user_roles").delete().eq("org_id", currentOrg.id).eq("user_id", userId);

      const { data, error } = await supabase
        .from("user_roles")
        .insert({
          org_id: currentOrg.id,
          user_id: userId,
          role: role as "admin" | "inspector" | "supervisor" | "user",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members"] });
      toast.success("Rol actualizado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar rol: " + error.message);
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!currentOrg) throw new Error("No organization selected");
      
      await supabase.from("user_roles").delete().eq("org_id", currentOrg.id).eq("user_id", userId);
      const { error } = await supabase.from("org_members").delete().eq("org_id", currentOrg.id).eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members"] });
      toast.success("Miembro eliminado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar miembro: " + error.message);
    },
  });
}
