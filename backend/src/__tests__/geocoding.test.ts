import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

import { geocodeCity } from '../services/geocoding';

const LONDON_RESULT = {
  id: 2643743,
  name: 'London',
  latitude: 51.50853,
  longitude: -0.12574,
  country: 'United Kingdom',
  country_code: 'GB',
  timezone: 'Europe/London',
};

describe('geocodeCity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns geocoding result for a valid city', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [LONDON_RESULT] },
    });

    const result = await geocodeCity('London');

    expect(result.name).toBe('London');
    expect(result.latitude).toBe(51.50853);
    expect(result.longitude).toBe(-0.12574);
    expect(result.country).toBe('United Kingdom');
    expect(result.country_code).toBe('GB');
  });

  it('returns the first result when multiple are returned', async () => {
    const second = { ...LONDON_RESULT, id: 999, name: 'London (Ontario)' };
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [LONDON_RESULT, second] },
    });

    const result = await geocodeCity('London');
    expect(result.name).toBe('London');
  });

  it('throws a descriptive error when results array is empty', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });

    await expect(geocodeCity('Atlantis')).rejects.toThrow(
      'City "Atlantis" not found'
    );
  });

  it('throws when the API returns no results property', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {} });

    await expect(geocodeCity('Nowhere')).rejects.toThrow(
      'City "Nowhere" not found'
    );
  });

  it('calls the Open-Meteo geocoding endpoint with correct params', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [LONDON_RESULT] },
    });

    await geocodeCity('London');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://geocoding-api.open-meteo.com/v1/search',
      expect.objectContaining({
        params: expect.objectContaining({
          name: 'London',
          count: 1,
          language: 'en',
          format: 'json',
        }),
      })
    );
  });

  it('propagates unexpected axios errors', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(geocodeCity('London')).rejects.toThrow('Network Error');
  });
});
