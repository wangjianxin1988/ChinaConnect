# notifications

8 columns | 1 PK | 0 FK | ~0 rows | 32 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| user_id | uuid | NOT NULL |  |  |
| type | text | NOT NULL |  |  |
| title | text | NOT NULL |  |  |
| content | text | nullable |  |  |
| data | jsonb | nullable |  |  |
| is_read | boolean | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |