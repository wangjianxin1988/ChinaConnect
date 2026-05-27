# itinerary_days

13 columns | 1 PK | 2 FK | ~0 rows | 32 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| itinerary_id | uuid | NOT NULL |  | → itineraries.id |
| day_number | integer | NOT NULL |  |  |
| city_id | uuid | nullable |  | → cities.id |
| date | date | nullable |  |  |
| theme | text | nullable |  |  |
| activities | jsonb | nullable |  |  |
| transport_notes | text | nullable |  |  |
| accommodation | text | nullable |  |  |
| estimated_cost | numeric | nullable |  |  |
| tips | text | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |