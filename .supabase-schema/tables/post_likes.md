# post_likes

4 columns | 1 PK | 1 FK | ~0 rows | 32 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| post_id | uuid | NOT NULL |  | → community_posts.id |
| user_id | uuid | NOT NULL |  |  |
| created_at | timestamp with time zone | nullable | now() |  |