# price_references

15 columns | 1 PK | 1 FK | ~0 rows | 32 kB

| Column | Type | Nullable | Default | FK |
|--------|------|----------|---------|-----|
| id **PK** | uuid | NOT NULL | gen_random_uuid() |  |
| city_id | uuid | NOT NULL |  | → cities.id |
| item_type | text | NOT NULL |  |  |
| item_name | text | NOT NULL |  |  |
| item_name_zh | text | nullable |  |  |
| local_price_min | numeric | nullable |  |  |
| local_price_max | numeric | nullable |  |  |
| tourist_price_min | numeric | nullable |  |  |
| tourist_price_max | numeric | nullable |  |  |
| currency | text | nullable | CNY |  |
| unit | text | nullable |  |  |
| notes | text | nullable |  |  |
| last_verified_at | timestamp with time zone | nullable |  |  |
| created_at | timestamp with time zone | nullable | now() |  |
| updated_at | timestamp with time zone | nullable | now() |  |