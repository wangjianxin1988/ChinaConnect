# ChinaConnect Supabase Database

> Foreigners in China one-stop service platform - Database schema and configuration

## Overview

This directory contains the Supabase PostgreSQL schema, seed data, and configuration for the ChinaConnect platform.

## Directory Structure

```
supabase/
├── schema.sql          # Complete DDL (tables, indexes, RLS, triggers)
├── seed.sql            # MVP seed data (6 cities)
├── config.json         # Supabase client type generation config
├── migrations/          # Database migration scripts
│   └── 20260525000000_initial_schema.sql
└── README.md           # This file
```

## Quick Start

### 1. Apply Schema

```bash
# Using Supabase CLI
supabase db push

# Or using psql
psql -h <project-ref>.supabase.co -U postgres -d postgres -f schema.sql
```

### 2. Apply Seed Data

```bash
psql -h <project-ref>.supabase.co -U postgres -d postgres -f seed.sql
```

### 3. Generate Types (optional)

```bash
# Install supabase-js and generate types
npx supabase gen types typescript --project-id <project-ref> > types/supabase.ts
```

## Tables Overview

| Table | Description | RLS |
|-------|-------------|-----|
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

## Security

- All user-specific tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Public tables (cities, attractions, etc.) are readable by everyone
- Authentication uses Supabase Auth (auth.users)

## Seed Data

The seed file includes data for 6 MVP cities:

| City | UUID | Attractions | Restaurants |
|------|------|-------------|-------------|
| Beijing | a1b2c3d4-0001-... | 4 | 3 |
| Shanghai | a1b2c3d4-0002-... | 4 | 3 |
| Guangzhou | a1b2c3d4-0003-... | 3 | 2 |
| Xi'an | a1b2c3d4-0004-... | 3 | 2 |
| Chengdu | a1b2c3d4-0005-... | 3 | 3 |
| Guilin | a1b2c3d4-0006-... | 3 | 1 |

Total: 20 attractions, 14 restaurants, emergency info, price references, and scam reports.

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### TypeScript Types

The `config.json` file is used for Supabase client type generation. To generate TypeScript types:

```bash
npx supabase gen types typescript --project-id <project-ref> > src/types/supabase.ts
```

## Maintenance

### Adding New Tables

1. Add table definition to `schema.sql`
2. Create a new migration file in `migrations/`
3. Test on staging database
4. Apply to production

### Updating Seed Data

1. Modify `seed.sql`
2. Test with `psql -f seed.sql --dry-run`
3. Apply with caution (may need to clear existing data first)

## License

Proprietary - ChinaConnect Team