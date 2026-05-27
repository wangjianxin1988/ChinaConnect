# restaurants

29 columns | 1 PK | 1 FK | ~3 rows | 144 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| city_id | uuid | NOT NULL |  | → cities.id |
| name_en | text | NOT NULL |  |  |
| name_zh | text | NOT NULL |  |  |
| slug | text | NOT NULL |  |  |
| cuisine | text | NOT NULL |  |  |
| cuisine_zh | text | nullable |  |  |
| price_range | integer | nullable | 2 |  |
| lat | numeric | nullable |  |  |
| lng | numeric | nullable |  |  |
| address | text | nullable |  |  |
| address_zh | text | nullable |  |  |
| michelin_stars | integer | nullable |  |  |
| heizhenzhu_rank | integer | nullable |  |  |
| blogger_recommended | boolean | nullable |  |  |
| rating | numeric | nullable |  |  |
| review_count | integer | nullable |  |  |
| avg_cost | numeric | nullable |  |  |
| opening_hours | jsonb | nullable |  |  |
| avg_meal_duration | integer | nullable | 90 |  |
| description | text | nullable |  |  |
| description_zh | text | nullable |  |  |
| images | text[] | nullable |  |  |
| tags | text[] | nullable |  |  |
| phone | text | nullable |  |  |
| booking_required | boolean | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |
| fts | tsvector | nullable |  |  |