import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

import { fetchWeatherForecast } from '../services/weather';

const MOCK_DAILY_RESPONSE = {
  latitude: 51.5,
  longitude: -0.12,
  timezone: 'Europe/London',
  daily: {
    time: [
      '2024-06-17',
      '2024-06-18',
      '2024-06-19',
      '2024-06-20',
      '2024-06-21',
      '2024-06-22',
      '2024-06-23',
    ],
    weathercode: [0, 2, 63, 3, 0, 71, 95],
    temperature_2m_max: [22, 21, 18, 19, 23, 5, 15],
    temperature_2m_min: [14, 13, 11, 12, 15, -1, 10],
    precipitation_sum: [0, 1.2, 8.5, 0.5, 0, 0, 18],
    snowfall_sum: [0, 0, 0, 0, 0, 5, 0],
    windspeed_10m_max: [15, 20, 25, 18, 10, 12, 55],
    precipitation_probability_max: [5, 30, 70, 20, 0, 40, 90],
  },
};

describe('fetchWeatherForecast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an array of 7 daily weather objects', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DAILY_RESPONSE });

    const result = await fetchWeatherForecast(51.5, -0.12);

    expect(result).toHaveLength(7);
  });

  it('correctly maps the first day from the API response', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DAILY_RESPONSE });

    const [first] = await fetchWeatherForecast(51.5, -0.12);

    expect(first.date).toBe('2024-06-17');
    expect(first.weatherCode).toBe(0);
    expect(first.temperatureMax).toBe(22);
    expect(first.temperatureMin).toBe(14);
    expect(first.precipitation).toBe(0);
    expect(first.snowfall).toBe(0);
    expect(first.windspeedMax).toBe(15);
    expect(first.precipitationProbability).toBe(5);
  });

  it('maps a snowy day correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DAILY_RESPONSE });

    const forecast = await fetchWeatherForecast(51.5, -0.12);
    const snowDay = forecast[5]; // index 5 = 2024-06-22, weathercode 71

    expect(snowDay.date).toBe('2024-06-22');
    expect(snowDay.weatherCode).toBe(71);
    expect(snowDay.snowfall).toBe(5);
    expect(snowDay.temperatureMax).toBe(5);
    expect(snowDay.temperatureMin).toBe(-1);
  });

  it('calls the Open-Meteo forecast endpoint with lat/lon params', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DAILY_RESPONSE });

    await fetchWeatherForecast(51.5, -0.12);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.open-meteo.com/v1/forecast',
      expect.objectContaining({
        params: expect.objectContaining({
          latitude: 51.5,
          longitude: -0.12,
          forecast_days: 7,
          timezone: 'auto',
        }),
      })
    );
  });

  it('requests all required daily variables', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DAILY_RESPONSE });

    await fetchWeatherForecast(0, 0);

    const { params } = (mockedAxios.get.mock.calls[0][1] as { params: Record<string, string> });
    const requestedVars = params['daily'].split(',');

    expect(requestedVars).toContain('weathercode');
    expect(requestedVars).toContain('temperature_2m_max');
    expect(requestedVars).toContain('temperature_2m_min');
    expect(requestedVars).toContain('precipitation_sum');
    expect(requestedVars).toContain('snowfall_sum');
    expect(requestedVars).toContain('windspeed_10m_max');
    expect(requestedVars).toContain('precipitation_probability_max');
  });

  it('defaults null precipitation/snowfall values to 0', async () => {
    const responseWithNulls = {
      ...MOCK_DAILY_RESPONSE,
      daily: {
        ...MOCK_DAILY_RESPONSE.daily,
        precipitation_sum: [null, ...MOCK_DAILY_RESPONSE.daily.precipitation_sum.slice(1)],
        snowfall_sum: [null, ...MOCK_DAILY_RESPONSE.daily.snowfall_sum.slice(1)],
        precipitation_probability_max: [null, ...MOCK_DAILY_RESPONSE.daily.precipitation_probability_max.slice(1)],
      },
    };
    mockedAxios.get.mockResolvedValueOnce({ data: responseWithNulls });

    const [first] = await fetchWeatherForecast(0, 0);

    expect(first.precipitation).toBe(0);
    expect(first.snowfall).toBe(0);
    expect(first.precipitationProbability).toBe(0);
  });

  it('propagates axios errors', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API unreachable'));

    await expect(fetchWeatherForecast(0, 0)).rejects.toThrow('API unreachable');
  });
});
