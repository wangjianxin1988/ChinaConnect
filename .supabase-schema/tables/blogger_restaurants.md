# blogger_restaurants

17 columns | 1 PK | 2 FK | ~0 rows | 40 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| restaurant_id | uuid | nullable |  | → restaurants.id |
| city_id | uuid | NOT NULL |  | → cities.id |
| platform | text | NOT NULL |  |  |
| platform_post_id | text | nullable |  |  |
| blogger_name | text | NOT NULL |  |  |
| blogger_id | text | nullable |  |  |
| blogger_followers | integer | nullable |  |  |
| video_url | text | nullable |  |  |
| thumbnail_url | text | nullable |  |  |
| quote | text | nullable |  |  |
| likes_count | integer | nullable |  |  |
| comments_count | integer | nullable |  |  |
| shared_count | integer | nullable |  |  |
| published_at | timestamp with time zone | nullable |  |  |
| scraped_at | timestamp with time zone | nullable | now() |  |
| created_at | timestamp with time zone | nullable | now() |  |