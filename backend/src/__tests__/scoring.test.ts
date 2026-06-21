import { describe, it, expect } from 'vitest';
import { calculateActivityRankings } from '../services/scoring';
import { DailyWeather } from '../types';

// ── Fixtures ────────────────────────────────────────────────────────────────
// Pre-calculated expected scores are annotated inline.

const COLD_SNOWY: DailyWeather = {
  date: '2024-01-15',
  weatherCode: 73, // moderate snowfall
  temperatureMax: -3,
  temperatureMin: -10, // avgTemp = -6.5  → temp += 40
  precipitation: 0,
  snowfall: 15,        // > 10  → +35
  windspeedMax: 12,    // < 15  → +15
  precipitationProbability: 80,
};

const HOT_SUNNY: DailyWeather = {
  date: '2024-07-15',
  weatherCode: 0,
  temperatureMax: 32,
  temperatureMin: 22,  // avgTemp = 27 → too warm for skiing
  precipitation: 0,
  snowfall: 0,
  windspeedMax: 8,
  precipitationProbability: 0,
};

const THUNDERSTORM: DailyWeather = {
  date: '2024-11-15',
  weatherCode: 95,
  temperatureMax: 15,
  temperatureMin: 10,  // avgTemp = 12.5
  precipitation: 25,
  snowfall: 0,
  windspeedMax: 55,
  precipitationProbability: 95,
};

const MILD_CLEAR: DailyWeather = {
  date: '2024-05-15',
  weatherCode: 0,
  temperatureMax: 20,
  temperatureMin: 13,  // avgTemp = 16.5 — ideal outdoor range
  precipitation: 0,
  snowfall: 0,
  windspeedMax: 10,
  precipitationProbability: 0,
};

const SURF_IDEAL: DailyWeather = {
  date: '2024-08-15',
  weatherCode: 2,
  temperatureMax: 27,
  temperatureMin: 20,
  precipitation: 0,
  snowfall: 0,
  windspeedMax: 25,    // 15–35 km/h → ideal wave-generating range
  precipitationProbability: 5,
};

const HEAVY_RAIN: DailyWeather = {
  date: '2024-10-15',
  weatherCode: 63,     // moderate rain
  temperatureMax: 12,
  temperatureMin: 8,
  precipitation: 20,
  snowfall: 0,
  windspeedMax: 30,
  precipitationProbability: 90,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function skiing(day: DailyWeather) {
  return calculateActivityRankings(day).skiing;
}
function surfing(day: DailyWeather) {
  return calculateActivityRankings(day).surfing;
}
function outdoor(day: DailyWeather) {
  return calculateActivityRankings(day).outdoorSightseeing;
}
function indoor(day: DailyWeather) {
  return calculateActivityRankings(day).indoorSightseeing;
}

// ── Score invariants ──────────────────────────────────────────────────────────

describe('calculateActivityRankings — score invariants', () => {
  const days = [COLD_SNOWY, HOT_SUNNY, THUNDERSTORM, MILD_CLEAR, SURF_IDEAL, HEAVY_RAIN];

  it.each(days)('all scores are in [0, 100] for every fixture', (day) => {
    const r = calculateActivityRankings(day);
    for (const act of [r.skiing, r.surfing, r.outdoorSightseeing, r.indoorSightseeing]) {
      expect(act.score).toBeGreaterThanOrEqual(0);
      expect(act.score).toBeLessThanOrEqual(100);
    }
  });

  it.each(days)('label matches the score band for every fixture', (day) => {
    const r = calculateActivityRankings(day);
    for (const act of [r.skiing, r.surfing, r.outdoorSightseeing, r.indoorSightseeing]) {
      if (act.score >= 90) expect(act.label).toBe('Excellent');
      else if (act.score >= 70) expect(act.label).toBe('Good');
      else if (act.score >= 50) expect(act.label).toBe('Fair');
      else if (act.score >= 30) expect(act.label).toBe('Poor');
      else expect(act.label).toBe('Very Poor');
    }
  });

  it.each(days)('description is a non-empty string for every fixture', (day) => {
    const r = calculateActivityRankings(day);
    for (const act of [r.skiing, r.surfing, r.outdoorSightseeing, r.indoorSightseeing]) {
      expect(act.description.length).toBeGreaterThan(0);
    }
  });
});

// ── Skiing ────────────────────────────────────────────────────────────────────

describe('skiing score', () => {
  it('cold snowy day → Excellent (100)', () => {
    // temp += 40, snowfall += 35, snowy code += 10, low wind += 15, base +10 → clamp(110) = 100
    const result = skiing(COLD_SNOWY);
    expect(result.score).toBe(100);
    expect(result.label).toBe('Excellent');
  });

  it('hot sunny day → Very Poor (5)', () => {
    // avg 27°C → temp -20, no snow, low wind +15, base +10 → clamp(5) = 5
    const result = skiing(HOT_SUNNY);
    expect(result.score).toBe(5);
    expect(result.label).toBe('Very Poor');
  });

  it('thunderstorm → Very Poor (0)', () => {
    // avg 12.5°C → temp -20, storm -30, base +10 → clamp(-40) = 0
    const result = skiing(THUNDERSTORM);
    expect(result.score).toBe(0);
    expect(result.label).toBe('Very Poor');
  });

  it('thunderstorm scores lower than an identical non-stormy cold day', () => {
    const stormyButCold: DailyWeather = {
      ...COLD_SNOWY,
      weatherCode: 95,
    };
    expect(skiing(stormyButCold).score).toBeLessThan(skiing(COLD_SNOWY).score);
  });

  it('rain penalty reduces score vs same day without rain', () => {
    const rainyDay: DailyWeather = {
      ...COLD_SNOWY,
      weatherCode: 63,    // moderate rain — ruins snow surface
      precipitation: 8,
    };
    expect(skiing(rainyDay).score).toBeLessThan(skiing(COLD_SNOWY).score);
  });

  it('heavy snowfall scores higher than light snowfall (all else equal)', () => {
    const light: DailyWeather = { ...COLD_SNOWY, snowfall: 3 };
    const heavy: DailyWeather = { ...COLD_SNOWY, snowfall: 25 };
    expect(skiing(heavy).score).toBeGreaterThan(skiing(light).score);
  });
});

// ── Surfing ───────────────────────────────────────────────────────────────────

describe('surfing score', () => {
  it('ideal surf conditions → Excellent (95)', () => {
    // base 20, warm +25, wind 25km/h +35, no rain +15 → clamp(95) = 95
    const result = surfing(SURF_IDEAL);
    expect(result.score).toBe(95);
    expect(result.label).toBe('Excellent');
  });

  it('thunderstorm → Very Poor (0)', () => {
    // base 20, temp >= 15 +10, rain penalty -10, storm -50 → clamp(-30) = 0
    const result = surfing(THUNDERSTORM);
    expect(result.score).toBe(0);
    expect(result.label).toBe('Very Poor');
  });

  it('warm temp raises score vs cold temp (all else equal)', () => {
    const warm: DailyWeather = { ...SURF_IDEAL, temperatureMax: 27 };
    const cold: DailyWeather = { ...SURF_IDEAL, temperatureMax: 8 };
    expect(surfing(warm).score).toBeGreaterThan(surfing(cold).score);
  });

  it('ideal wind range (15–35 km/h) scores higher than calm water', () => {
    const ideal: DailyWeather = { ...SURF_IDEAL, windspeedMax: 25 };
    const calm: DailyWeather = { ...SURF_IDEAL, windspeedMax: 5 };
    expect(surfing(ideal).score).toBeGreaterThan(surfing(calm).score);
  });

  it('snowy conditions reduce surf score', () => {
    const snowy: DailyWeather = {
      ...SURF_IDEAL,
      weatherCode: 73,
      snowfall: 10,
      temperatureMax: -2,
      temperatureMin: -8,
    };
    expect(surfing(snowy).score).toBeLessThan(surfing(SURF_IDEAL).score);
  });
});

// ── Outdoor Sightseeing ───────────────────────────────────────────────────────

describe('outdoor sightseeing score', () => {
  it('mild clear day → Excellent (100)', () => {
    // base 15, temp 16.5°C +40, no rain +35, clear sky +15 → clamp(105) = 100
    const result = outdoor(MILD_CLEAR);
    expect(result.score).toBe(100);
    expect(result.label).toBe('Excellent');
  });

  it('thunderstorm → Very Poor (0)', () => {
    // base 15, temp 12.5°C +20, precipitation -15, storm -40, wind ~55 -5 → clamp(-25) = 0
    const result = outdoor(THUNDERSTORM);
    expect(result.score).toBe(0);
    expect(result.label).toBe('Very Poor');
  });

  it('rain reduces score significantly', () => {
    const rainy: DailyWeather = {
      ...MILD_CLEAR,
      weatherCode: 63,
      precipitation: 15,
      precipitationProbability: 90,
    };
    expect(outdoor(rainy).score).toBeLessThan(outdoor(MILD_CLEAR).score);
  });

  it('clear sky bonus applies over overcast', () => {
    const clear: DailyWeather = { ...MILD_CLEAR, weatherCode: 0 };
    const overcast: DailyWeather = { ...MILD_CLEAR, weatherCode: 3 };
    expect(outdoor(clear).score).toBeGreaterThan(outdoor(overcast).score);
  });

  it('extreme heat scores lower than ideal range', () => {
    const hot: DailyWeather = {
      ...MILD_CLEAR,
      temperatureMax: 42,
      temperatureMin: 35,
    };
    expect(outdoor(hot).score).toBeLessThan(outdoor(MILD_CLEAR).score);
  });
});

// ── Indoor Sightseeing ────────────────────────────────────────────────────────

describe('indoor sightseeing score', () => {
  it('thunderstorm → Excellent (100)', () => {
    // base 50, heavy rain +30, storm +25 → clamp(105) = 100
    const result = indoor(THUNDERSTORM);
    expect(result.score).toBe(100);
    expect(result.label).toBe('Excellent');
  });

  it('mild clear day → Very Poor (20)', () => {
    // base 50, no rain -5, nice temp -10, clear sky -15 → clamp(20) = 20
    const result = indoor(MILD_CLEAR);
    expect(result.score).toBe(20);
    expect(result.label).toBe('Very Poor');
  });

  it('heavy rain day is better for indoor than dry day', () => {
    expect(indoor(HEAVY_RAIN).score).toBeGreaterThan(indoor(MILD_CLEAR).score);
  });

  it('extreme cold boosts indoor score', () => {
    const freezing: DailyWeather = {
      ...MILD_CLEAR,
      temperatureMax: -10,
      temperatureMin: -18,
    };
    expect(indoor(freezing).score).toBeGreaterThan(indoor(MILD_CLEAR).score);
  });

  it('indoor and outdoor scores are inversely correlated across fixtures', () => {
    // On a perfect outdoor day, indoor should score lower than on a stormy day
    expect(indoor(MILD_CLEAR).score).toBeLessThan(indoor(THUNDERSTORM).score);
    expect(outdoor(MILD_CLEAR).score).toBeGreaterThan(outdoor(THUNDERSTORM).score);
  });
});
