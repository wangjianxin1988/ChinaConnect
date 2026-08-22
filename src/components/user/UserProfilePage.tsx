// @ts-nocheck
/**
 * User Profile Page Component for ChinaConnect
 * Full page component for viewing user profiles
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/supabase/config";
import { getCurrentUser } from "@/lib/auth/supabase-auth";
import type { Database } from "@/types/database";
import { useEffect, useState } from "react";
import { UserProfile } from "./UserProfile";
import { authT, authLangPrefix, detectAuthLang } from "./auth-strings";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Check if we're using real Supabase
const USE_MOCK = !import.meta.env.PUBLIC_SUPABASE_URL;

interface UserProfilePageProps {
  /** Auth user id. Omitted on statically-rendered pages: resolved client-side. */
  userId?: string;
  isOwnProfile?: boolean;
}

export function UserProfilePage({ userId, isOwnProfile = false }: UserProfilePageProps) {
  const lang = detectAuthLang();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editData, setEditData] = useState({
    display_name: "",
    bio: "",
    nationality: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Resolve the current user client-side when the page is static.
        let uid = userId;
        if (!uid) {
          const user = await getCurrentUser();
          if (!user) {
            setNeedsAuth(true);
            return;
          }
          uid = user.id;
        }

        if (USE_MOCK) {
          // Use mock profile data
          const mockProfile: Profile = {
            id: userId,
            display_name: "Travel Explorer",
            bio: "Passionate about exploring China",
            nationality: "United States",
            avatar_url: null,
            points: 250,
            level: "探索者",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(mockProfile);
          setEditData({
            display_name: mockProfile.display_name || "",
            bio: mockProfile.bio || "",
            nationality: mockProfile.nationality || "",
          });
        } else {
          // Use real Supabase data
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", uid)
            .maybeSingle();

          if (profileError) throw profileError;
          setProfile(profileData as Profile);
          setEditData({
            display_name: profileData.display_name || "",
            bio: profileData.bio || "",
            nationality: profileData.nationality || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, lang]);

  const handleUpdateProfile = async () => {
    try {
      if (USE_MOCK) {
        // Mock update
        if (profile) {
          setProfile({
            ...profile,
            display_name: editData.display_name,
            bio: editData.bio,
            nationality: editData.nationality,
          });
        }
        setIsEditing(false);
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .update({
            display_name: editData.display_name,
            bio: editData.bio,
            nationality: editData.nationality,
          })
          .eq("user_id", profile.user_id || userId)
          .select()
          .single();

        if (error) throw error;
        setProfile(data as Profile);
        setIsEditing(false);
        setNotice({ type: "success", text: authT(lang, "profileUpdateSuccess") });
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const stats = {
    postsCount: 0,
    checkInsCount: 0,
    likesReceived: 0,
    bestAnswers: 0,
  };

  if (needsAuth) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">{authT(lang, "profileSignInRequired")}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{authT(lang, "profileSignInRequiredDesc")}</p>
        <a
          href={authLangPrefix(lang) + "/auth/login"}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {authT(lang, "signIn")}
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl mb-4 block">😕</span>
        <h2 className="text-xl font-semibold mb-2">{authT(lang, "profileUserNotFound")}</h2>
        <p className="text-gray-500">{authT(lang, "profileNotFoundDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <UserProfile profile={profile} stats={stats} isOwnProfile={isOwnProfile} />

      {/* Notice banner */}
      {notice && (
        <div
          className={`rounded-lg p-3 text-sm mb-4 ${
            notice.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* {authT(lang, "profileEdit")} Button (own profile) */}
      {isOwnProfile && !isEditing && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            {authT(lang, "profileEdit")}
          </Button>
        </div>
      )}

      {/* {authT(lang, "profileEdit")} Form */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">{authT(lang, "profileEdit")}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{authT(lang, "profileDisplayName")}</label>
              <Input
                type="text"
                value={editData.display_name}
                onChange={(e) => setEditData((prev) => ({ ...prev, display_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{authT(lang, "profileBio")}</label>
              <Textarea
                value={editData.bio}
                onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{authT(lang, "profileNationality")}</label>
              <Input
                type="text"
                value={editData.nationality}
                onChange={(e) => setEditData((prev) => ({ ...prev, nationality: e.target.value }))}
                placeholder={authT(lang, "profileNationalityPlaceholder")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsEditing(false); setNotice(null); }}>
                {authT(lang, "profileCancel")}
              </Button>
              <Button onClick={handleUpdateProfile}>{authT(lang, "profileSave")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfilePage;
