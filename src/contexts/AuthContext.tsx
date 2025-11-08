import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: rolesData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", session.user.id);
              
              // Prioritize roles: admin > doctor > patient
              const roles = rolesData?.map(r => r.role) || [];
              if (roles.includes('admin')) {
                setUserRole('admin');
              } else if (roles.includes('doctor')) {
                setUserRole('doctor');
              } else if (roles.includes('patient')) {
                setUserRole('patient');
              } else {
                setUserRole(null);
              }
            } catch (error) {
              console.error("Error fetching user role:", error);
              setUserRole(null);
            }
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .then(({ data: rolesData }) => {
            // Prioritize roles: admin > doctor > patient
            const roles = rolesData?.map(r => r.role) || [];
            if (roles.includes('admin')) {
              setUserRole('admin');
            } else if (roles.includes('doctor')) {
              setUserRole('doctor');
            } else if (roles.includes('patient')) {
              setUserRole('patient');
            } else {
              setUserRole(null);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      navigate("/dashboard");
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = 'patient') => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role, // Store role in metadata
        },
      },
    });
    
    if (!error && data.user) {
      // Insert the selected role into user_roles table
      await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: role as any
      });
      
      navigate("/dashboard");
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
