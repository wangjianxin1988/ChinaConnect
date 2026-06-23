// @ts-nocheck
/**
 * User Profile Page Component for ChinaConnect
 * Full page component for viewing user profiles
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/supabase/config";
import type { Database } from "@/types/database";
import { useEffect, useState } from "react";
import { UserProfile } from "./UserProfile";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Check if we're using real Supabase
const USE_MOCK = !import.meta.env.PUBLIC_SUPABASE_URL;

interface UserProfilePageProps {
  userId: string;
  isOwnProfile?: boolean;
}

export function UserProfilePage({ userId, isOwnProfile = false }: UserProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: "",
    bio: "",
    nationality: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
            .eq("id", userId)
            .single();

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
  }, [userId]);

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
          .eq("id", userId)
          .select()
          .single();

        if (error) throw error;
        setProfile(data as Profile);
        setIsEditing(false);
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
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <p className="text-gray-500">This user doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <UserProfile profile={profile} stats={stats} isOwnProfile={isOwnProfile} />

      {/* Edit Profile Button (own profile) */}
      {isOwnProfile && !isEditing && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>
      )}

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <Input
                type="text"
                value={editData.display_name}
                onChange={(e) => setEditData((prev) => ({ ...prev, display_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Textarea
                value={editData.bio}
                onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nationality</label>
              <Input
                type="text"
                value={editData.nationality}
                onChange={(e) => setEditData((prev) => ({ ...prev, nationality: e.target.value }))}
                placeholder="e.g., United States"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfilePage;
