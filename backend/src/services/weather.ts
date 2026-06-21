import axios from 'axios';
import { WeatherForecastResponse, DailyWeather } from '../types';

const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1';

export async function fetchWeatherForecast(
  latitude: number,
  longitude: number
): Promise<DailyWeather[]> {
  const response = await axios.get<WeatherForecastResponse>(
    `${WEATHER_BASE_URL}/forecast`,
    {
      params: {
        latitude,
        longitude,
        daily: [
          'weathercode',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'snowfall_sum',
          'windspeed_10m_max',
          'precipitation_probability_max',
        ].join(','),
        forecast_days: 7,
        // 'auto' resolves the timezone from the coordinates so that the
        // returned date strings reflect the city's local calendar day, not UTC.
        timezone: 'auto',
      },
    }
  );

  const { daily } = response.data;

  return daily.time.map((date, i) => ({
    date,
    weatherCode: daily.weathercode[i],
    temperatureMax: daily.temperature_2m_max[i],
    temperatureMin: daily.temperature_2m_min[i],
    // Open-Meteo returns null (not 0) for precipitation/snowfall on dry days.
    precipitation: daily.precipitation_sum[i] ?? 0,
    snowfall: daily.snowfall_sum[i] ?? 0,
    windspeedMax: daily.windspeed_10m_max[i],
    precipitationProbability: daily.precipitation_probability_max[i] ?? 0,
  }));
}
