import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Org, UserRole, AppRole } from "@/types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  currentOrg: Org | null;
  userRoles: AppRole[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  refreshProfile: () => Promise<void>;
  setCurrentOrg: (org: Org | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileData) {
      setProfile(profileData as Profile);
    }

    // Fetch org membership and roles
    const { data: memberData } = await supabase
      .from("org_members")
      .select(`
        org_id,
        orgs (*)
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .single();

    if (memberData?.orgs) {
      const org = memberData.orgs as unknown as Org;
      setCurrentOrg(org);

      // Fetch roles for this org
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("org_id", org.id);

      if (rolesData) {
        setUserRoles(rolesData.map((r) => r.role as AppRole));
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer data fetching with setTimeout to avoid deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setCurrentOrg(null);
          setUserRoles([]);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCurrentOrg(null);
    setUserRoles([]);
  };

  const hasRole = (role: AppRole) => userRoles.includes(role);
  const hasAnyRole = (roles: AppRole[]) => roles.some((r) => userRoles.includes(r));

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        currentOrg,
        userRoles,
        isLoading,
        signIn,
        signUp,
        signOut,
        hasRole,
        hasAnyRole,
        refreshProfile,
        setCurrentOrg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
