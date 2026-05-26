# ChinaConnect AI Agent Tools Specification
# Tool definitions for Dify Workflow integration

## Overview

Tools enable the AI agent to fetch real-time data and perform actions during the workflow.

## Tool Categories

### 1. City Database Tool

**Purpose**: Query comprehensive city information, attractions, and local data

**Endpoint**: `{{env.CITY_SERVICE_URL}}/api/v1/cities`

**Method**: `GET`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| city_name | string | Yes | Name of the city (supports Chinese and English) |
| language | string | No | Response language (en/zh/ja/ko), default: en |
| include_attractions | boolean | No | Include attraction list, default: true |
| include_food | boolean | No | Include food recommendations, default: true |
| include_transport | boolean | No | Include transport info, default: true |

**Response Schema**:
```json
{
  "city": {
    "name_en": "Beijing",
    "name_zh": "北京",
    "province": "Beijing",
    "population": 21540000,
    "area_km2": 16411,
    "timezone": "Asia/Shanghai",
    "climate": {
      "type": "Humid continental",
      "best_visited": ["Sep-Oct", "Apr-May"]
    },
    "highlights": ["Forbidden City", "Great Wall", "Temple of Heaven"]
  },
  "attractions": [
    {
      "name_en": "Forbidden City",
      "name_zh": "故宫",
      "rating": 4.8,
      "ticket_price_cny": 60,
      "opening_hours": "08:30-17:00",
      "suggested_duration_hours": 4,
      "coordinates": {"lat": 39.9163, "lng": 116.3972},
      "tags": ["historical", "UNESCO", "imperial"],
      "crowd_level": "high"
    }
  ],
  "food_specialties": ["Peking Duck", "Imperial Cuisine", "Moon Cake"],
  "transport_hubs": [
    {
      "type": "airport",
      "name": "Beijing Capital International Airport",
      "code": "PEK",
      "distance_to_center_km": 25
    }
  ]
}
```

**Usage in Workflow**:
```
{{TOOL_CITY_DATABASE(city_name="Beijing", language="en")}}
```

---

### 2. Weather API Tool

**Purpose**: Get weather forecasts for planning outdoor activities

**Endpoint**: `{{env.WEATHER_SERVICE_URL}}/api/v1/weather`

**Method**: `GET`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| city | string | Yes | City name (supports pinyin or Chinese) |
| date | string | No | Date in YYYY-MM-DD format, or "today"/"tomorrow" |
| days | number | No | Number of forecast days (1-7), default: 1 |

**Response Schema**:
```json
{
  "location": {
    "city": "Beijing",
    "coordinates": {"lat": 39.9042, "lng": 116.4074}
  },
  "forecast": [
    {
      "date": "2026-05-26",
      "weather": {
        "condition": "partly_cloudy",
        "temperature_c": {"min": 18, "max": 28},
        "humidity_percent": 45,
        "wind_kmh": 12,
        "uv_index": 6
      },
      "travel_advisory": {
        "good_for_outdoor": true,
        "warnings": [],
        "recommendations": ["Bring sunscreen", "Evening may be cool"]
      }
    }
  ]
}
```

**Weather Condition Mapping**:
| Condition | Icon | Outdoor Activities |
|-----------|------|-------------------|
| sunny | ☀️ | Excellent |
| partly_cloudy | ⛅ | Good |
| cloudy | ☁️ | Acceptable |
| rainy | 🌧️ | Not recommended |
| stormy | ⛈️ | Avoid |

---

### 3. Hotel Search Tool

**Purpose**: Search and recommend hotels based on criteria

**Endpoint**: `{{env.HOTEL_SERVICE_URL}}/api/v1/hotels/search`

**Method**: `POST`

**Parameters**:
```json
{
  "city": "string (required)",
  "check_in": "YYYY-MM-DD (optional)",
  "check_out": "YYYY-MM-DD (optional)",
  "price_range": {
    "min": 0,
    "max": 10000
  },
  "star_rating": [3, 4, 5],
  "location_preference": "near_attraction_name or downtown",
  "amenities": ["wifi", "breakfast", "gym", "parking"],
  "user_rating_min": 4.0,
  "language": "en"
}
```

**Response Schema**:
```json
{
  "hotels": [
    {
      "name_en": "Hotel Name",
      "name_zh": "酒店名称",
      "star_rating": 4,
      "user_rating": 4.5,
      "review_count": 1250,
      "price_per_night_cny": 450,
      "discounted_price_cny": 380,
      "location": {
        "address": "123 Wangfujing Street",
        "district": "Dongcheng",
        "nearest_metro": "Line 1 - Wangfujing Station",
        "distance_to_attraction_km": 0.5
      },
      "amenities": ["Free WiFi", "Breakfast Included", "Airport Shuttle"],
      "room_types": ["Standard", "Deluxe", "Suite"],
      "booking_url": "https://...",
      "images": ["url1", "url2"]
    }
  ],
  "filters_applied": {...},
  "total_results": 45
}
```

---

### 4. Transport Search Tool

**Purpose**: Search high-speed trains and flights between cities

**Endpoint**: `{{env.TRANSPORT_SERVICE_URL}}/api/v1/search`

**Method**: `POST`

**Parameters**:
```json
{
  "from_city": "string (required)",
  "to_city": "string (required)",
  "date": "YYYY-MM-DD (required)",
  "transport_type": "train | flight | all (default: all)",
  "time_preference": "morning | afternoon | evening | any (default: any)",
  "passengers": {
    "adults": 1,
    "children": 0,
    "infants": 0
  }
}
```

**Response Schema**:
```json
{
  "trains": [
    {
      "train_number": "G1",
      "train_type": "high_speed_g",
      "from_station": "Beijing South Station",
      "to_station": "Shanghai Hongqiao Station",
      "departure_time": "09:00",
      "arrival_time": "13:28",
      "duration_hours": 4.5,
      "distance_km": 1318,
      "prices": {
        "second_class": 553,
        "first_class": 933,
        "business_class": 1748
      },
      "stops": [],
      "availability": "high",
      "booking_url": "https://..."
    }
  ],
  "flights": [
    {
      "flight_number": "CA1519",
      "airline": "Air China",
      "from_airport": "PEK",
      "to_airport": "SHA",
      "departure_time": "08:30",
      "arrival_time": "10:45",
      "duration_hours": 2.25,
      "prices": {
        "economy": 780,
        "business": 2800
      },
      "availability": "moderate"
    }
  ]
}
```

---

### 5. Translation API Tool

**Purpose**: Translate text between languages for travelers

**Endpoint**: `{{env.TRANSLATION_SERVICE_URL}}/api/v1/translate`

**Method**: `POST`

**Parameters**:
```json
{
  "text": "string (required)",
  "source_lang": "auto (default: auto-detect)",
  "target_lang": "en | zh | ja | ko | es | fr | de (required)"
}
```

**Response Schema**:
```json
{
  "original_text": "我想去北京旅游",
  "translated_text": "I want to travel to Beijing",
  "source_lang": "zh",
  "target_lang": "en",
  "confidence": 0.98,
  "alternatives": [
    {
      "text": "I want to go to Beijing for tourism",
      "confidence": 0.95
    }
  ]
}
```

**Supported Language Codes**:
| Code | Language |
|------|----------|
| en | English |
| zh | Chinese (Simplified) |
| zh-TW | Chinese (Traditional) |
| ja | Japanese |
| ko | Korean |
| es | Spanish |
| fr | French |
| de | German |
| ru | Russian |
| ar | Arabic |

---

### 6. Map Service Tool

**Purpose**: Get coordinates and generate map visualizations

**Endpoint**: `{{env.MAP_SERVICE_URL}}/api/v1/locations`

**Method**: `POST`

**Parameters**:
```json
{
  "locations": [
    {
      "name": "Attraction Name",
      "address": "Optional address",
      "coordinates": {"lat": 39.9042, "lng": 116.4074}
    }
  ],
  "format": "coordinates | geojson | static_map_url"
}
```

**Response Schema**:
```json
{
  "locations": [
    {
      "name": "Temple of Heaven",
      "coordinates": {"lat": 39.8832, "lng": 116.4066},
      "formatted_address": "Andingmenwai, Dongcheng District, Beijing"
    }
  ],
  "route": {
    "geojson": {...},
    "total_distance_km": 12.5,
    "estimated_duration_minutes": 45
  },
  "map_url": "https://mapservice.example.com/static?..."
}
```

---

## Tool Integration in Dify Workflow

### YAML Configuration Example
```yaml
nodes:
  - id: city_lookup
    type: "http"
    tool: "city_database"
    params:
      city_name: "{{extracted_params.destination}}"
      language: "{{user_context.language}}"
```

### Tool Selection Logic

```python
# Pseudo-code for tool selection
def select_tools(intent, extracted_params):
    tools = []

    if intent == "travel_planning":
        tools.append("city_database")  # Get city info
        if extracted_params.destination:
            tools.append("weather_api")  # Check weather
            tools.append("hotel_search")  # Find hotels
            tools.append("transport_search")  # Check transport

    elif intent == "food_recommendation":
        tools.append("city_database")  # Get local food specialties
        tools.append("translation_api")  # Translate menu items

    elif intent == "life_consultation":
        if "transport" in extracted_params.query:
            tools.append("transport_search")
        if "translation" in extracted_params.query:
            tools.append("translation_api")

    elif intent == "emergency_help":
        tools.append("map_service")  # Find nearest hospital/police
        tools.append("translation_api")  # Emergency phrases

    return tools
```

---

## Environment Variables

Configure these in your `.env` file:

```bash
# Service URLs
CITY_SERVICE_URL=https://api.chinaconnect.example.com
WEATHER_SERVICE_URL=https://weather.chinaconnect.example.com
HOTEL_SERVICE_URL=https://hotels.chinaconnect.example.com
TRANSPORT_SERVICE_URL=https://transport.chinaconnect.example.com
TRANSLATION_SERVICE_URL=https://translation.chinaconnect.example.com
MAP_SERVICE_URL=https://maps.chinaconnect.example.com

# API Keys
CITY_SERVICE_API_KEY=your_api_key
HOTEL_SERVICE_API_KEY=your_api_key
TRANSPORT_SERVICE_API_KEY=your_api_key
```

---

## Error Handling

### Tool Response Errors
```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Weather service is temporarily unavailable",
    "retry_after_seconds": 30
  }
}
```

### Fallback Behavior
1. **City Database Fail**: Use cached data or return "Please specify a destination"
2. **Weather API Fail**: Skip weather-dependent recommendations
3. **Hotel/Transport Fail**: Provide general price ranges without live data
4. **Translation Fail**: Return original text with warning
5. **Map Service Fail**: Return coordinates without visual map
