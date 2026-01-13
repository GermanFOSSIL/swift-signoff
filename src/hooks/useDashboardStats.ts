import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  projectsCount: number;
  systemsCount: number;
  tagsCount: number;
  itrsTotal: number;
  itrsDraft: number;
  itrsInReview: number;
  itrsApproved: number;
  itrsRejected: number;
  punchTotal: number;
  punchOpen: number;
  punchInProgress: number;
  punchCleared: number;
  punchClosed: number;
  punchByCategory: { category: string; count: number }[];
  completionRate: number;
}

export function useDashboardStats() {
  const { currentOrg } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", currentOrg?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!currentOrg) {
        return {
          projectsCount: 0,
          systemsCount: 0,
          tagsCount: 0,
          itrsTotal: 0,
          itrsDraft: 0,
          itrsInReview: 0,
          itrsApproved: 0,
          itrsRejected: 0,
          punchTotal: 0,
          punchOpen: 0,
          punchInProgress: 0,
          punchCleared: 0,
          punchClosed: 0,
          punchByCategory: [],
          completionRate: 0,
        };
      }

      // Fetch all counts in parallel
      const [
        projectsResult,
        systemsResult,
        tagsResult,
        itrsResult,
        punchResult,
      ] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("org_id", currentOrg.id),
        supabase.from("systems").select("id", { count: "exact", head: true }).eq("org_id", currentOrg.id),
        supabase.from("tags").select("id", { count: "exact", head: true }).eq("org_id", currentOrg.id),
        supabase.from("itrs").select("status").eq("org_id", currentOrg.id),
        supabase.from("punch_items").select("status, category").eq("org_id", currentOrg.id),
      ]);

      const itrs = itrsResult.data || [];
      const punchItems = punchResult.data || [];

      const itrsDraft = itrs.filter((i) => i.status === "draft").length;
      const itrsInReview = itrs.filter((i) => i.status === "in_review").length;
      const itrsApproved = itrs.filter((i) => i.status === "approved").length;
      const itrsRejected = itrs.filter((i) => i.status === "rejected").length;

      const punchOpen = punchItems.filter((p) => p.status === "open").length;
      const punchInProgress = punchItems.filter((p) => p.status === "in_progress").length;
      const punchCleared = punchItems.filter((p) => p.status === "cleared").length;
      const punchClosed = punchItems.filter((p) => p.status === "closed").length;

      const punchByCategory = ["A", "B", "C"].map((cat) => ({
        category: cat,
        count: punchItems.filter((p) => p.category === cat).length,
      }));

      const completionRate = itrs.length > 0 ? Math.round((itrsApproved / itrs.length) * 100) : 0;

      return {
        projectsCount: projectsResult.count || 0,
        systemsCount: systemsResult.count || 0,
        tagsCount: tagsResult.count || 0,
        itrsTotal: itrs.length,
        itrsDraft,
        itrsInReview,
        itrsApproved,
        itrsRejected,
        punchTotal: punchItems.length,
        punchOpen,
        punchInProgress,
        punchCleared,
        punchClosed,
        punchByCategory,
        completionRate,
      };
    },
    enabled: !!currentOrg,
  });
}
