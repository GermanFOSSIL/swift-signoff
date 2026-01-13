import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAuditLog(filters?: {
  tableName?: string;
  userId?: string;
  recordId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["audit-log", currentOrg?.id, filters],
    queryFn: async () => {
      if (!currentOrg) return [];
      let query = supabase
        .from("audit_log")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false })
        .limit(filters?.limit || 100);

      if (filters?.tableName) query = query.eq("table_name", filters.tableName);
      if (filters?.userId) query = query.eq("user_id", filters.userId);
      if (filters?.recordId) query = query.eq("record_id", filters.recordId);
      if (filters?.action) query = query.eq("action", filters.action);
      if (filters?.startDate) query = query.gte("created_at", filters.startDate);
      if (filters?.endDate) query = query.lte("created_at", filters.endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });
}
