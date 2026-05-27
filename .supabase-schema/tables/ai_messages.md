# ai_messages

7 columns | 1 PK | 1 FK | ~0 rows | 24 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| conversation_id | uuid | NOT NULL |  | → ai_conversations.id |
| role | text | NOT NULL |  |  |
| content | text | NOT NULL |  |  |
| tokens_used | integer | nullable |  |  |
| metadata | jsonb | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |