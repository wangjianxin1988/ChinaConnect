# scam_reports

17 columns | 1 PK | 1 FK | ~0 rows | 48 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| city_id | uuid | NOT NULL |  | → cities.id |
| user_id | uuid | nullable |  |  |
| type | text | NOT NULL |  |  |
| title | text | NOT NULL |  |  |
| description | text | NOT NULL |  |  |
| severity | text | nullable | medium |  |
| location_lat | numeric | nullable |  |  |
| location_lng | numeric | nullable |  |  |
| location_description | text | nullable |  |  |
| images | text[] | nullable |  |  |
| is_verified | boolean | nullable |  |  |
| upvotes | integer | nullable |  |  |
| status | text | nullable | pending |  |
| admin_notes | text | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |