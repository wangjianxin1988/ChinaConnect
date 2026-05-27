# check_ins

12 columns | 1 PK | 3 FK | ~0 rows | 40 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| user_id | uuid | NOT NULL |  |  |
| city_id | uuid | nullable |  | → cities.id |
| attraction_id | uuid | nullable |  | → attractions.id |
| restaurant_id | uuid | nullable |  | → restaurants.id |
| lat | numeric | nullable |  |  |
| lng | numeric | nullable |  |  |
| photo_url | text | nullable |  |  |
| note | text | nullable |  |  |
| rating | numeric | nullable |  |  |
| visibility | text | nullable | public |  |
| created_at | timestamp with time zone | nullable | now() |  |