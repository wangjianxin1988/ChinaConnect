/**
 * Weather API Service
 * Fetches current weather and 5-day forecast from OpenMeteo (primary, free) or OpenWeatherMap (backup)
 * Falls back to static mock data when API is unavailable
 */

export type TempUnit = "celsius" | "fahrenheit";

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string; // icon code e.g. "01d"
  main: string; // e.g. "Clear", "Clouds"
  pressure: number;
  visibility: number;
  sunrise: number; // unix
  sunset: number; // unix
}

export interface ForecastDay {
  date: string; // ISO date string
  dayName: string; // e.g. "Mon"
  tempMin: number;
  tempMax: number;
  main: string;
  description: string;
  icon: string;
  humidity: number;
  pop: number; // probability of precipitation 0-1
}

export interface WeatherData {
  city: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
  source: "api" | "mock";
  fetchedAt: number;
}

// Static mock weather data by city (for when no API key)
const MOCK_WEATHER: Record<string, WeatherData> = {
  beijing: {
    city: "Beijing",
    current: {
      temp: 22,
      feelsLike: 21,
      humidity: 45,
      windSpeed: 3.5,
      description: "partly cloudy",
      icon: "02d",
      main: "Clouds",
      pressure: 1012,
      visibility: 10000,
      sunrise: 1694300000,
      sunset: 1694346000,
    },
    forecast: [
      { date: "2026-05-27", dayName: "Wed", tempMin: 18, tempMax: 25, main: "Clouds", description: "overcast clouds", icon: "04d", humidity: 50, pop: 0.1 },
      { date: "2026-05-28", dayName: "Thu", tempMin: 19, tempMax: 27, main: "Clear", description: "clear sky", icon: "01d", humidity: 40, pop: 0 },
      { date: "2026-05-29", dayName: "Fri", tempMin: 20, tempMax: 28, main: "Clear", description: "clear sky", icon: "01d", humidity: 38, pop: 0 },
    ],
    source: "mock",
    fetchedAt: Date.now(),
  },
  shanghai: {
    city: "Shanghai",
    current: {
      temp: 25,
      feelsLike: 26,
      humidity: 72,
      windSpeed: 2.8,
      description: "light rain",
      icon: "10d",
      main: "Rain",
      pressure: 1008,
      visibility: 8000,
      sunrise: 1694288000,
      sunset: 1694334000,
    },
    forecast: [
      { date: "2026-05-27", dayName: "Wed", tempMin: 22, tempMax: 26, main: "Rain", description: "light rain", icon: "10d", humidity: 80, pop: 0.8 },
      { date: "2026-05-28", dayName: "Thu", tempMin: 23, tempMax: 28, main: "Clouds", description: "scattered clouds", icon: "03d", humidity: 65, pop: 0.3 },
      { date: "2026-05-29", dayName: "Fri", tempMin: 24, tempMax: 30, main: "Clear", description: "clear sky", icon: "01d", humidity: 55, pop: 0 },
    ],
    source: "mock",
    fetchedAt: Date.now(),
  },
  "default": {
    city: "Unknown",
    current: {
      temp: 20,
      feelsLike: 19,
      humidity: 60,
      windSpeed: 3,
      description: "clear sky",
      icon: "01d",
      main: "Clear",
      pressure: 1013,
      visibility: 10000,
      sunrise: 1694300000,
      sunset: 1694346000,
    },
    forecast: [
      { date: "2026-05-27", dayName: "Wed", tempMin: 17, tempMax: 23, main: "Clear", description: "clear sky", icon: "01d", humidity: 55, pop: 0 },
      { date: "2026-05-28", dayName: "Thu", tempMin: 18, tempMax: 24, main: "Clouds", description: "few clouds", icon: "02d", humidity: 50, pop: 0.1 },
      { date: "2026-05-29", dayName: "Fri", tempMin: 19, tempMax: 25, main: "Clear", description: "clear sky", icon: "01d", humidity: 45, pop: 0 },
    ],
    source: "mock",
    fetchedAt: Date.now(),
  },
};

// City name normalization
function normalizeCity(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

const WEATHER_CACHE_KEY = "chinaconnect-weather";
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface WeatherCache {
  [city: string]: WeatherData & { cachedAt: number };
}

function getCached(city: string): WeatherData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const cache: WeatherCache = JSON.parse(raw);
    const entry = cache[city];
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > WEATHER_CACHE_TTL) return null;
    const { cachedAt, ...data } = entry;
    return data as WeatherData;
  } catch {
    return null;
  }
}

function setCached(city: string, data: WeatherData): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    const cache: WeatherCache = raw ? JSON.parse(raw) : {};
    cache[city] = { ...data, cachedAt: Date.now() };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

/**
 * Fetch weather for a city. Uses OpenMeteo (free, no API key) or OpenWeatherMap (requires key).
 */
export async function fetchWeather(
  city: string,
  lat?: number,
  lng?: number,
): Promise<WeatherData> {
  // Try cache first
  const normalizedCity = normalizeCity(city);
  const cached = getCached(normalizedCity);
  if (cached) return cached;

  // Try OpenMeteo first (free, no API key)
  if (lat !== undefined && lng !== undefined) {
    try {
      const result = await fetchFromOpenMeteo(city, lat, lng);
      if (result) {
        setCached(normalizedCity, result);
        return result;
      }
    } catch {
      // Fall through to next option
    }

    // Try OpenWeatherMap if API key is set
    const apiKey = import.meta.env.PUBLIC_OWM_API_KEY;
    if (apiKey) {
      try {
        const result = await fetchFromOpenWeatherMap(city, lat, lng, apiKey);
        if (result) {
          setCached(normalizedCity, result);
          return result;
        }
      } catch {
        // Fall through to mock
      }
    }
  }

  // Fallback to mock
  const mockKey = Object.keys(MOCK_WEATHER).find(
    (k) => k !== "default" && normalizedCity.includes(k),
  );
  const mock = MOCK_WEATHER[mockKey || "default"];
  const result = { ...mock, city };
  setCached(normalizedCity, result);
  return result;
}

/**
 * Fetch weather from OpenMeteo API (free, no API key required)
 */
async function fetchFromOpenMeteo(
  city: string,
  lat: number,
  lng: number,
): Promise<WeatherData | null> {
  const [weatherRes, forecastRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&timezone=auto`,
    ),
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=4`,
    ),
  ]);

  if (!weatherRes.ok || !forecastRes.ok) return null;

  const weather = await weatherRes.json();
  const forecast = await forecastRes.json();

  return buildWeatherDataFromOpenMeteo(city, weather, forecast);
}

function buildWeatherDataFromOpenMeteo(
  city: string,
  current: Record<string, unknown>,
  forecast: Record<string, unknown>,
): WeatherData {
  const currentData = current.current as Record<string, unknown>;
  const dailyData = forecast.daily as Record<string, unknown>;

  // Map weather codes to icon codes
  const weatherCode = currentData.weather_code as number;
  const icon = mapOpenMeteoToIcon(weatherCode);

  // Build forecast days
  const times = dailyData.time as string[];
  const forecastDays: ForecastDay[] = times.slice(1, 4).map((date, i) => ({
    date,
    dayName: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    tempMin: Math.round((dailyData.temperature_2m_min as number[])[i + 1]),
    tempMax: Math.round((dailyData.temperature_2m_max as number[])[i + 1]),
    main: getWeatherMain(weatherCode),
    description: getWeatherDescription(weatherCode),
    icon: mapOpenMeteoToIcon((dailyData.weather_code as number[])[i + 1]),
    humidity: currentData.relative_humidity_2m as number,
    pop: ((dailyData.precipitation_probability_max as number[])[i + 1] || 0) / 100,
  }));

  return {
    city,
    current: {
      temp: Math.round(currentData.temperature_2m as number),
      feelsLike: Math.round(currentData.apparent_temperature as number),
      humidity: currentData.relative_humidity_2m as number,
      windSpeed: currentData.wind_speed_10m as number,
      description: getWeatherDescription(weatherCode),
      icon,
      main: getWeatherMain(weatherCode),
      pressure: currentData.surface_pressure as number,
      visibility: 10000,
      sunrise: 0,
      sunset: 0,
    },
    forecast: forecastDays,
    source: "api",
    fetchedAt: Date.now(),
  };
}

function mapOpenMeteoToIcon(code: number): string {
  // Map OpenMeteo weather codes to OpenWeatherMap-style icon codes
  const mapping: Record<number, string> = {
    0: "01d", // Clear sky
    1: "02d", // Mainly clear
    2: "03d", // Partly cloudy
    3: "04d", // Overcast
    45: "50d", // Fog
    48: "50d", // Depositing rime fog
    51: "09d", // Light drizzle
    53: "09d", // Moderate drizzle
    55: "09d", // Dense drizzle
    61: "10d", // Slight rain
    63: "10d", // Moderate rain
    65: "10d", // Heavy rain
    71: "13d", // Slight snow
    73: "13d", // Moderate snow
    75: "13d", // Heavy snow
    77: "13d", // Snow grains
    80: "09d", // Slight rain showers
    81: "09d", // Moderate rain showers
    82: "09d", // Violent rain showers
    85: "13d", // Slight snow showers
    86: "13d", // Heavy snow showers
    95: "11d", // Thunderstorm
    96: "11d", // Thunderstorm with slight hail
    99: "11d", // Thunderstorm with heavy hail
  };
  return mapping[code] || "01d";
}

function getWeatherMain(code: number): string {
  if (code === 0) return "Clear";
  if (code >= 1 && code <= 3) return "Clouds";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 86) return "Snow";
  if (code >= 95) return "Thunderstorm";
  return "Clear";
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "clear sky",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "depositing rime fog",
    51: "light drizzle",
    53: "moderate drizzle",
    55: "dense drizzle",
    61: "slight rain",
    63: "moderate rain",
    65: "heavy rain",
    71: "slight snow",
    73: "moderate snow",
    75: "heavy snow",
    77: "snow grains",
    80: "slight rain showers",
    81: "moderate rain showers",
    82: "violent rain showers",
    85: "slight snow showers",
    86: "heavy snow showers",
    95: "thunderstorm",
    96: "thunderstorm with slight hail",
    99: "thunderstorm with heavy hail",
  };
  return descriptions[code] || "clear";
}

/**
 * Fetch weather from OpenWeatherMap API (requires API key)
 */
async function fetchFromOpenWeatherMap(
  city: string,
  lat: number,
  lng: number,
  apiKey: string,
): Promise<WeatherData | null> {
  const [currentRes, forecastRes] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`,
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&cnt=24&appid=${apiKey}`,
    ),
  ]);

  if (!currentRes.ok || !forecastRes.ok) return null;

  const current = await currentRes.json();
  const forecast = await forecastRes.json();

  return buildWeatherData(city, current, forecast, "api");
}

function buildWeatherData(
  city: string,
  current: Record<string, unknown>,
  forecast: Record<string, unknown>,
  source: "api" | "mock",
): WeatherData {
  const cur = current as {
    name: string;
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
      pressure: number;
      visibility?: number;
    };
    weather: Array<{ main: string; description: string; icon: string }>;
    wind: { speed: number };
    sys: { sunrise: number; sunset: number };
  };

  const list = (forecast.list || []) as Array<{
    dt: number;
    main: { temp_min: number; temp_max: number };
    weather: Array<{ main: string; description: string; icon: string }>;
    humidity: number;
    pop: number;
  }>;

  // Group by day
  const byDay = new Map<string, (typeof list)[number]>();
  const forecastDays: ForecastDay[] = [];
  for (const item of list) {
    const dateStr = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!byDay.has(dateStr) && forecastDays.length < 3) {
      byDay.set(dateStr, item);
      forecastDays.push({
        date: dateStr,
        dayName: new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short" }),
        tempMin: Math.round(item.main.temp_min),
        tempMax: Math.round(item.main.temp_max),
        main: item.weather[0]?.main || "",
        description: item.weather[0]?.description || "",
        icon: item.weather[0]?.icon || "01d",
        humidity: item.humidity,
        pop: item.pop,
      });
    }
  }

  return {
    city: cur.name || city,
    current: {
      temp: Math.round(cur.main.temp),
      feelsLike: Math.round(cur.main.feels_like),
      humidity: cur.main.humidity,
      windSpeed: cur.wind.speed,
      description: cur.weather[0]?.description || "",
      icon: cur.weather[0]?.icon || "01d",
      main: cur.weather[0]?.main || "",
      pressure: cur.main.pressure,
      visibility: cur.main.visibility ?? 10000,
      sunrise: cur.sys.sunrise,
      sunset: cur.sys.sunset,
    },
    forecast: forecastDays,
    source,
    fetchedAt: Date.now(),
  };
}

/** Convert Celsius to Fahrenheit */
export function toFahrenheit(celsius: number): number {
  return Math.round(celsius * 9 / 5 + 32);
}

/** OpenWeatherMap icon URL */
export function getWeatherIconUrl(icon: string, size = 2): string {
  return `https://openweathermap.org/img/wn/${icon}@${size}x.png`;
}

/** Get a text label for a weather icon code */
export function getWeatherEmoji(icon: string): string {
  const map: Record<string, string> = {
    "01d": "☀️", "01n": "🌙",
    "02d": "⛅", "02n": "☁️",
    "03d": "☁️", "03n": "☁️",
    "04d": "☁️", "04n": "☁️",
    "09d": "🌧️", "09n": "🌧️",
    "10d": "🌦️", "10n": "🌧️",
    "11d": "⛈️", "11n": "⛈️",
    "13d": "🌨️", "13n": "🌨️",
    "50d": "🌫️", "50n": "🌫️",
  };
  return map[icon] || "🌡️";
}