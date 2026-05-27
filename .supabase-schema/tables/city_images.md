# city_images

12 columns | 1 PK | 1 FK | ~0 rows | 40 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| city_id | uuid | NOT NULL |  | → cities.id |
| image_url | text | NOT NULL |  |  |
| image_type | text | nullable | cover |  |
| photographer | text | nullable |  |  |
| photographer_url | text | nullable |  |  |
| source | text | nullable | unsplash |  |
| alt_text | text | nullable |  |  |
| alt_text_zh | text | nullable |  |  |
| is_primary | boolean | nullable |  |  |
| display_order | integer | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |