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

export interface DailyForecast {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitation: number;
  snowfall: number;
  windspeedMax: number;
  precipitationProbability: number;
  rankings: ActivityRankings;
}

export interface CityWeatherResult {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  forecast: DailyForecast[];
}
