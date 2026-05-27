# city_scores

18 columns | 1 PK | 1 FK | ~0 rows | 48 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| city_id | uuid | NOT NULL |  | → cities.id |
| composite_score | numeric | nullable |  |  |
| economy_score | numeric | nullable |  |  |
| international_score | numeric | nullable |  |  |
| tourism_score | numeric | nullable |  |  |
| livability_score | numeric | nullable |  |  |
| overall_rank | integer | nullable |  |  |
| economy_rank | integer | nullable |  |  |
| international_rank | integer | nullable |  |  |
| tourism_rank | integer | nullable |  |  |
| livability_rank | integer | nullable |  |  |
| tier | text | nullable | D |  |
| score_breakdown | jsonb | nullable |  |  |
| data_freshness | jsonb | nullable |  |  |
| calculated_at | timestamp with time zone | nullable | now() |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |