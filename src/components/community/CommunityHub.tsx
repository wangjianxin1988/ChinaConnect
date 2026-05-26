/**
 * Community Hub Component for ChinaConnect
 * Main community page with all features, supports mock data fallback
 */

import { Button } from "@/components/ui/button";
import { PointsDisplay } from "@/components/user/PointsDisplay";
import {
  CURRENT_MOCK_USER,
  MOCK_CHECK_INS,
  MOCK_CHECK_IN_MARKERS,
  MOCK_POSTS,
  type MockPost,
  type MockProfile,
} from "@/data/community/mockData";
import { supabase } from "@/supabase/config";
import type { Database } from "@/types/database";
import { useEffect, useState } from "react";
import { CheckInForm, RecentCheckIns } from "./CheckIn";
import { CheckInMap } from "./CheckInMap";
import { CityLeaderboard } from "./Leaderboard";
import { PostCard } from "./PostCard";
import { QAFeed, QAPostForm } from "./QAPost";
import { TravelDiaryForm } from "./TravelDiary";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Check if we're using real Supabase
const USE_MOCK = !import.meta.env.PUBLIC_SUPABASE_URL;

type TabType = "feed" | "qa" | "leaderboard" | "checkin";

export function CommunityHub() {
  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [user, setUser] = useState<Profile | MockProfile | null>(null);
  const [posts, setPosts] = useState<(Post | MockPost)[]>([]);
  const [qaPosts, setQaPosts] = useState<(Post | MockPost)[]>([]);
  const [checkIns, setCheckIns] = useState<MockCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (USE_MOCK) {
          // Use mock data
          setUser(CURRENT_MOCK_USER);

          // Filter posts by type
          const feedPosts = MOCK_POSTS.filter(
            (p) =>
              p.type === "travel_diary" ||
              p.type === "pit_guide" ||
              p.type === "food_discovery" ||
              p.type === "route_share",
          );
          const qa = MOCK_POSTS.filter((p) => p.type === "qa");

          setPosts(feedPosts);
          setQaPosts(qa);
          setCheckIns(MOCK_CHECK_INS);
        } else {
          // Use real Supabase data
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profile) {
              setUser(profile as Profile);
            }
          }

          // Fetch recent posts
          const { data: postsData } = await supabase
            .from("posts")
            .select("*, profile:profiles(*)")
            .in("type", ["travel_diary", "pit_guide", "food_discovery", "route_share"])
            .order("created_at", { ascending: false })
            .limit(20);

          setPosts((postsData || []) as Post[]);

          // Fetch Q&A posts
          const { data: qaData } = await supabase
            .from("posts")
            .select("*")
            .eq("type", "qa")
            .order("created_at", { ascending: false })
            .limit(20);

          setQaPosts((qaData || []) as Post[]);

          // Fetch check-ins
          const { data: checkInsData } = await supabase
            .from("check_ins")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

          setCheckIns((checkInsData || []) as MockCheckIn[]);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        // Fallback to mock data on error
        setUser(CURRENT_MOCK_USER);
        setPosts(MOCK_POSTS);
        setCheckIns(MOCK_CHECK_INS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePostCreated = (post: Post | MockPost) => {
    setPosts([post as Post & { profile?: Profile }, ...posts]);
  };

  // Get display name helper
  const getDisplayName = (u: Profile | MockProfile | null) => {
    return u?.display_name || u?.["display_name"] || "User";
  };

  // Get avatar helper
  const getAvatar = (u: Profile | MockProfile | null) => {
    return u?.avatar_url || u?.["avatar_url"] || null;
  };

  // Get points helper
  const getPoints = (u: Profile | MockProfile | null) => {
    return u?.points || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Hub</h1>
          <p className="text-muted-foreground">Explore, share, and connect with travelers</p>
        </div>

        {/* User Info / Login */}
        {user ? (
          <div className="flex items-center gap-4">
            <a
              href={`/user/${user.id || (user as MockProfile).id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {getAvatar(user) ? (
                <img
                  src={getAvatar(user)!}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {getDisplayName(user)?.[0] || "?"}
                </div>
              )}
              <div>
                <div className="font-medium">{getDisplayName(user)}</div>
                <PointsDisplay points={getPoints(user)} size="sm" showProgress={false} />
              </div>
            </a>
          </div>
        ) : (
          <a href="/auth">
            <Button>Login to Participate</Button>
          </a>
        )}
      </div>

      {/* Mock Mode Banner */}
      {USE_MOCK && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <div className="font-medium text-blue-900 dark:text-blue-100">Demo Mode Active</div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This is a preview with sample data. Connect Supabase to enable full functionality with
              user authentication, real posts, and live data.
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {user && (
        <div className="flex flex-wrap gap-3">
          <TravelDiaryForm
            userId={user.id || (user as MockProfile).user_id}
            onPostCreated={handlePostCreated}
          />
          <QAPostForm userId={user.id || (user as MockProfile).user_id} />
          <CheckInForm userId={user.id || (user as MockProfile).user_id} />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b dark:border-gray-700">
        <nav className="flex gap-4 overflow-x-auto">
          {[
            { key: "feed", label: "Feed", icon: "📝" },
            { key: "qa", label: "Q&A", icon: "❓" },
            { key: "leaderboard", label: "Leaderboard", icon: "🏆" },
            { key: "checkin", label: "Check-ins", icon: "📍" },
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
        {/* Feed Tab */}
        {activeTab === "feed" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📝</span>
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to share your travel experience!</p>
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

        {/* Q&A Tab */}
        {activeTab === "qa" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Q&A</h2>
              {user && (
                <QAPostForm
                  userId={user.id || (user as MockProfile).user_id}
                  onPostCreated={(post) =>
                    setQaPosts([post as Post & { profile?: Profile }, ...qaPosts])
                  }
                />
              )}
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <QAFeed posts={qaPosts as Post[]} />
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Check-in Leaderboard</h2>
            <CityLeaderboard />
          </div>
        )}

        {/* Check-ins Tab */}
        {activeTab === "checkin" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Check-in Map</h2>
              {user && <CheckInForm userId={user.id || (user as MockProfile).user_id} />}
            </div>

            {/* Check-in Map */}
            <CheckInMap
              markers={MOCK_CHECK_IN_MARKERS}
              height="450px"
              className="rounded-lg overflow-hidden"
            />

            {/* Recent Check-ins List */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Recent Check-ins</h3>
              {checkIns.length > 0 ? (
                <RecentCheckIns checkIns={checkIns} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">📍</span>
                  <p>No check-ins yet</p>
                  <p className="text-sm">Start exploring and check in to earn points!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityHub;
