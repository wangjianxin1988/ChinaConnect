# post_comments

8 columns | 1 PK | 2 FK | ~0 rows | 32 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| post_id | uuid | NOT NULL |  | → community_posts.id |
| user_id | uuid | NOT NULL |  |  |
| parent_id | uuid | nullable |  | → post_comments.id |
| content | text | NOT NULL |  |  |
| likes_count | integer | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |