# data_source_configs

11 columns | 1 PK | 0 FK | ~5 rows | 64 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| source_name | text | NOT NULL |  |  |
| source_type | text | NOT NULL |  |  |
| base_url | text | nullable |  |  |
| api_key | text | nullable |  |  |
| last_fetch_at | timestamp with time zone | nullable |  |  |
| fetch_interval_hours | integer | nullable | 24 |  |
| is_active | boolean | nullable | true |  |
| config | jsonb | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |