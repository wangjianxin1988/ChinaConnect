/**
 * WeatherWidget - Displays current weather and forecast for a city
 * Supports Celsius/Fahrenheit toggle and falls back to mock data
 */

import { fetchWeather, toFahrenheit, getWeatherIconUrl, getWeatherEmoji } from "@/services/weather-api";
import type { TempUnit } from "@/services/weather-api";
import { useEffect, useState } from "react";

interface WeatherWidgetProps {
  city: string;
  lat?: number;
  lng?: number;
  className?: string;
}

export function WeatherWidget({ city, lat, lng, className = "" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<import("@/services/weather-api").WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TempUnit>("celsius");

  useEffect(() => {
    if (!city) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchWeather(city, lat, lng)
      .then((data) => {
        if (!cancelled) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load weather");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [city, lat, lng]);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-pulse w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-600 rounded w-24" />
            <div className="animate-pulse h-3 bg-gray-100 dark:bg-gray-700 rounded w-16" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 animate-pulse h-16 bg-gray-100 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  const { current, forecast } = weather;
  const displayTemp = (c: number) =>
    unit === "celsius" ? `${c}°C` : `${toFahrenheit(c)}°F`;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      {/* Header with unit toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img
            src={getWeatherIconUrl(current.icon, 2)}
            alt={current.description}
            className="w-12 h-12"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <div className="text-2xl font-bold">{displayTemp(current.temp)}</div>
            <div className="text-xs text-gray-500 capitalize">{current.description}</div>
          </div>
        </div>

        {/* Unit toggle */}
        <button
          onClick={() => setUnit((u) => (u === "celsius" ? "fahrenheit" : "celsius"))}
          className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full px-2 py-1 transition-colors"
          title="Toggle temperature unit"
        >
          <span className={unit === "celsius" ? "font-bold text-blue-600" : "text-gray-400"}>°C</span>
          <span className="text-gray-300">/</span>
          <span className={unit === "fahrenheit" ? "font-bold text-orange-600" : "text-gray-400"}>°F</span>
        </button>
      </div>

      {/* Current conditions */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
        <ConditionItem icon="💧" label="Humidity" value={`${current.humidity}%`} />
        <ConditionItem icon="💨" label="Wind" value={`${current.windSpeed} m/s`} />
        <ConditionItem icon="🌡️" label="Feels" value={displayTemp(current.feelsLike)} />
      </div>

      {/* 3-day forecast */}
      {forecast.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">3-Day Forecast</div>
          <div className="flex gap-2">
            {forecast.slice(0, 3).map((day) => (
              <div
                key={day.date}
                className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center"
              >
                <div className="text-xs font-medium mb-1">{day.dayName}</div>
                <div className="text-lg">{getWeatherEmoji(day.icon)}</div>
                <div className="text-xs mt-1">
                  <span className="font-semibold">{displayTemp(day.tempMax)}</span>
                  <span className="text-gray-400 mx-0.5"> / </span>
                  <span className="text-gray-500">{displayTemp(day.tempMin)}</span>
                </div>
                {day.pop > 0 && (
                  <div className="text-xs text-blue-500 mt-0.5">
                    {Math.round(day.pop * 100)}% rain
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source badge */}
      {weather.source === "mock" && (
        <div className="text-center text-xs text-gray-400 mt-2">
          Demo data - set PUBLIC_OWM_API_KEY for live weather
        </div>
      )}
    </div>
  );
}

function ConditionItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
      <div className="text-base mb-0.5">{icon}</div>
      <div className="text-gray-500 text-[10px]">{label}</div>
      <div className="font-medium text-xs">{value}</div>
    </div>
  );
}

export default WeatherWidget;