export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_conversation_snapshots: {
        Row: {
          conversation_context: Json | null
          conversation_id: string
          created_at: string | null
          id: string
          is_latest: boolean | null
          message_count: number | null
          messages: Json
          snapshot_type: string | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          conversation_context?: Json | null
          conversation_id: string
          created_at?: string | null
          id?: string
          is_latest?: boolean | null
          message_count?: number | null
          messages?: Json
          snapshot_type?: string | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          conversation_context?: Json | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_latest?: boolean | null
          message_count?: number | null
          messages?: Json
          snapshot_type?: string | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversation_snapshots_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          city_id: string | null
          context: Json | null
          created_at: string | null
          id: string
          is_route_saved: boolean | null
          language: string | null
          last_message_at: string | null
          last_snapshot_at: string | null
          message_count: number | null
          route_id: string | null
          status: string | null
          summary: string | null
          title: string | null
          total_tokens: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city_id?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          is_route_saved?: boolean | null
          language?: string | null
          last_message_at?: string | null
          last_snapshot_at?: string | null
          message_count?: number | null
          route_id?: string | null
          status?: string | null
          summary?: string | null
          title?: string | null
          total_tokens?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city_id?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          is_route_saved?: boolean | null
          language?: string | null
          last_message_at?: string | null
          last_snapshot_at?: string | null
          message_count?: number | null
          route_id?: string | null
          status?: string | null
          summary?: string | null
          title?: string | null
          total_tokens?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "ai_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          client_msg_id: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          model: string | null
          role: string
          tokens_used: number | null
        }
        Insert: {
          client_msg_id?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          role: string
          tokens_used?: number | null
        }
        Update: {
          client_msg_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_routes: {
        Row: {
          ai_model: string | null
          ai_provider: string | null
          city_id: string | null
          city_ids: string[] | null
          conversation_id: string | null
          created_at: string | null
          days: number | null
          end_date: string | null
          generation_tokens: number | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          likes_count: number | null
          route_data: Json
          saves_count: number | null
          share_token: string | null
          start_date: string | null
          status: string | null
          summary: string | null
          summary_zh: string | null
          tags: string[] | null
          title: string
          title_zh: string | null
          travel_style: string | null
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: string | null
          city_id?: string | null
          city_ids?: string[] | null
          conversation_id?: string | null
          created_at?: string | null
          days?: number | null
          end_date?: string | null
          generation_tokens?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          route_data?: Json
          saves_count?: number | null
          share_token?: string | null
          start_date?: string | null
          status?: string | null
          summary?: string | null
          summary_zh?: string | null
          tags?: string[] | null
          title: string
          title_zh?: string | null
          travel_style?: string | null
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          ai_model?: string | null
          ai_provider?: string | null
          city_id?: string | null
          city_ids?: string[] | null
          conversation_id?: string | null
          created_at?: string | null
          days?: number | null
          end_date?: string | null
          generation_tokens?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          route_data?: Json
          saves_count?: number | null
          share_token?: string | null
          start_date?: string | null
          status?: string | null
          summary?: string | null
          summary_zh?: string | null
          tags?: string[] | null
          title?: string
          title_zh?: string | null
          travel_style?: string | null
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_routes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_routes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_routes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage: {
        Row: {
          created_at: string
          id: string
          period_reset_at: string
          period_yyyymm: string
          request_count: number
          tier_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_reset_at: string
          period_yyyymm: string
          request_count?: number
          tier_slug?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period_reset_at?: string
          period_yyyymm?: string
          request_count?: number
          tier_slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_daily: {
        Row: {
          request_count: number
          usage_date: string
          user_id: string
        }
        Insert: {
          request_count?: number
          usage_date?: string
          user_id: string
        }
        Update: {
          request_count?: number
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      attractions: {
        Row: {
          address: string | null
          address_zh: string | null
          avg_visit_duration: number | null
          best_time_to_visit: string | null
          booking_required: boolean | null
          city_id: string
          created_at: string | null
          crowd_level: string | null
          currency: string | null
          description: string | null
          description_zh: string | null
          fts: unknown
          id: string
          images: string[] | null
          lat: number | null
          lng: number | null
          name_en: string
          name_zh: string
          official_website: string | null
          opening_hours: Json | null
          phone: string | null
          price_max: number | null
          price_min: number | null
          rating: number | null
          review_count: number | null
          slug: string
          tags: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_zh?: string | null
          avg_visit_duration?: number | null
          best_time_to_visit?: string | null
          booking_required?: boolean | null
          city_id: string
          created_at?: string | null
          crowd_level?: string | null
          currency?: string | null
          description?: string | null
          description_zh?: string | null
          fts?: unknown
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          name_en: string
          name_zh: string
          official_website?: string | null
          opening_hours?: Json | null
          phone?: string | null
          price_max?: number | null
          price_min?: number | null
          rating?: number | null
          review_count?: number | null
          slug: string
          tags?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_zh?: string | null
          avg_visit_duration?: number | null
          best_time_to_visit?: string | null
          booking_required?: boolean | null
          city_id?: string
          created_at?: string | null
          crowd_level?: string | null
          currency?: string | null
          description?: string | null
          description_zh?: string | null
          fts?: unknown
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          name_en?: string
          name_zh?: string
          official_website?: string | null
          opening_hours?: Json | null
          phone?: string | null
          price_max?: number | null
          price_min?: number | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          tags?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attractions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attractions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      blogger_restaurants: {
        Row: {
          blogger_followers: number | null
          blogger_id: string | null
          blogger_name: string
          city_id: string
          comments_count: number | null
          created_at: string | null
          id: string
          likes_count: number | null
          platform: string
          platform_post_id: string | null
          published_at: string | null
          quote: string | null
          restaurant_id: string | null
          scraped_at: string | null
          shared_count: number | null
          thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          blogger_followers?: number | null
          blogger_id?: string | null
          blogger_name: string
          city_id: string
          comments_count?: number | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          platform: string
          platform_post_id?: string | null
          published_at?: string | null
          quote?: string | null
          restaurant_id?: string | null
          scraped_at?: string | null
          shared_count?: number | null
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          blogger_followers?: number | null
          blogger_id?: string | null
          blogger_name?: string
          city_id?: string
          comments_count?: number | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          platform?: string
          platform_post_id?: string | null
          published_at?: string | null
          quote?: string | null
          restaurant_id?: string | null
          scraped_at?: string | null
          shared_count?: number | null
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blogger_restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blogger_restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blogger_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          bookmark_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          note: string | null
          reference_id: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          bookmark_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          note?: string | null
          reference_id: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          bookmark_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          note?: string | null
          reference_id?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          attraction_id: string | null
          city_id: string | null
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          note: string | null
          photo_url: string | null
          rating: number | null
          restaurant_id: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          attraction_id?: string | null
          city_id?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          photo_url?: string | null
          rating?: number | null
          restaurant_id?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          attraction_id?: string | null
          city_id?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          photo_url?: string | null
          rating?: number | null
          restaurant_id?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_attraction_id_fkey"
            columns: ["attraction_id"]
            isOneToOne: false
            referencedRelation: "attractions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          airport_code: string | null
          best_season: string[] | null
          climate: string | null
          cost_level: number | null
          country: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          description_zh: string | null
          fts: unknown
          high_speed_rail_available: boolean | null
          id: string
          lat: number
          lng: number
          name_en: string
          name_zh: string
          population: number | null
          province: string | null
          slug: string
          timezone: string | null
          updated_at: string | null
          visa_offices: Json | null
        }
        Insert: {
          airport_code?: string | null
          best_season?: string[] | null
          climate?: string | null
          cost_level?: number | null
          country?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          description_zh?: string | null
          fts?: unknown
          high_speed_rail_available?: boolean | null
          id?: string
          lat: number
          lng: number
          name_en: string
          name_zh: string
          population?: number | null
          province?: string | null
          slug: string
          timezone?: string | null
          updated_at?: string | null
          visa_offices?: Json | null
        }
        Update: {
          airport_code?: string | null
          best_season?: string[] | null
          climate?: string | null
          cost_level?: number | null
          country?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          description_zh?: string | null
          fts?: unknown
          high_speed_rail_available?: boolean | null
          id?: string
          lat?: number
          lng?: number
          name_en?: string
          name_zh?: string
          population?: number | null
          province?: string | null
          slug?: string
          timezone?: string | null
          updated_at?: string | null
          visa_offices?: Json | null
        }
        Relationships: []
      }
      city_images: {
        Row: {
          alt_text: string | null
          alt_text_zh: string | null
          city_id: string
          created_at: string | null
          display_order: number | null
          id: string
          image_type: string | null
          image_url: string
          is_primary: boolean | null
          photographer: string | null
          photographer_url: string | null
          source: string | null
        }
        Insert: {
          alt_text?: string | null
          alt_text_zh?: string | null
          city_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url: string
          is_primary?: boolean | null
          photographer?: string | null
          photographer_url?: string | null
          source?: string | null
        }
        Update: {
          alt_text?: string | null
          alt_text_zh?: string | null
          city_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url?: string
          is_primary?: boolean | null
          photographer?: string | null
          photographer_url?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_images_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_images_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      city_metrics: {
        Row: {
          avg_sentiment: number | null
          check_ins_count: number | null
          city_id: string
          created_at: string | null
          date: string
          id: string
          posts_count: number | null
          searches_count: number | null
        }
        Insert: {
          avg_sentiment?: number | null
          check_ins_count?: number | null
          city_id: string
          created_at?: string | null
          date: string
          id?: string
          posts_count?: number | null
          searches_count?: number | null
        }
        Update: {
          avg_sentiment?: number | null
          check_ins_count?: number | null
          city_id?: string
          created_at?: string | null
          date?: string
          id?: string
          posts_count?: number | null
          searches_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "city_metrics_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_metrics_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      city_score_history: {
        Row: {
          city_id: string
          composite_score: number | null
          created_at: string | null
          economy_score: number | null
          id: string
          international_score: number | null
          livability_score: number | null
          recorded_at: string
          tier: string | null
          tourism_score: number | null
        }
        Insert: {
          city_id: string
          composite_score?: number | null
          created_at?: string | null
          economy_score?: number | null
          id?: string
          international_score?: number | null
          livability_score?: number | null
          recorded_at?: string
          tier?: string | null
          tourism_score?: number | null
        }
        Update: {
          city_id?: string
          composite_score?: number | null
          created_at?: string | null
          economy_score?: number | null
          id?: string
          international_score?: number | null
          livability_score?: number | null
          recorded_at?: string
          tier?: string | null
          tourism_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "city_score_history_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_score_history_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      city_scores: {
        Row: {
          calculated_at: string | null
          city_id: string
          composite_score: number | null
          created_at: string | null
          data_freshness: Json | null
          economy_rank: number | null
          economy_score: number | null
          id: string
          international_rank: number | null
          international_score: number | null
          livability_rank: number | null
          livability_score: number | null
          overall_rank: number | null
          score_breakdown: Json | null
          tier: string | null
          tourism_rank: number | null
          tourism_score: number | null
          updated_at: string | null
        }
        Insert: {
          calculated_at?: string | null
          city_id: string
          composite_score?: number | null
          created_at?: string | null
          data_freshness?: Json | null
          economy_rank?: number | null
          economy_score?: number | null
          id?: string
          international_rank?: number | null
          international_score?: number | null
          livability_rank?: number | null
          livability_score?: number | null
          overall_rank?: number | null
          score_breakdown?: Json | null
          tier?: string | null
          tourism_rank?: number | null
          tourism_score?: number | null
          updated_at?: string | null
        }
        Update: {
          calculated_at?: string | null
          city_id?: string
          composite_score?: number | null
          created_at?: string | null
          data_freshness?: Json | null
          economy_rank?: number | null
          economy_score?: number | null
          id?: string
          international_rank?: number | null
          international_score?: number | null
          livability_rank?: number | null
          livability_score?: number | null
          overall_rank?: number | null
          score_breakdown?: Json | null
          tier?: string | null
          tourism_rank?: number | null
          tourism_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_scores_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: true
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_scores_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: true
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      city_source_data: {
        Row: {
          city_id: string
          created_at: string | null
          fetched_at: string | null
          id: string
          metric_type: string
          metric_unit: string | null
          metric_value: number | null
          raw_data: Json | null
          source_name: string
        }
        Insert: {
          city_id: string
          created_at?: string | null
          fetched_at?: string | null
          id?: string
          metric_type: string
          metric_unit?: string | null
          metric_value?: number | null
          raw_data?: Json | null
          source_name: string
        }
        Update: {
          city_id?: string
          created_at?: string | null
          fetched_at?: string | null
          id?: string
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number | null
          raw_data?: Json | null
          source_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_source_data_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_source_data_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_best_answer: boolean
          rating: number
          restaurant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_best_answer?: boolean
          rating?: number
          restaurant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_best_answer?: boolean
          rating?: number
          restaurant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          city_id: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          fts: unknown
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          fts?: unknown
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          fts?: unknown
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      content_likes: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      content_shares: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      data_source_configs: {
        Row: {
          api_key: string | null
          base_url: string | null
          config: Json | null
          created_at: string | null
          fetch_interval_hours: number | null
          id: string
          is_active: boolean | null
          last_fetch_at: string | null
          source_name: string
          source_type: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          base_url?: string | null
          config?: Json | null
          created_at?: string | null
          fetch_interval_hours?: number | null
          id?: string
          is_active?: boolean | null
          last_fetch_at?: string | null
          source_name: string
          source_type: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          base_url?: string | null
          config?: Json | null
          created_at?: string | null
          fetch_interval_hours?: number | null
          id?: string
          is_active?: boolean | null
          last_fetch_at?: string | null
          source_name?: string
          source_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      emergency_info: {
        Row: {
          address: string | null
          address_zh: string | null
          city_id: string
          created_at: string | null
          id: string
          is_24h: boolean | null
          languages: string[] | null
          lat: number | null
          lng: number | null
          name: string
          name_zh: string | null
          opening_hours: string | null
          opening_hours_zh: string | null
          phone: string
          phone_international: string | null
          services: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_zh?: string | null
          city_id: string
          created_at?: string | null
          id?: string
          is_24h?: boolean | null
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          name: string
          name_zh?: string | null
          opening_hours?: string | null
          opening_hours_zh?: string | null
          phone: string
          phone_international?: string | null
          services?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_zh?: string | null
          city_id?: string
          created_at?: string | null
          id?: string
          is_24h?: boolean | null
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          name?: string
          name_zh?: string | null
          opening_hours?: string | null
          opening_hours_zh?: string | null
          phone?: string
          phone_international?: string | null
          services?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_info_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_info_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          billing_cycle: string | null
          created_at: string | null
          currency: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          order_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          order_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          order_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          budget_currency: string | null
          budget_level: number | null
          cities: string[] | null
          cover_image_url: string | null
          created_at: string | null
          days: number | null
          description: string | null
          estimated_total: number | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          likes_count: number | null
          status: string | null
          tags: string[] | null
          title: string
          title_zh: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          budget_currency?: string | null
          budget_level?: number | null
          cities?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          days?: number | null
          description?: string | null
          estimated_total?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          title_zh?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          budget_currency?: string | null
          budget_level?: number | null
          cities?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          days?: number | null
          description?: string | null
          estimated_total?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          title_zh?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      itinerary_days: {
        Row: {
          accommodation: string | null
          activities: Json | null
          city_id: string | null
          created_at: string | null
          date: string | null
          day_number: number
          estimated_cost: number | null
          id: string
          itinerary_id: string
          theme: string | null
          tips: string | null
          transport_notes: string | null
          updated_at: string | null
        }
        Insert: {
          accommodation?: string | null
          activities?: Json | null
          city_id?: string | null
          created_at?: string | null
          date?: string | null
          day_number: number
          estimated_cost?: number | null
          id?: string
          itinerary_id: string
          theme?: string | null
          tips?: string | null
          transport_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          accommodation?: string | null
          activities?: Json | null
          city_id?: string | null
          created_at?: string | null
          date?: string | null
          day_number?: number
          estimated_cost?: number | null
          id?: string
          itinerary_id?: string
          theme?: string | null
          tips?: string | null
          transport_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_days_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_days_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_days_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_tiers: {
        Row: {
          ai_requests_daily: number | null
          ai_requests_monthly: number | null
          badge_color: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          description_zh: string | null
          display_order: number | null
          features: Json | null
          icon: string | null
          id: string
          is_active: boolean | null
          max_conversations: number | null
          max_favorites: number | null
          max_saved_routes: number | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          ai_requests_daily?: number | null
          ai_requests_monthly?: number | null
          badge_color?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          description_zh?: string | null
          display_order?: number | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_conversations?: number | null
          max_favorites?: number | null
          max_saved_routes?: number | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          ai_requests_daily?: number | null
          ai_requests_monthly?: number | null
          badge_color?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          description_zh?: string | null
          display_order?: number | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_conversations?: number | null
          max_favorites?: number | null
          max_saved_routes?: number | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          billing_cycle: string | null
          completed_at: string | null
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          discount_amount: number | null
          external_order_id: string | null
          final_amount: number
          id: string
          ip_address: string | null
          metadata: Json | null
          order_number: string
          order_type: string
          paid_at: string | null
          payment_method: string | null
          payment_provider: string | null
          status: string | null
          tier_id: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string | null
          completed_at?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_amount?: number | null
          external_order_id?: string | null
          final_amount: number
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          order_number: string
          order_type: string
          paid_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          status?: string | null
          tier_id?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          completed_at?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_amount?: number | null
          external_order_id?: string | null
          final_amount?: number
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          order_number?: string
          order_type?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          status?: string | null
          tier_id?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      price_references: {
        Row: {
          city_id: string
          created_at: string | null
          currency: string | null
          id: string
          item_name: string
          item_name_zh: string | null
          item_type: string
          last_verified_at: string | null
          local_price_max: number | null
          local_price_min: number | null
          notes: string | null
          tourist_price_max: number | null
          tourist_price_min: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          city_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          item_name: string
          item_name_zh?: string | null
          item_type: string
          last_verified_at?: string | null
          local_price_max?: number | null
          local_price_min?: number | null
          notes?: string | null
          tourist_price_max?: number | null
          tourist_price_min?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          city_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          item_name?: string
          item_name_zh?: string | null
          item_type?: string
          last_verified_at?: string | null
          local_price_max?: number | null
          local_price_min?: number | null
          notes?: string | null
          tourist_price_max?: number | null
          tourist_price_min?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_references_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_references_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: string[] | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          last_active_at: string | null
          membership_tier: string | null
          nationality: string | null
          native_language: string | null
          onboarding_completed: boolean | null
          points: number | null
          preferences: Json | null
          signup_source: string | null
          travel_level: number | null
          updated_at: string | null
          user_id: string
          wallet_balance: number | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_active_at?: string | null
          membership_tier?: string | null
          nationality?: string | null
          native_language?: string | null
          onboarding_completed?: boolean | null
          points?: number | null
          preferences?: Json | null
          signup_source?: string | null
          travel_level?: number | null
          updated_at?: string | null
          user_id: string
          wallet_balance?: number | null
        }
        Update: {
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_active_at?: string | null
          membership_tier?: string | null
          nationality?: string | null
          native_language?: string | null
          onboarding_completed?: boolean | null
          points?: number | null
          preferences?: Json | null
          signup_source?: string | null
          travel_level?: number | null
          updated_at?: string | null
          user_id?: string
          wallet_balance?: number | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          address_zh: string | null
          avg_cost: number | null
          avg_meal_duration: number | null
          blogger_recommended: boolean | null
          booking_required: boolean | null
          city_id: string
          created_at: string | null
          cuisine: string
          cuisine_zh: string | null
          description: string | null
          description_zh: string | null
          fts: unknown
          heizhenzhu_rank: number | null
          id: string
          images: string[] | null
          lat: number | null
          lng: number | null
          michelin_stars: number | null
          name_en: string
          name_zh: string
          opening_hours: Json | null
          phone: string | null
          price_range: number | null
          rating: number | null
          review_count: number | null
          slug: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_zh?: string | null
          avg_cost?: number | null
          avg_meal_duration?: number | null
          blogger_recommended?: boolean | null
          booking_required?: boolean | null
          city_id: string
          created_at?: string | null
          cuisine: string
          cuisine_zh?: string | null
          description?: string | null
          description_zh?: string | null
          fts?: unknown
          heizhenzhu_rank?: number | null
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          michelin_stars?: number | null
          name_en: string
          name_zh: string
          opening_hours?: Json | null
          phone?: string | null
          price_range?: number | null
          rating?: number | null
          review_count?: number | null
          slug: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_zh?: string | null
          avg_cost?: number | null
          avg_meal_duration?: number | null
          blogger_recommended?: boolean | null
          booking_required?: boolean | null
          city_id?: string
          created_at?: string | null
          cuisine?: string
          cuisine_zh?: string | null
          description?: string | null
          description_zh?: string | null
          fts?: unknown
          heizhenzhu_rank?: number | null
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          michelin_stars?: number | null
          name_en?: string
          name_zh?: string
          opening_hours?: Json | null
          phone?: string | null
          price_range?: number | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      scam_reports: {
        Row: {
          admin_notes: string | null
          city_id: string
          created_at: string | null
          description: string
          id: string
          images: string[] | null
          is_verified: boolean | null
          location_description: string | null
          location_lat: number | null
          location_lng: number | null
          severity: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          city_id: string
          created_at?: string | null
          description: string
          id?: string
          images?: string[] | null
          is_verified?: boolean | null
          location_description?: string | null
          location_lat?: number | null
          location_lng?: number | null
          severity?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          city_id?: string
          created_at?: string | null
          description?: string
          id?: string
          images?: string[] | null
          is_verified?: boolean | null
          location_description?: string | null
          location_lat?: number | null
          location_lng?: number | null
          severity?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scam_reports_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scam_reports_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      score_update_logs: {
        Row: {
          calculation_duration_ms: number | null
          cities_updated: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          run_id: string
          sources_processed: string[] | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          calculation_duration_ms?: number | null
          cities_updated?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          run_id: string
          sources_processed?: string[] | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          calculation_duration_ms?: number | null
          cities_updated?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          run_id?: string
          sources_processed?: string[] | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_memberships: {
        Row: {
          ai_requests_used_month: number | null
          ai_requests_used_today: number | null
          auto_renew: boolean | null
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string | null
          daily_reset_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          monthly_reset_at: string | null
          order_id: string | null
          started_at: string | null
          status: string | null
          tier_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_requests_used_month?: number | null
          ai_requests_used_today?: number | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          daily_reset_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          monthly_reset_at?: string | null
          order_id?: string | null
          started_at?: string | null
          status?: string | null
          tier_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_requests_used_month?: number | null
          ai_requests_used_today?: number | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          daily_reset_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          monthly_reset_at?: string | null
          order_id?: string | null
          started_at?: string | null
          status?: string | null
          tier_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_memberships_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_memberships_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_memberships_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string | null
          description_zh: string | null
          external_txn_id: string | null
          id: string
          metadata: Json | null
          payment_channel: string | null
          reference_id: string | null
          reference_type: string | null
          status: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description?: string | null
          description_zh?: string | null
          external_txn_id?: string | null
          id?: string
          metadata?: Json | null
          payment_channel?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string | null
          description_zh?: string | null
          external_txn_id?: string | null
          id?: string
          metadata?: Json | null
          payment_channel?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string | null
          frozen_amount: number | null
          id: string
          status: string | null
          total_consumed: number | null
          total_recharged: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          frozen_amount?: number | null
          id?: string
          status?: string | null
          total_consumed?: number | null
          total_recharged?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          frozen_amount?: number | null
          id?: string
          status?: string | null
          total_consumed?: number | null
          total_recharged?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      city_rankings: {
        Row: {
          calculated_at: string | null
          composite_score: number | null
          cover_image_url: string | null
          economy_score: number | null
          id: string | null
          international_score: number | null
          livability_score: number | null
          name_en: string | null
          name_zh: string | null
          overall_rank: number | null
          province: string | null
          slug: string | null
          tier: string | null
          tourism_score: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      order_summary: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          final_amount: number | null
          id: string | null
          order_number: string | null
          order_type: string | null
          paid_at: string | null
          payment_method: string | null
          status: string | null
          tier_name: string | null
          user_avatar: string | null
          user_display_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
      user_dashboard: {
        Row: {
          ai_daily_limit: number | null
          ai_monthly_limit: number | null
          ai_used_month: number | null
          ai_used_today: number | null
          avatar_url: string | null
          conversations_count: number | null
          display_name: string | null
          favorites_count: number | null
          last_active_at: string | null
          max_favorites: number | null
          max_saved_routes: number | null
          membership_expires_at: string | null
          membership_tier: string | null
          points: number | null
          saved_routes: number | null
          tier_name: string | null
          tier_slug: string | null
          travel_level: number | null
          user_id: string | null
          wallet_balance: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      calculate_city_tier: { Args: { score: number }; Returns: string }
      check_ai_limit: { Args: { p_user_id: string }; Returns: boolean }
      cleanup_old_snapshots: {
        Args: { p_keep_count?: number }
        Returns: number
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      ensure_user_wallet: { Args: { p_user_id: string }; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_user_ai_usage: {
        Args: { p_user_id: string }
        Returns: {
          max_requests: number
          period_reset_at: string
          period_yyyymm: string
          request_count: number
          tier_slug: string
        }[]
      }
      get_user_ai_usage_daily: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          request_count: number
          usage_date: string
        }[]
      }
      get_user_membership: {
        Args: { p_user_id: string }
        Returns: {
          ai_daily_limit: number
          ai_monthly_limit: number
          ai_used_month: number
          ai_used_today: number
          billing_cycle: string
          expires_at: string
          features: Json
          is_active: boolean
          max_favorites: number
          max_saved_routes: number
          next_charge_at: string
          started_at: string
          tier_name: string
          tier_slug: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      increment_ai_usage: {
        Args: { p_user_id: string }
        Returns: {
          allowed: boolean
          max_requests: number
          request_count: number
          tier_slug: string
        }[]
      }
      is_self_or_service: { Args: { p_user_id: string }; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      record_invoice: {
        Args: { p_invoice_number: string; p_order_id: string }
        Returns: undefined
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      update_ai_usage_tier: {
        Args: { p_tier_slug: string; p_user_id: string }
        Returns: undefined
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const


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

// Re-export commonly used types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type City = Database["public"]["Tables"]["cities"]["Row"];
export type Attraction = Database["public"]["Tables"]["attractions"]["Row"];
export type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];

export type Itinerary = Database["public"]["Tables"]["itineraries"]["Row"];
export type ItineraryDay = Database["public"]["Tables"]["itinerary_days"]["Row"];

export type Comment = Database["public"]["Tables"]["comments"]["Row"];
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
