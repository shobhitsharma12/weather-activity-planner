import { DailyForecast } from '../types';
import ActivityBadge from './ActivityBadge';

interface DayCardProps {
  day: DailyForecast;
}

// WMO weather interpretation codes → emoji icon.
// Codes are grouped by category; unmapped codes fall back to a thermometer.
// Full reference: https://open-meteo.com/en/docs#weathervariables
const WEATHER_ICONS: Record<number, string> = {
  // Clear / cloudy
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  // Fog
  45: '🌫️', 48: '🌫️',
  // Drizzle
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  // Rain
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  // Snow
  71: '🌨️', 73: '🌨️', 75: '❄️', 77: '🌨️',
  // Rain showers
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  // Snow showers
  85: '🌨️', 86: '❄️',
  // Thunderstorm
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

function weatherIcon(code: number): string {
  return WEATHER_ICONS[code] ?? '🌡️';
}

function formatDate(iso: string): { weekday: string; date: string } {
  // Append noon local time so JS doesn't parse the bare date as UTC midnight,
  // which would shift the day backward in timezones west of UTC.
  const d = new Date(iso + 'T12:00:00');
  return {
    weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  };
}

export default function DayCard({ day }: DayCardProps) {
  const { weekday, date } = formatDate(day.date);

  return (
    <div className="day-card">
      <div className="day-header">
        <span className="day-weekday">{weekday}</span>
        <span className="day-date">{date}</span>
        <span className="day-icon">{weatherIcon(day.weatherCode)}</span>
      </div>

      <div className="day-temps">
        <span className="temp-max">{Math.round(day.temperatureMax)}°</span>
        <span className="temp-divider">/</span>
        <span className="temp-min">{Math.round(day.temperatureMin)}°</span>
      </div>

      <div className="day-meta">
        {day.precipitation > 0 && (
          <span className="meta-item">💧 {day.precipitation.toFixed(1)}mm</span>
        )}
        {day.snowfall > 0 && (
          <span className="meta-item">❄️ {day.snowfall.toFixed(1)}cm</span>
        )}
        <span className="meta-item">💨 {Math.round(day.windspeedMax)}km/h</span>
      </div>

      <div className="day-activities">
        <ActivityBadge activity="skiing"  score={day.rankings.skiing} />
        <ActivityBadge activity="surfing" score={day.rankings.surfing} />
        <ActivityBadge activity="outdoor" score={day.rankings.outdoorSightseeing} />
        <ActivityBadge activity="indoor"  score={day.rankings.indoorSightseeing} />
      </div>
    </div>
  );
}
