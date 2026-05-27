# cities

22 columns | 1 PK | 0 FK | ~6 rows | 120 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| name_en | text | NOT NULL |  |  |
| name_zh | text | NOT NULL |  |  |
| slug | text | NOT NULL |  |  |
| country | text | NOT NULL | China |  |
| province | text | nullable |  |  |
| lat | numeric | NOT NULL |  |  |
| lng | numeric | NOT NULL |  |  |
| population | integer | nullable |  |  |
| timezone | text | nullable | Asia/Shanghai |  |
| description | text | nullable |  |  |
| description_zh | text | nullable |  |  |
| cover_image_url | text | nullable |  |  |
| climate | text | nullable |  |  |
| best_season | text[] | nullable |  |  |
| cost_level | integer | nullable | 2 |  |
| airport_code | text | nullable |  |  |
| high_speed_rail_available | boolean | nullable | true |  |
| visa_offices | jsonb | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |
| fts | tsvector | nullable |  |  |