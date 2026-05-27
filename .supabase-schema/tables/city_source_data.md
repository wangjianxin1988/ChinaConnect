# city_source_data

9 columns | 1 PK | 1 FK | ~0 rows | 56 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| city_id | uuid | NOT NULL |  | → cities.id |
| source_name | text | NOT NULL |  |  |
| metric_type | text | NOT NULL |  |  |
| metric_value | numeric | nullable |  |  |
| metric_unit | text | nullable |  |  |
| raw_data | jsonb | nullable |  |  |
| fetched_at | timestamp with time zone | nullable | now() |  |
| created_at | timestamp with time zone | nullable | now() |  |