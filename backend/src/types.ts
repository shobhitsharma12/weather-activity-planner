export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  timezone: string;
}

export interface DailyWeatherRaw {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  snowfall_sum: number[];
  windspeed_10m_max: number[];
  precipitation_probability_max: number[];
}

export interface WeatherForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: DailyWeatherRaw;
}

export interface DailyWeather {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitation: number;
  snowfall: number;
  windspeedMax: number;
  precipitationProbability: number;
}

export interface ActivityScore {
  score: number;
  label: string;
  description: string;
}

export interface ActivityRankings {
  skiing: ActivityScore;
  surfing: ActivityScore;
  outdoorSightseeing: ActivityScore;
  indoorSightseeing: ActivityScore;
}

export interface DailyForecast extends DailyWeather {
  rankings: ActivityRankings;
}

export interface CityWeatherResult {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  forecast: DailyForecast[];
}
