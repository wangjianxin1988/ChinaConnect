# profiles

12 columns | 1 PK | 0 FK | ~0 rows | 32 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| user_id | uuid | NOT NULL |  |  |
| display_name | text | nullable |  |  |
| avatar_url | text | nullable |  |  |
| nationality | text | nullable |  |  |
| native_language | text | nullable | en |  |
| travel_level | integer | nullable | 1 |  |
| points | integer | nullable |  |  |
| badges | text[] | nullable |  |  |
| preferences | jsonb | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |