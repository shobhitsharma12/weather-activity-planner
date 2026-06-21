import { geocodeCity } from '../services/geocoding';
import { fetchWeatherForecast } from '../services/weather';
import { calculateActivityRankings } from '../services/scoring';
import { CityWeatherResult } from '../types';

export const resolvers = {
  Query: {
    /**
     * Resolves weather-based activity rankings for a given city.
     * Orchestrates three sequential service calls:
     *   1. Geocode the city name → coordinates
     *   2. Fetch a 7-day daily forecast for those coordinates
     *   3. Score each day across all four activities
     */
    cityWeatherRankings: async (
      _: unknown,
      { city }: { city: string }
    ): Promise<CityWeatherResult> => {
      const location = await geocodeCity(city);

      const dailyWeather = await fetchWeatherForecast(
        location.latitude,
        location.longitude
      );

      const forecast = dailyWeather.map((day) => ({
        ...day,
        rankings: calculateActivityRankings(day),
      }));

      return {
        city: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        forecast,
      };
    },
  },
};
