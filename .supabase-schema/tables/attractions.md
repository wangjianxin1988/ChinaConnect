# attractions

29 columns | 1 PK | 1 FK | ~5 rows | 136 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| city_id | uuid | NOT NULL |  | → cities.id |
| name_en | text | NOT NULL |  |  |
| name_zh | text | NOT NULL |  |  |
| slug | text | NOT NULL |  |  |
| type | text | NOT NULL |  |  |
| lat | numeric | nullable |  |  |
| lng | numeric | nullable |  |  |
| address | text | nullable |  |  |
| address_zh | text | nullable |  |  |
| rating | numeric | nullable |  |  |
| review_count | integer | nullable |  |  |
| price_min | numeric | nullable |  |  |
| price_max | numeric | nullable |  |  |
| currency | text | nullable | CNY |  |
| opening_hours | jsonb | nullable |  |  |
| booking_required | boolean | nullable |  |  |
| crowd_level | text | nullable |  |  |
| best_time_to_visit | text | nullable |  |  |
| avg_visit_duration | integer | nullable | 120 |  |
| description | text | nullable |  |  |
| description_zh | text | nullable |  |  |
| images | text[] | nullable |  |  |
| tags | text[] | nullable |  |  |
| official_website | text | nullable |  |  |
| phone | text | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |
| fts | tsvector | nullable |  |  |