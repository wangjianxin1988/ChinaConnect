# itineraries

20 columns | 1 PK | 0 FK | ~0 rows | 48 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| user_id | uuid | NOT NULL |  |  |
| title | text | NOT NULL |  |  |
| title_zh | text | nullable |  |  |
| description | text | nullable |  |  |
| cities | uuid[] | nullable |  |  |
| days | integer | nullable | 1 |  |
| budget_level | integer | nullable | 2 |  |
| budget_currency | text | nullable | CNY |  |
| estimated_total | numeric | nullable |  |  |
| type | text | nullable | custom |  |
| cover_image_url | text | nullable |  |  |
| is_public | boolean | nullable |  |  |
| is_featured | boolean | nullable |  |  |
| likes_count | integer | nullable |  |  |
| views_count | integer | nullable |  |  |
| status | text | nullable | draft |  |
| tags | text[] | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |