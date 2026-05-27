# city_metrics

8 columns | 1 PK | 1 FK | ~0 rows | 32 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| city_id | uuid | NOT NULL |  | → cities.id |
| date | date | NOT NULL |  |  |
| check_ins_count | integer | nullable |  |  |
| posts_count | integer | nullable |  |  |
| searches_count | integer | nullable |  |  |
| avg_sentiment | numeric | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |