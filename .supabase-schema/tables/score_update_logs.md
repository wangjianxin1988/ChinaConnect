# score_update_logs

9 columns | 1 PK | 0 FK | ~0 rows | 24 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| run_id | text | NOT NULL |  |  |
| sources_processed | text[] | nullable |  |  |
| cities_updated | integer | nullable |  |  |
| calculation_duration_ms | integer | nullable |  |  |
| status | text | nullable | running |  |
| error_message | text | nullable |  |  |
| started_at | timestamp with time zone | nullable | now() |  |
| completed_at | timestamp with time zone | nullable |  |  |