# bookmarks

7 columns | 1 PK | 0 FK | ~0 rows | 40 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| user_id | uuid | NOT NULL |  |  |
| bookmark_type | text | NOT NULL |  |  |
| reference_id | uuid | NOT NULL |  |  |
| note | text | nullable |  |  |
| tags | text[] | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |