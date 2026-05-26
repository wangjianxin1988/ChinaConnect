---
date: 2026-05-25
project: ChinaConnect
type: task
---

# ChinaConnect Supabase Database Schema Design

## Task Summary
Designed complete Supabase PostgreSQL database schema for ChinaConnect, a one-stop service platform for foreigners visiting China.

## Deliverables Created

### 1. Schema File (supabase/schema.sql - 917 lines)
- 19 core tables with complete DDL
- UUID primary keys for all tables
- Row Level Security (RLS) policies on user-specific tables
- Comprehensive indexes for query optimization
- Full-text search (FTS) columns with GIN indexes
- Automatic triggers for updated_at timestamps
- Auto-profile creation on user signup

### 2. Seed Data (supabase/seed.sql - 1138 lines)
- 6 MVP cities: Beijing, Shanghai, Guangzhou, Xi'an, Chengdu, Guilin
- 20 attractions (4 per city average)
- 14 restaurants with cuisine and pricing info
- Emergency contacts for each city
- Price references (local vs tourist pricing)
- Scam reports for safety awareness

### 3. Configuration (supabase/config.json)
- Supabase client type generation config
- Table definitions for auto-generation

### 4. TypeScript Types (src/types/database.ts)
- Complete type definitions matching schema
- Helper type exports
- Level calculation utilities

### 5. Migration Structure
- Initial schema migration file
- README documentation

## Key Design Decisions

1. **RLS Strategy**: Public tables (cities, attractions, restaurants, etc.) are readable by everyone. User-specific tables (profiles, itineraries, posts, etc.) enforce ownership-based access.

2. **Bilingual Support**: All user-facing content has _en and _zh variants (name_en, name_zh, description, description_zh).

3. **AI Integration**: Dedicated tables for AI conversations and messages to support the AI agent core engine.

4. **Gamification**: Points, levels, badges, and check-in system for user engagement.

5. **Community Features**: Posts, comments, likes, follows for social engagement.

## Tables Created

| Table | Purpose | RLS |
|-------|---------|-----|
| profiles | User profiles with travel gamification | Yes |
| cities | China cities with travel data | No |
| attractions | Tourist attractions and POIs | No |
| restaurants | Restaurants with cuisine info | No |
| itineraries | User travel itineraries | Yes |
| itinerary_days | Daily breakdown of itineraries | Yes |
| community_posts | Travel diaries, tips, questions | Yes |
| post_comments | Comments on posts | Yes |
| post_likes | Likes on posts | Yes |
| check_ins | User location check-ins | Yes |
| scam_reports | Community safety warnings | No |
| emergency_info | Emergency contacts by city | No |
| blogger_restaurants | Social media recommendations | No |
| price_references | Cost of living data | No |
| bookmarks | User bookmarks | Yes |
| user_follows | User following relationships | Yes |
| notifications | User notifications | Yes |
| ai_conversations | AI travel assistant history | Yes |
| ai_messages | AI conversation messages | Yes |
| city_metrics | Daily city analytics | No |

## Next Steps
1. Create Supabase project and apply schema
2. Configure OAuth providers (Google, GitHub)
3. Implement API endpoints following schema
4. Build frontend components matching data model
