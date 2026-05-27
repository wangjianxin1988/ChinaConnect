# user_follows

4 columns | 1 PK | 0 FK | ~0 rows | 32 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| follower_id | uuid | NOT NULL |  |  |
| following_id | uuid | NOT NULL |  |  |
| created_at | timestamp with time zone | nullable | now() |  |