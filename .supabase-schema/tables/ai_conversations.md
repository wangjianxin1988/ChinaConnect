# ai_conversations

8 columns | 1 PK | 1 FK | ~0 rows | 24 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| user_id | uuid | NOT NULL |  |  |
| city_id | uuid | nullable |  | → cities.id |
| title | text | nullable |  |  |
| context | jsonb | nullable |  |  |
| message_count | integer | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |