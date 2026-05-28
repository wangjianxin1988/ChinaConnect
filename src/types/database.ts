/**
 * ChinaConnect Database Types
 * Generated from supabase/schema.sql
 * Auto-generated - do not edit manually
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// User level enum
export type UserLevel = "小白" | "探索者" | "旅行家" | "中国通" | "传奇";

// Post types for community features
export type PostType = "travel_diary" | "pit_guide" | "qa" | "food_discovery" | "route_share";

// Points configuration
export const POINTS = {
  POST: 10,
  LIKE_RECEIVED: 2,
  BEST_ANSWER: 50,
  CHECK_IN: 5,
} as const;

// Level thresholds
export const LEVEL_THRESHOLDS = {
  小白: 0,
  探索者: 100,
  旅行家: 500,
  中国通: 1000,
  传奇: 5000,
} as const;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          native_language: string;
          travel_level: number;
          badges: string[];
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          nationality?: string | null;
          bio?: string | null;
          level?: UserLevel;
          points?: number;
          posts_count?: number;
          check_ins_count?: number;
          likes_received?: number;
          best_answers?: number;
          native_language?: string;
          travel_level?: number;
          badges?: string[];
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          nationality?: string | null;
          bio?: string | null;
          level?: UserLevel;
          points?: number;
          posts_count?: number;
          check_ins_count?: number;
          likes_received?: number;
          best_answers?: number;
          native_language?: string;
          travel_level?: number;
          badges?: string[];
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      cities: {
        Row: {
          id: string;
          name_en: string;
          name_zh: string;
          slug: string;
          country: string;
          province: string | null;
          lat: number;
          lng: number;
          population: number | null;
          timezone: string;
          description: string | null;
          description_zh: string | null;
          cover_image_url: string | null;
          climate: string | null;
          best_season: string[];
          cost_level: number;
          airport_code: string | null;
          high_speed_rail_available: boolean;
          created_at: string;
          updated_at: string;
          fts: Json | null;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_zh: string;
          slug: string;
          country?: string;
          province?: string | null;
          lat: number;
          lng: number;
          population?: number | null;
          timezone?: string;
          description?: string | null;
          description_zh?: string | null;
          cover_image_url?: string | null;
          climate?: string | null;
          best_season?: string[];
          cost_level?: number;
          airport_code?: string | null;
          high_speed_rail_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_zh?: string;
          slug?: string;
          country?: string;
          province?: string | null;
          lat?: number;
          lng?: number;
          population?: number | null;
          timezone?: string;
          description?: string | null;
          description_zh?: string | null;
          cover_image_url?: string | null;
          climate?: string | null;
          best_season?: string[];
          cost_level?: number;
          airport_code?: string | null;
          high_speed_rail_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      attractions: {
        Row: {
          id: string;
          city_id: string;
          name_en: string;
          name_zh: string;
          slug: string;
          type: string;
          lat: number | null;
          lng: number | null;
          address: string | null;
          address_zh: string | null;
          rating: number | null;
          review_count: number;
          price_min: number;
          price_max: number | null;
          currency: string;
          opening_hours: Json;
          booking_required: boolean;
          crowd_level: string | null;
          best_time_to_visit: string | null;
          avg_visit_duration: number;
          description: string | null;
          description_zh: string | null;
          images: string[];
          tags: string[];
          official_website: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
          fts: Json | null;
        };
        Insert: {
          id?: string;
          city_id: string;
          name_en: string;
          name_zh: string;
          slug: string;
          type: string;
          lat?: number | null;
          lng?: number | null;
          address?: string | null;
          address_zh?: string | null;
          rating?: number | null;
          review_count?: number;
          price_min?: number;
          price_max?: number | null;
          currency?: string;
          opening_hours?: Json;
          booking_required?: boolean;
          crowd_level?: string | null;
          best_time_to_visit?: string | null;
          avg_visit_duration?: number;
          description?: string | null;
          description_zh?: string | null;
          images?: string[];
          tags?: string[];
          official_website?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          name_en?: string;
          name_zh?: string;
          slug?: string;
          type?: string;
          lat?: number | null;
          lng?: number | null;
          address?: string | null;
          address_zh?: string | null;
          rating?: number | null;
          review_count?: number;
          price_min?: number;
          price_max?: number | null;
          currency?: string;
          opening_hours?: Json;
          booking_required?: boolean;
          crowd_level?: string | null;
          best_time_to_visit?: string | null;
          avg_visit_duration?: number;
          description?: string | null;
          description_zh?: string | null;
          images?: string[];
          tags?: string[];
          official_website?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          city_id: string;
          name_en: string;
          name_zh: string;
          slug: string;
          cuisine: string;
          cuisine_zh: string | null;
          price_range: number;
          lat: number | null;
          lng: number | null;
          address: string | null;
          address_zh: string | null;
          michelin_stars: number;
          heizhenzhu_rank: number | null;
          blogger_recommended: boolean;
          rating: number | null;
          review_count: number;
          avg_cost: number | null;
          opening_hours: Json;
          avg_meal_duration: number;
          description: string | null;
          description_zh: string | null;
          images: string[];
          tags: string[];
          phone: string | null;
          booking_required: boolean;
          created_at: string;
          updated_at: string;
          fts: Json | null;
        };
        Insert: {
          id?: string;
          city_id: string;
          name_en: string;
          name_zh: string;
          slug: string;
          cuisine: string;
          cuisine_zh?: string | null;
          price_range?: number;
          lat?: number | null;
          lng?: number | null;
          address?: string | null;
          address_zh?: string | null;
          michelin_stars?: number;
          heizhenzhu_rank?: number | null;
          blogger_recommended?: boolean;
          rating?: number | null;
          review_count?: number;
          avg_cost?: number | null;
          opening_hours?: Json;
          avg_meal_duration?: number;
          description?: string | null;
          description_zh?: string | null;
          images?: string[];
          tags?: string[];
          phone?: string | null;
          booking_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          name_en?: string;
          name_zh?: string;
          slug?: string;
          cuisine?: string;
          cuisine_zh?: string | null;
          price_range?: number;
          lat?: number | null;
          lng?: number | null;
          address?: string | null;
          address_zh?: string | null;
          michelin_stars?: number;
          heizhenzhu_rank?: number | null;
          blogger_recommended?: boolean;
          rating?: number | null;
          review_count?: number;
          avg_cost?: number | null;
          opening_hours?: Json;
          avg_meal_duration?: number;
          description?: string | null;
          description_zh?: string | null;
          images?: string[];
          tags?: string[];
          phone?: string | null;
          booking_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      itineraries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          title_zh: string | null;
          description: string | null;
          cities: string[];
          days: number;
          budget_level: number;
          budget_currency: string;
          estimated_total: number | null;
          type: string;
          cover_image_url: string | null;
          is_public: boolean;
          is_featured: boolean;
          likes_count: number;
          views_count: number;
          status: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          title_zh?: string | null;
          description?: string | null;
          cities?: string[];
          days?: number;
          budget_level?: number;
          budget_currency?: string;
          estimated_total?: number | null;
          type?: string;
          cover_image_url?: string | null;
          is_public?: boolean;
          is_featured?: boolean;
          likes_count?: number;
          views_count?: number;
          status?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          title_zh?: string | null;
          description?: string | null;
          cities?: string[];
          days?: number;
          budget_level?: number;
          budget_currency?: string;
          estimated_total?: number | null;
          type?: string;
          cover_image_url?: string | null;
          is_public?: boolean;
          is_featured?: boolean;
          likes_count?: number;
          views_count?: number;
          status?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      itinerary_days: {
        Row: {
          id: string;
          itinerary_id: string;
          day_number: number;
          city_id: string | null;
          date: string | null;
          theme: string | null;
          activities: Json;
          transport_notes: string | null;
          accommodation: string | null;
          estimated_cost: number | null;
          tips: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          itinerary_id: string;
          day_number: number;
          city_id?: string | null;
          date?: string | null;
          theme?: string | null;
          activities?: Json;
          transport_notes?: string | null;
          accommodation?: string | null;
          estimated_cost?: number | null;
          tips?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          itinerary_id?: string;
          day_number?: number;
          city_id?: string | null;
          date?: string | null;
          theme?: string | null;
          activities?: Json;
          transport_notes?: string | null;
          accommodation?: string | null;
          estimated_cost?: number | null;
          tips?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          city_id: string | null;
          type: string;
          title: string;
          content: string;
          images: string[];
          likes_count: number;
          comments_count: number;
          is_pinned: boolean;
          is_featured: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
          fts: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          city_id?: string | null;
          type: string;
          title: string;
          content: string;
          images?: string[];
          likes_count?: number;
          comments_count?: number;
          is_pinned?: boolean;
          is_featured?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          city_id?: string | null;
          type?: string;
          title?: string;
          content?: string;
          images?: string[];
          likes_count?: number;
          comments_count?: number;
          is_pinned?: boolean;
          is_featured?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          parent_id: string | null;
          content: string;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          parent_id?: string | null;
          content: string;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          parent_id?: string | null;
          content?: string;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string;
          city: string | null;
          city_id: string | null;
          attraction_id: string | null;
          restaurant_id: string | null;
          place_name: string | null;
          place_id: string | null;
          location: Json | null;
          lat: number | null;
          lng: number | null;
          photo_url: string | null;
          note: string | null;
          rating: number | null;
          visibility: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          city?: string | null;
          city_id?: string | null;
          attraction_id?: string | null;
          restaurant_id?: string | null;
          place_name?: string | null;
          place_id?: string | null;
          location?: Json | null;
          lat?: number | null;
          lng?: number | null;
          photo_url?: string | null;
          note?: string | null;
          rating?: number | null;
          visibility?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          city?: string | null;
          city_id?: string | null;
          attraction_id?: string | null;
          restaurant_id?: string | null;
          place_name?: string | null;
          place_id?: string | null;
          location?: Json | null;
          lat?: number | null;
          lng?: number | null;
          photo_url?: string | null;
          note?: string | null;
          rating?: number | null;
          visibility?: string;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          type: PostType;
          title: string;
          content: string;
          city: string | null;
          images: string[];
          tags: string[];
          location: Json | null;
          likes_count: number;
          comments_count: number;
          is_best_answer: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: PostType;
          title: string;
          content: string;
          city?: string | null;
          images?: string[];
          tags?: string[];
          location?: Json | null;
          likes_count?: number;
          comments_count?: number;
          is_best_answer?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: PostType;
          title?: string;
          content?: string;
          city?: string | null;
          images?: string[];
          tags?: string[];
          location?: Json | null;
          likes_count?: number;
          comments_count?: number;
          is_best_answer?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          is_best_answer: boolean;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          is_best_answer?: boolean;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          is_best_answer?: boolean;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      scam_reports: {
        Row: {
          id: string;
          city_id: string;
          user_id: string | null;
          type: string;
          title: string;
          description: string;
          severity: string;
          location_lat: number | null;
          location_lng: number | null;
          location_description: string | null;
          images: string[];
          is_verified: boolean;
          upvotes: number;
          status: string;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          user_id?: string | null;
          type: string;
          title: string;
          description: string;
          severity?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          location_description?: string | null;
          images?: string[];
          is_verified?: boolean;
          upvotes?: number;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          user_id?: string | null;
          type?: string;
          title?: string;
          description?: string;
          severity?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          location_description?: string | null;
          images?: string[];
          is_verified?: boolean;
          upvotes?: number;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      emergency_info: {
        Row: {
          id: string;
          city_id: string;
          type: string;
          name: string;
          name_zh: string | null;
          phone: string;
          phone_international: string | null;
          address: string | null;
          address_zh: string | null;
          lat: number | null;
          lng: number | null;
          opening_hours: string | null;
          opening_hours_zh: string | null;
          services: string[];
          languages: string[];
          is_24h: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          type: string;
          name: string;
          name_zh?: string | null;
          phone: string;
          phone_international?: string | null;
          address?: string | null;
          address_zh?: string | null;
          lat?: number | null;
          lng?: number | null;
          opening_hours?: string | null;
          opening_hours_zh?: string | null;
          services?: string[];
          languages?: string[];
          is_24h?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          type?: string;
          name?: string;
          name_zh?: string | null;
          phone?: string;
          phone_international?: string | null;
          address?: string | null;
          address_zh?: string | null;
          lat?: number | null;
          lng?: number | null;
          opening_hours?: string | null;
          opening_hours_zh?: string | null;
          services?: string[];
          languages?: string[];
          is_24h?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      blogger_restaurants: {
        Row: {
          id: string;
          restaurant_id: string | null;
          city_id: string;
          platform: string;
          platform_post_id: string | null;
          blogger_name: string;
          blogger_id: string | null;
          blogger_followers: number;
          video_url: string | null;
          thumbnail_url: string | null;
          quote: string | null;
          likes_count: number;
          comments_count: number;
          shared_count: number;
          published_at: string | null;
          scraped_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id?: string | null;
          city_id: string;
          platform: string;
          platform_post_id?: string | null;
          blogger_name: string;
          blogger_id?: string | null;
          blogger_followers?: number;
          video_url?: string | null;
          thumbnail_url?: string | null;
          quote?: string | null;
          likes_count?: number;
          comments_count?: number;
          shared_count?: number;
          published_at?: string | null;
          scraped_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string | null;
          city_id?: string;
          platform?: string;
          platform_post_id?: string | null;
          blogger_name?: string;
          blogger_id?: string | null;
          blogger_followers?: number;
          video_url?: string | null;
          thumbnail_url?: string | null;
          quote?: string | null;
          likes_count?: number;
          comments_count?: number;
          shared_count?: number;
          published_at?: string | null;
          scraped_at?: string;
          created_at?: string;
        };
      };
      price_references: {
        Row: {
          id: string;
          city_id: string;
          item_type: string;
          item_name: string;
          item_name_zh: string | null;
          local_price_min: number | null;
          local_price_max: number | null;
          tourist_price_min: number | null;
          tourist_price_max: number | null;
          currency: string;
          unit: string | null;
          notes: string | null;
          last_verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          item_type: string;
          item_name: string;
          item_name_zh?: string | null;
          local_price_min?: number | null;
          local_price_max?: number | null;
          tourist_price_min?: number | null;
          tourist_price_max?: number | null;
          currency?: string;
          unit?: string | null;
          notes?: string | null;
          last_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          item_type?: string;
          item_name?: string;
          item_name_zh?: string | null;
          local_price_min?: number | null;
          local_price_max?: number | null;
          tourist_price_min?: number | null;
          tourist_price_max?: number | null;
          currency?: string;
          unit?: string | null;
          notes?: string | null;
          last_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          bookmark_type: string;
          reference_id: string;
          note: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bookmark_type: string;
          reference_id: string;
          note?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bookmark_type?: string;
          reference_id?: string;
          note?: string | null;
          tags?: string[];
          created_at?: string;
        };
      };
      user_follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          content: string | null;
          data: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          content?: string | null;
          data?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          content?: string | null;
          data?: Json;
          is_read?: boolean;
          created_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          city_id: string | null;
          title: string | null;
          context: Json;
          message_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          city_id?: string | null;
          title?: string | null;
          context?: Json;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          city_id?: string | null;
          title?: string | null;
          context?: Json;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          tokens_used: number | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          tokens_used?: number | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          tokens_used?: number | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      city_metrics: {
        Row: {
          id: string;
          city_id: string;
          date: string;
          check_ins_count: number;
          posts_count: number;
          searches_count: number;
          avg_sentiment: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          date: string;
          check_ins_count?: number;
          posts_count?: number;
          searches_count?: number;
          avg_sentiment?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          date?: string;
          check_ins_count?: number;
          posts_count?: number;
          searches_count?: number;
          avg_sentiment?: number | null;
          created_at?: string;
        };
      };
      city_scores: {
        Row: {
          id: string;
          city_id: string;
          composite_score: number;
          economy_score: number;
          international_score: number;
          tourism_score: number;
          livability_score: number;
          tier: "S" | "A" | "B" | "C" | "D";
          overall_rank: number | null;
          score_breakdown: Json;
          calculated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          composite_score: number;
          economy_score: number;
          international_score: number;
          tourism_score: number;
          livability_score: number;
          tier: "S" | "A" | "B" | "C" | "D";
          overall_rank?: number | null;
          score_breakdown?: Json;
          calculated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          composite_score?: number;
          economy_score?: number;
          international_score?: number;
          tourism_score?: number;
          livability_score?: number;
          tier?: "S" | "A" | "B" | "C" | "D";
          overall_rank?: number | null;
          score_breakdown?: Json;
          calculated_at?: string;
          created_at?: string;
        };
      };
      city_score_history: {
        Row: {
          id: string;
          city_id: string;
          composite_score: number;
          economy_score: number;
          international_score: number;
          tourism_score: number;
          livability_score: number;
          tier: "S" | "A" | "B" | "C" | "D";
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          composite_score: number;
          economy_score: number;
          international_score: number;
          tourism_score: number;
          livability_score: number;
          tier: "S" | "A" | "B" | "C" | "D";
          recorded_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          composite_score?: number;
          economy_score?: number;
          international_score?: number;
          tourism_score?: number;
          livability_score?: number;
          tier?: "S" | "A" | "B" | "C" | "D";
          recorded_at?: string;
          created_at?: string;
        };
      };
      city_images: {
        Row: {
          id: string;
          city_id: string;
          image_url: string;
          image_type: "cover" | "hero" | "gallery" | "attraction";
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          image_url: string;
          image_type: "cover" | "hero" | "gallery" | "attraction";
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          image_url?: string;
          image_type?: "cover" | "hero" | "gallery" | "attraction";
          is_primary?: boolean;
          created_at?: string;
        };
      };
      score_update_logs: {
        Row: {
          id: string;
          run_id: string;
          status: "running" | "success" | "failed" | "partial";
          cities_updated: number | null;
          calculation_duration_ms: number | null;
          error_message: string | null;
          started_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          status?: "running" | "success" | "failed" | "partial";
          cities_updated?: number | null;
          calculation_duration_ms?: number | null;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          run_id?: string;
          status?: "running" | "success" | "failed" | "partial";
          cities_updated?: number | null;
          calculation_duration_ms?: number | null;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      data_source_configs: {
        Row: {
          id: string;
          source_name: string;
          source_type: string;
          base_url: string | null;
          api_key: string | null;
          last_fetch_at: string | null;
          fetch_interval_hours: number;
          is_active: boolean;
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_name: string;
          source_type: string;
          base_url?: string | null;
          api_key?: string | null;
          last_fetch_at?: string | null;
          fetch_interval_hours?: number;
          is_active?: boolean;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_name?: string;
          source_type?: string;
          base_url?: string | null;
          api_key?: string | null;
          last_fetch_at?: string | null;
          fetch_interval_hours?: number;
          is_active?: boolean;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      leaderboard_view: {
        Row: {
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          level: UserLevel;
          points: number;
          check_ins_count: number;
          rank: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_level: UserLevel;
      post_type: PostType;
    };
  };
};

// Helper type exports
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Re-export commonly used types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type City = Database["public"]["Tables"]["cities"]["Row"];
export type Attraction = Database["public"]["Tables"]["attractions"]["Row"];
export type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];

export type Itinerary = Database["public"]["Tables"]["itineraries"]["Row"];
export type ItineraryDay = Database["public"]["Tables"]["itinerary_days"]["Row"];

export type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Like = Database["public"]["Tables"]["likes"]["Row"];
export type PostComment = Database["public"]["Tables"]["post_comments"]["Row"];
export type PostLike = Database["public"]["Tables"]["post_likes"]["Row"];

export type CheckIn = Database["public"]["Tables"]["check_ins"]["Row"];

export type ScamReport = Database["public"]["Tables"]["scam_reports"]["Row"];
export type EmergencyInfo = Database["public"]["Tables"]["emergency_info"]["Row"];

export type BloggerRestaurant = Database["public"]["Tables"]["blogger_restaurants"]["Row"];
export type PriceReference = Database["public"]["Tables"]["price_references"]["Row"];

export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type UserFollow = Database["public"]["Tables"]["user_follows"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type AIConversation = Database["public"]["Tables"]["ai_conversations"]["Row"];
export type AIMessage = Database["public"]["Tables"]["ai_messages"]["Row"];

export type CityMetric = Database["public"]["Tables"]["city_metrics"]["Row"];

export type CityScore = Database["public"]["Tables"]["city_scores"]["Row"];
export type CityScoreHistory = Database["public"]["Tables"]["city_score_history"]["Row"];
export type CityImage = Database["public"]["Tables"]["city_images"]["Row"];
export type ScoreUpdateLog = Database["public"]["Tables"]["score_update_logs"]["Row"];
export type DataSourceConfig = Database["public"]["Tables"]["data_source_configs"]["Row"];

export type LeaderboardEntry = Database["public"]["Views"]["leaderboard_view"]["Row"];

// Helper function to calculate user level from points
export function calculateLevel(points: number): UserLevel {
  if (points >= LEVEL_THRESHOLDS.传奇) return "传奇";
  if (points >= LEVEL_THRESHOLDS.中国通) return "中国通";
  if (points >= LEVEL_THRESHOLDS.旅行家) return "旅行家";
  if (points >= LEVEL_THRESHOLDS.探索者) return "探索者";
  return "小白";
}

// Helper function to get points needed for next level
export function getPointsToNextLevel(points: number): number | null {
  if (points >= LEVEL_THRESHOLDS.传奇) return null;
  if (points >= LEVEL_THRESHOLDS.中国通) return LEVEL_THRESHOLDS.传奇 - points;
  if (points >= LEVEL_THRESHOLDS.旅行家) return LEVEL_THRESHOLDS.中国通 - points;
  if (points >= LEVEL_THRESHOLDS.探索者) return LEVEL_THRESHOLDS.旅行家 - points;
  return LEVEL_THRESHOLDS.探索者 - points;
}
