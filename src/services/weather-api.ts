/**
 * Weather API Service
 * Fetches current weather and 5-day forecast from OpenWeatherMap
 * Falls back to static mock data when API key is not configured
 */

export type TempUnit = "celsius" | "fahrenheit";

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string; // openweather icon code e.g. "01d"
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
 * Fetch weather for a city. Uses API if OWM_API_KEY is set, else mock data.
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

  const apiKey = import.meta.env.PUBLIC_OWM_API_KEY;

  if (apiKey && lat !== undefined && lng !== undefined) {
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`,
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&cnt=24&appid=${apiKey}`,
        ),
      ]);

      if (currentRes.ok && forecastRes.ok) {
        const current = await currentRes.json();
        const forecast = await forecastRes.json();

        const result = buildWeatherData(city, current, forecast, "api");
        setCached(normalizedCity, result);
        return result;
      }
    } catch {
      // Fall through to mock
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