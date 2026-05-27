# community_posts

15 columns | 1 PK | 1 FK | ~0 rows | 72 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| user_id | uuid | NOT NULL |  |  |
| city_id | uuid | nullable |  | → cities.id |
| type | text | NOT NULL |  |  |
| title | text | NOT NULL |  |  |
| content | text | NOT NULL |  |  |
| images | text[] | nullable |  |  |
| likes_count | integer | nullable |  |  |
| comments_count | integer | nullable |  |  |
| is_pinned | boolean | nullable |  |  |
| is_featured | boolean | nullable |  |  |
| tags | text[] | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |
| fts | tsvector | nullable |  |  |