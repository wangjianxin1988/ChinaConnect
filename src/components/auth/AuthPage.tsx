/**
 * Auth Page Component
 * Handles login/register UI
 */

import { Button } from "@/components/ui/button";
import { signOut, supabase } from "@/supabase/config";
import type { Database } from "@/types/database";
import { useEffect, useState } from "react";
import { AuthForms } from "./AuthForms";

export function AuthPage() {
  const [user, setUser] = useState<Database["public"]["Tables"]["profiles"]["Row"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUser(profile as Database["public"]["Tables"]["profiles"]["Row"]);
          }
        }
      } catch (err) {
        console.error("Failed to check user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser(profile as Database["public"]["Tables"]["profiles"]["Row"]);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="text-6xl mb-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name || "User"}
                className="w-24 h-24 rounded-full mx-auto object-cover"
              />
            ) : (
              "👤"
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome, {user.display_name || user.email}!</h2>
          <p className="text-muted-foreground mb-6">
            {user.points} points • {user.level}
          </p>
          <div className="space-y-3">
            <a href={`/user/${user.id}`}>
              <Button className="w-full">View Profile</Button>
            </a>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to ChinaConnect</h1>
        <p className="text-muted-foreground">Login or create an account to join the community</p>
      </div>
      <AuthForms />
    </div>
  );
}

export default AuthPage;
