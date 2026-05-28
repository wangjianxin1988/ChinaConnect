/**
 * Mock Data for ChinaConnect Community System
 * Used when Supabase is not configured
 */

import type { UserLevel } from "@/types/database";

// User Level thresholds
export const LEVEL_THRESHOLDS = {
  小白: 0,
  探索者: 100,
  旅行家: 500,
  中国通: 1000,
  传奇: 5000,
} as const;

// Points configuration
export const POINTS = {
  POST: 10,
  LIKE_RECEIVED: 2,
  BEST_ANSWER: 50,
  CHECK_IN: 5,
  ROUTE_SHARE: 15,
} as const;

// Helper functions
export function calculateLevel(points: number): UserLevel {
  if (points >= LEVEL_THRESHOLDS.传奇) return "传奇";
  if (points >= LEVEL_THRESHOLDS.中国通) return "中国通";
  if (points >= LEVEL_THRESHOLDS.旅行家) return "旅行家";
  if (points >= LEVEL_THRESHOLDS.探索者) return "探索者";
  return "小白";
}

export function getPointsToNextLevel(points: number): number | null {
  if (points >= LEVEL_THRESHOLDS.传奇) return null;
  if (points >= LEVEL_THRESHOLDS.中国通) return LEVEL_THRESHOLDS.传奇 - points;
  if (points >= LEVEL_THRESHOLDS.旅行家) return LEVEL_THRESHOLDS.中国通 - points;
  if (points >= LEVEL_THRESHOLDS.探索者) return LEVEL_THRESHOLDS.旅行家 - points;
  return LEVEL_THRESHOLDS.探索者 - points;
}

// Mock User Profile type
export interface MockProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  nationality: string | null;
  bio: string | null;
  level: UserLevel;
  points: number;
  posts_count: number;
  check_ins_count: number;
  likes_received: number;
  best_answers: number;
  countries_visited: number;
  created_at: string;
}

// Mock Post type
export interface MockPost {
  id: string;
  user_id: string;
  profile?: MockProfile;
  type: "travel_diary" | "pit_guide" | "qa" | "food_discovery" | "route_share";
  title: string;
  content: string;
  city: string | null;
  images: string[];
  tags: string[];
  likes_count: number;
  comments_count: number;
  is_best_answer: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// Mock Check-In type
export interface MockCheckIn {
  id: string;
  user_id: string;
  place_name: string;
  city: string;
  lat: number | null;
  lng: number | null;
  note: string | null;
  rating: number | null;
  photo_url: string | null;
  created_at: string;
}

// Mock Users
export const MOCK_USERS: MockProfile[] = [
  {
    id: "mock-user-1",
    user_id: "auth-mock-1",
    display_name: "Sarah Johnson",
    avatar_url: "https://i.pravatar.cc/150?u=sarah",
    nationality: "United States",
    bio: "Travel blogger exploring Asia. Love authentic local food and hidden gems!",
    level: "中国通",
    points: 2350,
    posts_count: 45,
    check_ins_count: 128,
    likes_received: 892,
    best_answers: 12,
    countries_visited: 8,
    created_at: "2025-06-15T10:00:00Z",
  },
  {
    id: "mock-user-2",
    user_id: "auth-mock-2",
    display_name: "Michael Chen",
    avatar_url: "https://i.pravatar.cc/150?u=michael",
    nationality: "Singapore",
    bio: "Chinese-American exploring my heritage. Food enthusiast and photography lover.",
    level: "旅行家",
    points: 680,
    posts_count: 23,
    check_ins_count: 56,
    likes_received: 234,
    best_answers: 5,
    countries_visited: 3,
    created_at: "2025-08-22T14:30:00Z",
  },
  {
    id: "mock-user-3",
    user_id: "auth-mock-3",
    display_name: "Emma Williams",
    avatar_url: "https://i.pravatar.cc/150?u=emma",
    nationality: "United Kingdom",
    bio: "First time in China! Learning Mandarin and discovering amazing places.",
    level: "探索者",
    points: 245,
    posts_count: 12,
    check_ins_count: 34,
    likes_received: 89,
    best_answers: 2,
    countries_visited: 2,
    created_at: "2025-11-10T08:15:00Z",
  },
  {
    id: "mock-user-4",
    user_id: "auth-mock-4",
    display_name: "Takeshi Yamamoto",
    avatar_url: "https://i.pravatar.cc/150?u=takeshi",
    nationality: "Japan",
    bio: "Japanese photographer documenting life across China.",
    level: "传奇",
    points: 8750,
    posts_count: 156,
    check_ins_count: 423,
    likes_received: 3456,
    best_answers: 45,
    countries_visited: 15,
    created_at: "2024-12-01T06:00:00Z",
  },
  {
    id: "mock-user-5",
    user_id: "auth-mock-5",
    display_name: "Lisa Mueller",
    avatar_url: "https://i.pravatar.cc/150?u=lisa",
    nationality: "Germany",
    bio: "Business traveler based in Shanghai. Sharing tips for expats!",
    level: "旅行家",
    points: 520,
    posts_count: 18,
    check_ins_count: 67,
    likes_received: 156,
    best_answers: 3,
    countries_visited: 4,
    created_at: "2025-09-05T16:45:00Z",
  },
  {
    id: "mock-user-6",
    user_id: "auth-mock-6",
    display_name: "Yuki Tanaka",
    avatar_url: "https://i.pravatar.cc/150?u=yuki",
    nationality: "Japan",
    bio: "Solo female traveler. Tea ceremony enthusiast and garden lover.",
    level: "旅行家",
    points: 890,
    posts_count: 35,
    check_ins_count: 92,
    likes_received: 456,
    best_answers: 8,
    countries_visited: 6,
    created_at: "2025-03-20T09:30:00Z",
  },
  {
    id: "mock-user-7",
    user_id: "auth-mock-7",
    display_name: "Carlos Rodriguez",
    avatar_url: "https://i.pravatar.cc/150?u=carlos",
    nationality: "Spain",
    bio: "Expat living in Beijing. Photographer and food lover. 3 years in China.",
    level: "中国通",
    points: 1680,
    posts_count: 67,
    check_ins_count: 189,
    likes_received: 723,
    best_answers: 15,
    countries_visited: 5,
    created_at: "2025-01-10T11:20:00Z",
  },
  {
    id: "mock-user-8",
    user_id: "auth-mock-8",
    display_name: "Aisha Patel",
    avatar_url: "https://i.pravatar.cc/150?u=aisha",
    nationality: "India",
    bio: "Digital nomad exploring China. Tech startup advisor by day.",
    level: "探索者",
    points: 320,
    posts_count: 15,
    check_ins_count: 41,
    likes_received: 112,
    best_answers: 3,
    countries_visited: 3,
    created_at: "2025-10-15T07:45:00Z",
  },
  {
    id: "mock-user-9",
    user_id: "auth-mock-9",
    display_name: "Thomas Berg",
    avatar_url: "https://i.pravatar.cc/150?u=thomas",
    nationality: "Sweden",
    bio: "Adventure seeker. Hiking the Great Wall multiple times.",
    level: "旅行家",
    points: 740,
    posts_count: 28,
    check_ins_count: 78,
    likes_received: 298,
    best_answers: 6,
    countries_visited: 7,
    created_at: "2025-05-01T13:00:00Z",
  },
  {
    id: "mock-user-10",
    user_id: "auth-mock-10",
    display_name: "Sophie Martin",
    avatar_url: "https://i.pravatar.cc/150?u=sophie",
    nationality: "France",
    bio: "French photographer. Specializing in Chinese architecture and street life.",
    level: "中国通",
    points: 2100,
    posts_count: 82,
    check_ins_count: 215,
    likes_received: 1024,
    best_answers: 18,
    countries_visited: 4,
    created_at: "2025-02-28T15:30:00Z",
  },
];

// Mock Posts
export const MOCK_POSTS: MockPost[] = [
  {
    id: "post-1",
    user_id: "mock-user-1",
    profile: MOCK_USERS[0],
    type: "travel_diary",
    title: "Amazing Hidden Gems in Beijing Hutongs",
    content:
      "Just spent two days exploring the ancient hutongs of Beijing. Found some incredible local tea houses and traditional courtyard restaurants that most tourists never discover. The narrow alleys tell stories of a thousand years of history...",
    city: "Beijing",
    images: [
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800",
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800",
    ],
    tags: ["hutong", "culture", "history", "photography"],
    likes_count: 234,
    comments_count: 45,
    is_best_answer: false,
    is_featured: true,
    created_at: "2026-05-20T10:30:00Z",
    updated_at: "2026-05-20T10:30:00Z",
  },
  {
    id: "post-2",
    user_id: "mock-user-2",
    profile: MOCK_USERS[1],
    type: "pit_guide",
    title: "Warning: Taxi Scam at Shanghai Airport",
    content:
      "Heads up! I was just scammed 200 RMB by a fake taxi driver at Pudong Airport. They charge flat rates and refuse to use the meter. Always insist on the meter or use Didi!",
    city: "Shanghai",
    images: [],
    tags: ["safety", "scam", "airport", "tips"],
    likes_count: 567,
    comments_count: 89,
    is_best_answer: false,
    is_featured: false,
    created_at: "2026-05-19T15:45:00Z",
    updated_at: "2026-05-19T15:45:00Z",
  },
  {
    id: "post-3",
    user_id: "mock-user-4",
    profile: MOCK_USERS[3],
    type: "food_discovery",
    title: "Best Street Food in Chengdu - Local Guide",
    content:
      "After 6 months in Chengdu, here are my top 10 street food spots that locals love. From mapo tofu to dan dan noodles, this city is a food paradise!",
    city: "Chengdu",
    images: ["https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800"],
    tags: ["food", "street-food", "chengdu", "local"],
    likes_count: 892,
    comments_count: 134,
    is_best_answer: false,
    is_featured: true,
    created_at: "2026-05-18T09:00:00Z",
    updated_at: "2026-05-18T09:00:00Z",
  },
  {
    id: "post-4",
    user_id: "mock-user-3",
    profile: MOCK_USERS[2],
    type: "qa",
    title: "How do I buy train tickets online?",
    content:
      "I want to travel from Beijing to Xi'an by high-speed rail but I can't figure out how to book tickets. The website seems confusing and I'm not sure if I need a Chinese ID. Any tips?",
    city: "Beijing",
    images: [],
    tags: ["transport", "train", "booking"],
    likes_count: 45,
    comments_count: 23,
    is_best_answer: true,
    is_featured: false,
    created_at: "2026-05-17T14:20:00Z",
    updated_at: "2026-05-17T14:20:00Z",
  },
  {
    id: "post-5",
    user_id: "mock-user-5",
    profile: MOCK_USERS[4],
    type: "route_share",
    title: "3-Day Hangzhou Weekend Getaway Itinerary",
    content:
      "Perfect for business travelers! This route covers West Lake at sunrise, the tea plantations, and the best local restaurants. Includes practical tips for avoiding crowds.",
    city: "Hangzhou",
    images: ["https://images.unsplash.com/photo-1537531383496-f4749b85ceb3?w=800"],
    tags: ["itinerary", "weekend", "hangzhou", "tips"],
    likes_count: 345,
    comments_count: 67,
    is_best_answer: false,
    is_featured: false,
    created_at: "2026-05-16T11:15:00Z",
    updated_at: "2026-05-16T11:15:00Z",
  },
  {
    id: "post-6",
    user_id: "mock-user-1",
    profile: MOCK_USERS[0],
    type: "travel_diary",
    title: "Sunrise at Yellow Mountain - Unforgettable!",
    content:
      "Woke up at 4 AM to catch the famous sea of clouds. The view was absolutely breathtaking! Pro tip: stay at the summit hotel for the best experience.",
    city: "Huangshan",
    images: ["https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800"],
    tags: ["nature", "hiking", "sunrise", "huangshan"],
    likes_count: 456,
    comments_count: 78,
    is_best_answer: false,
    is_featured: true,
    created_at: "2026-05-15T08:00:00Z",
    updated_at: "2026-05-15T08:00:00Z",
  },
  {
    id: "post-7",
    user_id: "mock-user-4",
    profile: MOCK_USERS[3],
    type: "pit_guide",
    title: "Avoid This Restaurant near Bund!",
    content:
      "Terrible tourist trap! Overpriced, mediocre food, and pushy servers. Stick to the smaller restaurants a few blocks away for authentic Shanghainese cuisine.",
    city: "Shanghai",
    images: [],
    tags: ["food", "warning", "scam", "tips"],
    likes_count: 234,
    comments_count: 45,
    is_best_answer: false,
    is_featured: false,
    created_at: "2026-05-14T16:30:00Z",
    updated_at: "2026-05-14T16:30:00Z",
  },
  {
    id: "post-8",
    user_id: "mock-user-2",
    profile: MOCK_USERS[1],
    type: "qa",
    title: "Best eSIM for China travel?",
    content:
      "Looking for reliable data coverage in China. Should I get a local SIM or use an eSIM? Which providers work best for foreigners?",
    city: null,
    images: [],
    tags: ["technology", "sim-card", "internet"],
    likes_count: 123,
    comments_count: 56,
    is_best_answer: false,
    is_featured: false,
    created_at: "2026-05-13T10:45:00Z",
    updated_at: "2026-05-13T10:45:00Z",
  },
  {
    id: "post-9",
    user_id: "mock-user-6",
    profile: MOCK_USERS[5],
    type: "travel_diary",
    title: "Morning Tea Culture in Guangzhou",
    content:
      "Finally experienced authentic yum cha! The dim sum at this tiny local spot was incredible. Locals here take their tea seriously - tables packed from 7 AM onwards.",
    city: "Guangzhou",
    images: ["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800"],
    tags: ["food", "dim-sum", "guangzhou", "culture"],
    likes_count: 378,
    comments_count: 62,
    is_best_answer: false,
    is_featured: true,
    created_at: "2026-05-12T08:30:00Z",
    updated_at: "2026-05-12T08:30:00Z",
  },
  {
    id: "post-10",
    user_id: "mock-user-7",
    profile: MOCK_USERS[6],
    type: "food_discovery",
    title: "Ultimate Xi'an Food Street Guide",
    content:
      "From biangbiang面 to roujiamo, Xi'an is a street food paradise! Here is my complete guide to the Muslim Quarter food scene including hidden gems.",
    city: "Xi'an",
    images: ["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800"],
    tags: ["food", "street-food", "xian", "muslim-quarter"],
    likes_count: 645,
    comments_count: 98,
    is_best_answer: false,
    is_featured: true,
    created_at: "2026-05-11T12:00:00Z",
    updated_at: "2026-05-11T12:00:00Z",
  },
  {
    id: "post-11",
    user_id: "mock-user-9",
    profile: MOCK_USERS[8],
    type: "travel_diary",
    title: "Great Wall at Mutianyu - Tips for Hikers",
    content:
      "Skip Badaling and head to Mutianyu! Less crowded, fully restored, and amazing hiking trails between watchtowers. Bring hiking boots and plenty of water.",
    city: "Beijing",
    images: ["https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800"],
    tags: ["hiking", "great-wall", "mutianyu", "adventure"],
    likes_count: 534,
    comments_count: 76,
    is_best_answer: false,
    is_featured: false,
    created_at: "2026-05-10T09:15:00Z",
    updated_at: "2026-05-10T09:15:00Z",
  },
  {
    id: "post-12",
    user_id: "mock-user-8",
    profile: MOCK_USERS[7],
    type: "qa",
    title: "Is Alipay enough for payments in China?",
    content:
      "Planning my first trip. Can I survive with just Alipay or do I need WeChat Pay too? What about credit cards at hotels?",
    city: null,
    images: [],
    tags: ["payment", "alipay", "wechat-pay", "tips"],
    likes_count: 189,
    comments_count: 45,
    is_best_answer: true,
    is_featured: false,
    created_at: "2026-05-09T14:30:00Z",
    updated_at: "2026-05-09T14:30:00Z",
  },
  {
    id: "post-13",
    user_id: "mock-user-10",
    profile: MOCK_USERS[9],
    type: "travel_diary",
    title: "Suzhou Classical Gardens Photography Guide",
    content:
      "The light through the lattice windows at Humble Administrator's Garden at 7 AM is magical. Here are my best shooting spots and times for the UNESCO gardens.",
    city: "Suzhou",
    images: ["https://images.unsplash.com/photo-1537531383496-f4749bce9441?w=800"],
    tags: ["photography", "gardens", "suzhou", "tips"],
    likes_count: 423,
    comments_count: 54,
    is_best_answer: false,
    is_featured: true,
    created_at: "2026-05-08T07:00:00Z",
    updated_at: "2026-05-08T07:00:00Z",
  },
  {
    id: "post-14",
    user_id: "mock-user-4",
    profile: MOCK_USERS[3],
    type: "route_share",
    title: "Epic 10-Day Yunnan Road Trip Itinerary",
    content:
      "Kunming to Dali to Lijiang and Tiger Leaping Gorge. This route covers the best of Yunnan with detailed transport and accommodation tips.",
    city: "Dali",
    images: ["https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800"],
    tags: ["road-trip", "yunnan", "itinerary", "adventure"],
    likes_count: 1123,
    comments_count: 178,
    is_best_answer: false,
    is_featured: true,
    created_at: "2026-05-07T11:00:00Z",
    updated_at: "2026-05-07T11:00:00Z",
  },
  {
    id: "post-15",
    user_id: "mock-user-6",
    profile: MOCK_USERS[5],
    type: "travel_diary",
    title: "Erhai Lake Cycling - A Dream Experience",
    content:
      "Cycling around Erhai Lake in Dali was absolutely magical. The morning mist, fishing villages, and fresh air made it an unforgettable experience. Rented a bike for just 60 CNY.",
    city: "Dali",
    images: ["https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800"],
    tags: ["cycling", "dali", "erhai", "nature"],
    likes_count: 678,
    comments_count: 87,
    is_best_answer: false,
    is_featured: true,
    created_at: "2026-05-06T08:00:00Z",
    updated_at: "2026-05-06T08:00:00Z",
  },
  {
    id: "post-16",
    user_id: "mock-user-9",
    profile: MOCK_USERS[8],
    type: "qa",
    title: "Best time to see pandas in Chengdu?",
    content:
      "Planning a visit to the Panda Base. What time of day do pandas seem most active? Any tips for seeing baby pandas?",
    city: "Chengdu",
    images: [],
    tags: ["pandas", "chengdu", "tips", "wildlife"],
    likes_count: 234,
    comments_count: 67,
    is_best_answer: false,
    is_featured: false,
    created_at: "2026-05-05T16:00:00Z",
    updated_at: "2026-05-05T16:00:00Z",
  },
  {
    id: "post-17",
    user_id: "mock-user-7",
    profile: MOCK_USERS[6],
    type: "food_discovery",
    title: "Chongqing Hot Pot - A First Timer's Guide",
    content:
      "My first hot pot experience was intense! The numbing Sichuan pepper is no joke. Here is what to order and how to handle the spice level.",
    city: "Chongqing",
    images: ["https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800"],
    tags: ["food", "hot-pot", "chongqing", "spicy"],
    likes_count: 456,
    comments_count: 72,
    is_best_answer: false,
    is_featured: false,
    created_at: "2026-05-04T12:30:00Z",
    updated_at: "2026-05-04T12:30:00Z",
  },
  {
    id: "post-18",
    user_id: "mock-user-10",
    profile: MOCK_USERS[9],
    type: "pit_guide",
    title: "Warning: Li River Cruise Booking Scams",
    content:
      "Be careful when booking Li River cruises in Guilin! Unofficial agents charge 3x the official price. Always book through your hotel or the official dock.",
    city: "Guilin",
    images: [],
    tags: ["safety", "scam", "guilin", "tips"],
    likes_count: 345,
    comments_count: 43,
    is_best_answer: false,
    is_featured: false,
    created_at: "2026-05-03T10:15:00Z",
    updated_at: "2026-05-03T10:15:00Z",
  },
  {
    id: "post-19",
    user_id: "mock-user-5",
    profile: MOCK_USERS[4],
    type: "route_share",
    title: "Weekend in Nanjing - History and Food Itinerary",
    content:
      "Perfect 3-day Nanjing itinerary covering Sun Yat-sen Mausoleum, Ming Xiaoling, Massacre Memorial, and the best duck blood soup spots.",
    city: "Nanjing",
    images: ["https://images.unsplash.com/photo-1598001725608-9c77cf5fd730?w=800"],
    tags: ["itinerary", "nanjing", "history", "weekend"],
    likes_count: 287,
    comments_count: 38,
    is_best_answer: false,
    is_featured: false,
    created_at: "2026-05-02T09:00:00Z",
    updated_at: "2026-05-02T09:00:00Z",
  },
  {
    id: "post-20",
    user_id: "mock-user-3",
    profile: MOCK_USERS[2],
    type: "qa",
    title: "Do I need a VPN in China?",
    content:
      "I am planning a 2-week trip and wondering if I really need a VPN. Which ones actually work? Should I set it up before arriving?",
    city: null,
    images: [],
    tags: ["technology", "vpn", "internet", "tips"],
    likes_count: 312,
    comments_count: 89,
    is_best_answer: true,
    is_featured: false,
    created_at: "2026-05-01T15:00:00Z",
    updated_at: "2026-05-01T15:00:00Z",
  },
];

// Mock Check-Ins
export const MOCK_CHECK_INS: MockCheckIn[] = [
  {
    id: "checkin-1",
    user_id: "mock-user-1",
    place_name: "Forbidden City",
    city: "Beijing",
    lat: 39.9163,
    lng: 116.3972,
    note: "Amazing history! Spent 4 hours exploring.",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-20T14:00:00Z",
  },
  {
    id: "checkin-2",
    user_id: "mock-user-1",
    place_name: "The Bund",
    city: "Shanghai",
    lat: 31.2405,
    lng: 121.4901,
    note: "Beautiful night view!",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-19T20:00:00Z",
  },
  {
    id: "checkin-3",
    user_id: "mock-user-2",
    place_name: "Yu Garden",
    city: "Shanghai",
    lat: 31.2275,
    lng: 121.5403,
    note: "Peaceful oasis in the city",
    rating: 4,
    photo_url: null,
    created_at: "2026-05-18T11:00:00Z",
  },
  {
    id: "checkin-4",
    user_id: "mock-user-4",
    place_name: "Giant Panda Base",
    city: "Chengdu",
    lat: 30.7378,
    lng: 103.9483,
    note: "So cute!",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-17T09:30:00Z",
  },
  {
    id: "checkin-5",
    user_id: "mock-user-3",
    place_name: "West Lake",
    city: "Hangzhou",
    lat: 30.2465,
    lng: 120.1485,
    note: "Romantic boat ride",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-16T15:00:00Z",
  },
  {
    id: "checkin-6",
    user_id: "mock-user-5",
    place_name: "Terracotta Army",
    city: "Xi'an",
    lat: 34.3846,
    lng: 109.2785,
    note: "Incredible history!",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-15T10:00:00Z",
  },
  {
    id: "checkin-7",
    user_id: "mock-user-6",
    place_name: "Canton Tower",
    city: "Guangzhou",
    lat: 23.1185,
    lng: 113.3185,
    note: "Stunning city views at night",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-14T20:30:00Z",
  },
  {
    id: "checkin-8",
    user_id: "mock-user-7",
    place_name: "Muslim Quarter",
    city: "Xi'an",
    lat: 34.2615,
    lng: 108.9435,
    note: "Amazing street food!",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-13T19:00:00Z",
  },
  {
    id: "checkin-9",
    user_id: "mock-user-9",
    place_name: "Great Wall (Mutianyu)",
    city: "Beijing",
    lat: 40.4316,
    lng: 116.5669,
    note: "Epic hiking experience!",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-12T10:00:00Z",
  },
  {
    id: "checkin-10",
    user_id: "mock-user-10",
    place_name: "Humble Administrator's Garden",
    city: "Suzhou",
    lat: 31.3222,
    lng: 120.6372,
    note: "Peaceful morning in the gardens",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-11T08:00:00Z",
  },
  {
    id: "checkin-11",
    user_id: "mock-user-6",
    place_name: "Erhai Lake",
    city: "Dali",
    lat: 25.7522,
    lng: 100.1872,
    note: "Perfect cycling conditions",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-10T09:00:00Z",
  },
  {
    id: "checkin-12",
    user_id: "mock-user-4",
    place_name: "Li River Cruise",
    city: "Guilin",
    lat: 25.1835,
    lng: 110.4275,
    note: "Magical karst scenery",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-09T08:30:00Z",
  },
  {
    id: "checkin-13",
    user_id: "mock-user-8",
    place_name: "Nanshan Tree Shadow Platform",
    city: "Chongqing",
    lat: 29.5422,
    lng: 106.6182,
    note: "Breathtaking night skyline",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-08T20:30:00Z",
  },
  {
    id: "checkin-14",
    user_id: "mock-user-7",
    place_name: "Xuanwu Lake",
    city: "Nanjing",
    lat: 32.0822,
    lng: 118.7772,
    note: "Beautiful cherry blossoms",
    rating: 5,
    photo_url: null,
    created_at: "2026-05-07T10:00:00Z",
  },
  {
    id: "checkin-15",
    user_id: "mock-user-10",
    place_name: "Ping An Finance Center",
    city: "Shenzhen",
    lat: 22.5222,
    lng: 114.0572,
    note: "Best view in Shenzhen!",
    rating: 4,
    photo_url: null,
    created_at: "2026-05-06T18:00:00Z",
  },
];

// Current logged-in mock user (for demo purposes)
export const CURRENT_MOCK_USER = MOCK_USERS[0];

// Leaderboard data
export const MOCK_LEADERBOARD = MOCK_USERS.sort((a, b) => b.points - a.points).map(
  (user, index) => ({
    ...user,
    rank: index + 1,
    check_ins_count: user.check_ins_count,
  }),
);

// City check-in counts (for leaderboard)
export const MOCK_CITY_LEADERBOARD: Record<string, MockProfile[]> = {
  Beijing: MOCK_USERS.filter(
    (u) =>
      u.id === "mock-user-1" ||
      u.id === "mock-user-3" ||
      u.id === "mock-user-7" ||
      u.id === "mock-user-9",
  ).sort((a, b) => b.check_ins_count - a.check_ins_count),
  Shanghai: MOCK_USERS.filter(
    (u) =>
      u.id === "mock-user-1" ||
      u.id === "mock-user-2" ||
      u.id === "mock-user-5" ||
      u.id === "mock-user-7",
  ).sort((a, b) => b.check_ins_count - a.check_ins_count),
  Chengdu: MOCK_USERS.filter((u) => u.id === "mock-user-4" || u.id === "mock-user-9").sort(
    (a, b) => b.check_ins_count - a.check_ins_count,
  ),
  Hangzhou: MOCK_USERS.filter((u) => u.id === "mock-user-3" || u.id === "mock-user-5").sort(
    (a, b) => b.check_ins_count - a.check_ins_count,
  ),
  Guangzhou: MOCK_USERS.filter((u) => u.id === "mock-user-6").sort(
    (a, b) => b.check_ins_count - a.check_ins_count,
  ),
  "Xi'an": MOCK_USERS.filter((u) => u.id === "mock-user-5" || u.id === "mock-user-7").sort(
    (a, b) => b.check_ins_count - a.check_ins_count,
  ),
  Guilin: MOCK_USERS.filter((u) => u.id === "mock-user-4").sort(
    (a, b) => b.check_ins_count - a.check_ins_count,
  ),
  Suzhou: MOCK_USERS.filter((u) => u.id === "mock-user-10").sort(
    (a, b) => b.check_ins_count - a.check_ins_count,
  ),
  Dali: MOCK_USERS.filter((u) => u.id === "mock-user-4" || u.id === "mock-user-6").sort(
    (a, b) => b.check_ins_count - a.check_ins_count,
  ),
  Chongqing: MOCK_USERS.filter((u) => u.id === "mock-user-7" || u.id === "mock-user-8").sort(
    (a, b) => b.check_ins_count - a.check_ins_count,
  ),
  Nanjing: MOCK_USERS.filter((u) => u.id === "mock-user-7").sort(
    (a, b) => b.check_ins_count - a.check_ins_count,
  ),
  Shenzhen: MOCK_USERS.filter((u) => u.id === "mock-user-10").sort(
    (a, b) => b.check_ins_count - a.check_ins_count,
  ),
};

// Check-in map markers
export interface CheckInMarker {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  place_name: string;
  city: string;
  lat: number;
  lng: number;
  note: string | null;
  rating: number | null;
  created_at: string;
}

export const MOCK_CHECK_IN_MARKERS: CheckInMarker[] = [
  {
    id: "marker-1",
    user_id: "mock-user-1",
    user_name: "Sarah Johnson",
    user_avatar: "https://i.pravatar.cc/150?u=sarah",
    place_name: "Forbidden City",
    city: "Beijing",
    lat: 39.9163,
    lng: 116.3972,
    note: "Amazing history!",
    rating: 5,
    created_at: "2026-05-20T14:00:00Z",
  },
  {
    id: "marker-2",
    user_id: "mock-user-1",
    user_name: "Sarah Johnson",
    user_avatar: "https://i.pravatar.cc/150?u=sarah",
    place_name: "The Bund",
    city: "Shanghai",
    lat: 31.2405,
    lng: 121.4901,
    note: "Beautiful night view!",
    rating: 5,
    created_at: "2026-05-19T20:00:00Z",
  },
  {
    id: "marker-3",
    user_id: "mock-user-4",
    user_name: "Takeshi Yamamoto",
    user_avatar: "https://i.pravatar.cc/150?u=takeshi",
    place_name: "Giant Panda Base",
    city: "Chengdu",
    lat: 30.7378,
    lng: 103.9483,
    note: "So cute!",
    rating: 5,
    created_at: "2026-05-17T09:30:00Z",
  },
  {
    id: "marker-4",
    user_id: "mock-user-3",
    user_name: "Emma Williams",
    user_avatar: "https://i.pravatar.cc/150?u=emma",
    place_name: "West Lake",
    city: "Hangzhou",
    lat: 30.2465,
    lng: 120.1485,
    note: "Romantic boat ride",
    rating: 5,
    created_at: "2026-05-16T15:00:00Z",
  },
  {
    id: "marker-5",
    user_id: "mock-user-5",
    user_name: "Lisa Mueller",
    user_avatar: "https://i.pravatar.cc/150?u=lisa",
    place_name: "Terracotta Army",
    city: "Xi'an",
    lat: 34.3846,
    lng: 109.2785,
    note: "Incredible history!",
    rating: 5,
    created_at: "2026-05-15T10:00:00Z",
  },
  {
    id: "marker-6",
    user_id: "mock-user-2",
    user_name: "Michael Chen",
    user_avatar: "https://i.pravatar.cc/150?u=michael",
    place_name: "Yu Garden",
    city: "Shanghai",
    lat: 31.2275,
    lng: 120.5403,
    note: "Peaceful oasis",
    rating: 4,
    created_at: "2026-05-18T11:00:00Z",
  },
  {
    id: "marker-7",
    user_id: "mock-user-1",
    user_name: "Sarah Johnson",
    user_avatar: "https://i.pravatar.cc/150?u=sarah",
    place_name: "Great Wall",
    city: "Beijing",
    lat: 40.4319,
    lng: 116.5704,
    note: "Breathtaking views!",
    rating: 5,
    created_at: "2026-05-14T09:00:00Z",
  },
  {
    id: "marker-8",
    user_id: "mock-user-4",
    user_name: "Takeshi Yamamoto",
    user_avatar: "https://i.pravatar.cc/150?u=takeshi",
    place_name: "Leshan Giant Buddha",
    city: "Chengdu",
    lat: 29.5479,
    lng: 103.7683,
    note: "UNESCO site",
    rating: 5,
    created_at: "2026-05-12T14:00:00Z",
  },
  {
    id: "marker-9",
    user_id: "mock-user-6",
    user_name: "Anna Kowalski",
    user_avatar: "https://i.pravatar.cc/150?u=anna",
    place_name: "Canton Tower",
    city: "Guangzhou",
    lat: 23.1171,
    lng: 113.3213,
    note: "Stunning cityscape from the top",
    rating: 5,
    created_at: "2026-05-11T19:00:00Z",
  },
  {
    id: "marker-10",
    user_id: "mock-user-4",
    user_name: "Takeshi Yamamoto",
    user_avatar: "https://i.pravatar.cc/150?u=takeshi",
    place_name: "Elephant Trunk Hill",
    city: "Guilin",
    lat: 25.2622,
    lng: 110.2972,
    note: "Iconic karst formation",
    rating: 5,
    created_at: "2026-05-10T08:00:00Z",
  },
  {
    id: "marker-11",
    user_id: "mock-user-8",
    user_name: "Wei Liu",
    user_avatar: "https://i.pravatar.cc/150?u=wei",
    place_name: "Hongya Cave",
    city: "Chongqing",
    lat: 29.5592,
    lng: 106.5783,
    note: "Amazing architecture",
    rating: 4,
    created_at: "2026-05-09T20:00:00Z",
  },
  {
    id: "marker-12",
    user_id: "mock-user-6",
    user_name: "Anna Kowalski",
    user_avatar: "https://i.pravatar.cc/150?u=anna",
    place_name: "Three Pagodas of Dali",
    city: "Dali",
    lat: 25.6065,
    lng: 100.2675,
    note: "Ancient Buddhist temples",
    rating: 5,
    created_at: "2026-05-08T10:30:00Z",
  },
  {
    id: "marker-13",
    user_id: "mock-user-7",
    user_name: "Sophie Martin",
    user_avatar: "https://i.pravatar.cc/150?u=sophie",
    place_name: "Ming Xiaoling Tomb",
    city: "Nanjing",
    lat: 32.0603,
    lng: 118.8543,
    note: "UNESCO heritage site",
    rating: 5,
    created_at: "2026-05-07T09:00:00Z",
  },
  {
    id: "marker-14",
    user_id: "mock-user-10",
    user_name: "David Park",
    user_avatar: "https://i.pravatar.cc/150?u=david",
    place_name: "Humble Administrator's Garden",
    city: "Suzhou",
    lat: 31.3235,
    lng: 120.6253,
    note: "Serene classical garden",
    rating: 5,
    created_at: "2026-05-06T11:00:00Z",
  },
  {
    id: "marker-15",
    user_id: "mock-user-10",
    user_name: "David Park",
    user_avatar: "https://i.pravatar.cc/150?u=david",
    place_name: "Window of the World",
    city: "Shenzhen",
    lat: 22.5372,
    lng: 113.9732,
    note: "Mini world wonders",
    rating: 4,
    created_at: "2026-05-05T10:00:00Z",
  },
  {
    id: "marker-16",
    user_id: "mock-user-3",
    user_name: "Emma Williams",
    user_avatar: "https://i.pravatar.cc/150?u=emma",
    place_name: "Temple of Heaven",
    city: "Beijing",
    lat: 39.8832,
    lng: 116.4126,
    note: "Incredible acoustic design",
    rating: 5,
    created_at: "2026-05-04T14:00:00Z",
  },
  {
    id: "marker-17",
    user_id: "mock-user-5",
    user_name: "Lisa Mueller",
    user_avatar: "https://i.pravatar.cc/150?u=lisa",
    place_name: "Nanjing Road",
    city: "Shanghai",
    lat: 31.2351,
    lng: 121.4722,
    note: "World's busiest shopping street",
    rating: 4,
    created_at: "2026-05-03T16:00:00Z",
  },
  {
    id: "marker-18",
    user_id: "mock-user-9",
    user_name: "Carlos Rivera",
    user_avatar: "https://i.pravatar.cc/150?u=carlos",
    place_name: "Jinsha Site Museum",
    city: "Chengdu",
    lat: 30.9532,
    lng: 104.0053,
    note: "Ancient Shu civilization",
    rating: 5,
    created_at: "2026-05-02T11:30:00Z",
  },
  {
    id: "marker-19",
    user_id: "mock-user-5",
    user_name: "Lisa Mueller",
    user_avatar: "https://i.pravatar.cc/150?u=lisa",
    place_name: "Drum Tower",
    city: "Xi'an",
    lat: 34.2642,
    lng: 108.5423,
    note: "Ancient percussion tower",
    rating: 4,
    created_at: "2026-05-01T09:30:00Z",
  },
  {
    id: "marker-20",
    user_id: "mock-user-3",
    user_name: "Emma Williams",
    user_avatar: "https://i.pravatar.cc/150?u=emma",
    place_name: "Lingyin Temple",
    city: "Hangzhou",
    lat: 30.2512,
    lng: 120.1233,
    note: "Oldest Buddhist temple in China",
    rating: 5,
    created_at: "2026-04-30T10:00:00Z",
  },
];
