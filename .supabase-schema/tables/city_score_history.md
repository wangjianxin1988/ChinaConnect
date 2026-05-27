# city_score_history

10 columns | 1 PK | 1 FK | ~0 rows | 40 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| city_id | uuid | NOT NULL |  | → cities.id |
| composite_score | numeric | nullable |  |  |
| economy_score | numeric | nullable |  |  |
| international_score | numeric | nullable |  |  |
| tourism_score | numeric | nullable |  |  |
| livability_score | numeric | nullable |  |  |
| tier | text | nullable |  |  |
| recorded_at | date | NOT NULL | CURRENT_DATE |  |
| created_at | timestamp with time zone | nullable | now() |  |