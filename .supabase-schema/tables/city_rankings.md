# city_rankings

14 columns | 1 PK | 0 FK

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | nullable |  |  |
| slug | text | nullable |  |  |
| name_en | text | nullable |  |  |
| name_zh | text | nullable |  |  |
| province | text | nullable |  |  |
| composite_score | numeric | nullable |  |  |
| economy_score | numeric | nullable |  |  |
| international_score | numeric | nullable |  |  |
| tourism_score | numeric | nullable |  |  |
| livability_score | numeric | nullable |  |  |
| tier | text | nullable |  |  |
| overall_rank | integer | nullable |  |  |
| cover_image_url | text | nullable |  |  |
| calculated_at | timestamp with time zone | nullable |  |  |