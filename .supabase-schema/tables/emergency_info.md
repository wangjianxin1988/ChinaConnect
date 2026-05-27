# emergency_info

18 columns | 1 PK | 1 FK | ~4 rows | 80 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| city_id | uuid | NOT NULL |  | → cities.id |
| type | text | NOT NULL |  |  |
| name | text | NOT NULL |  |  |
| name_zh | text | nullable |  |  |
| phone | text | NOT NULL |  |  |
| phone_international | text | nullable |  |  |
| address | text | nullable |  |  |
| address_zh | text | nullable |  |  |
| lat | numeric | nullable |  |  |
| lng | numeric | nullable |  |  |
| opening_hours | text | nullable |  |  |
| opening_hours_zh | text | nullable |  |  |
| services | text[] | nullable |  |  |
| languages | text[] | nullable |  |  |
| is_24h | boolean | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |