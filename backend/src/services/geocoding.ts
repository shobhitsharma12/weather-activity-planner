import axios from 'axios';
import { GeocodingResult } from '../types';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';

export async function geocodeCity(city: string): Promise<GeocodingResult> {
  const response = await axios.get<{ results?: GeocodingResult[] }>(
    `${GEOCODING_BASE_URL}/search`,
    {
      // count: 1 — we only need the highest-relevance match.
      params: { name: city, count: 1, language: 'en', format: 'json' },
    }
  );

  const results = response.data.results;
  if (!results || results.length === 0) {
    throw new Error(
      `City "${city}" not found. Please check the spelling and try again.`
    );
  }

  return results[0];
}
