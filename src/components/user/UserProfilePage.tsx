/**
 * User Profile Page Component for ChinaConnect
 * Full page component for viewing user profiles with mock data support
 */

import { CheckInMap } from "@/components/community/CheckInMap";
import { PostCard } from "@/components/community/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MOCK_CHECK_INS,
  MOCK_CHECK_IN_MARKERS,
  MOCK_POSTS,
  MOCK_USERS,
  type MockPost,
  type MockProfile,
} from "@/data/community/mockData";
import { supabase } from "@/supabase/config";
import type { Database } from "@/types/database";
import { useEffect, useState } from "react";
import { UserProfile } from "./UserProfile";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Post = Database["public"]["Tables"]["community_posts"]["Row"];

// Check if we're using real Supabase
const USE_MOCK = !import.meta.env.PUBLIC_SUPABASE_URL;

type TabType = "posts" | "checkins" | "qa" | "map";

interface UserProfilePageProps {
  userId: string;
  isOwnProfile?: boolean;
}

export function UserProfilePage({ userId, isOwnProfile = false }: UserProfilePageProps) {
  const [profile, setProfile] = useState<Profile | MockProfile | null>(null);
  const [posts, setPosts] = useState<(Post | MockPost)[]>([]);
  const [checkIns, setCheckIns] = useState<MockCheckIn[]>([]);
  const [qaPosts, setQaPosts] = useState<(Post | MockPost)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
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
          // Use mock data
          const mockUser = MOCK_USERS.find((u) => u.id === userId);
          if (mockUser) {
            setProfile(mockUser);
            setEditData({
              display_name: mockUser.display_name || "",
              bio: mockUser.bio || "",
              nationality: mockUser.nationality || "",
            });

            // Filter posts by user
            const userPosts = MOCK_POSTS.filter((p) => p.user_id === userId);
            const travelDiaries = userPosts.filter(
              (p) =>
                p.type === "travel_diary" ||
                p.type === "pit_guide" ||
                p.type === "food_discovery" ||
                p.type === "route_share",
            );
            const qa = userPosts.filter((p) => p.type === "qa");

            setPosts(travelDiaries);
            setQaPosts(qa);
            setCheckIns(MOCK_CHECK_INS.filter((c) => c.user_id === userId));
          }
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

          // Fetch user's posts
          const { data: postsData } = await supabase
            .from("community_posts")
            .select("*")
            .eq("user_id", userId)
            .in("type", ["diary", "tip", "review"])
            .order("created_at", { ascending: false });

          setPosts((postsData || []) as Post[]);

          // Fetch Q&A posts
          const { data: qaData } = await supabase
            .from("community_posts")
            .select("*")
            .eq("user_id", userId)
            .eq("type", "question")
            .order("created_at", { ascending: false });

          setQaPosts((qaData || []) as Post[]);

          // Fetch check-ins
          const { data: checkInsData } = await supabase
            .from("check_ins")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          setCheckIns((checkInsData || []) as MockCheckIn[]);
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
        // Mock update (in real app, would update Supabase)
        if (profile) {
          setProfile({
            ...profile,
            display_name: editData.display_name,
            bio: editData.bio,
            nationality: editData.nationality,
          } as MockProfile);
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

  const _handleCheckInSuccess = (checkIn: MockCheckIn, pointsEarned: number) => {
    setCheckIns([checkIn, ...checkIns]);
    if (profile) {
      setProfile({
        ...profile,
        points: (profile.points || 0) + pointsEarned,
      } as MockProfile);
    }
  };

  // Get stats from profile
  const getStats = () => {
    if (USE_MOCK && profile) {
      const mockProfile = profile as MockProfile;
      return {
        postsCount: mockProfile.posts_count,
        checkInsCount: mockProfile.check_ins_count,
        likesReceived: mockProfile.likes_received,
        bestAnswers: mockProfile.best_answers,
      };
    }
    const _p = profile as Profile | null;
    return {
      postsCount: 0,
      checkInsCount: 0,
      likesReceived: 0,
      bestAnswers: 0,
    };
  };

  // Get user's check-in markers
  const getUserMarkers = () => {
    return MOCK_CHECK_IN_MARKERS.filter((m) => m.user_id === userId);
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

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <UserProfile profile={profile as MockProfile} stats={stats} isOwnProfile={isOwnProfile} />

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

      {/* Tabs */}
      <div className="border-b dark:border-gray-700">
        <nav className="flex gap-4 overflow-x-auto">
          {[
            { key: "posts", label: "Travel Diaries", icon: "✈️" },
            { key: "checkins", label: "Check-ins", icon: "📍" },
            { key: "qa", label: "Q&A", icon: "❓" },
            { key: "map", label: "Travel Map", icon: "🗺️" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">✈️</span>
                <p>No travel diaries yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post as MockPost} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Check-ins Tab */}
        {activeTab === "checkins" && (
          <div className="space-y-4">
            {checkIns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📍</span>
                <p>No check-ins yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checkIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-start gap-3"
                  >
                    <span className="text-2xl">📍</span>
                    <div className="flex-1">
                      <div className="font-medium">{checkIn.place_name}</div>
                      <div className="text-sm text-gray-500">{checkIn.city}</div>
                      {checkIn.note && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          "{checkIn.note}"
                        </p>
                      )}
                      {checkIn.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < checkIn.rating ? "text-yellow-500" : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(checkIn.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === "qa" && (
          <div className="space-y-4">
            {qaPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">❓</span>
                <p>No questions asked yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {qaPosts.map((post) => (
                  <PostCard key={post.id} post={post as MockPost} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Travel Map Tab */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <CheckInMap
              markers={getUserMarkers()}
              height="500px"
              className="rounded-lg overflow-hidden"
            />
            {checkIns.length > 0 && (
              <div className="text-center text-sm text-gray-500">
                {checkIns.length} check-ins across {new Set(checkIns.map((c) => c.city)).size}{" "}
                cities
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfilePage;
