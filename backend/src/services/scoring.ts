/**
 * Activity scoring engine.
 *
 * Each scorer returns a 0–100 integer derived from Open-Meteo daily weather
 * variables. The score reflects how desirable conditions are for that activity
 * on a specific day — not long-term safety or the user's skill level.
 *
 * Score bands:
 *   90–100  Excellent
 *   70–89   Good
 *   50–69   Fair
 *   30–49   Poor
 *   0–29    Very Poor
 */

import { DailyWeather, ActivityScore, ActivityRankings } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function getLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Poor';
  return 'Very Poor';
}

// WMO weather-code groups used across multiple scorers.
// Full code reference: https://open-meteo.com/en/docs#weathervariables
function isRainy(code: number): boolean {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
}

function isSnowy(code: number): boolean {
  return (code >= 71 && code <= 77) || code === 85 || code === 86;
}

function isStormy(code: number): boolean {
  return code >= 95;
}

// ── Label maps (module-level so they are not recreated on every call) ─────────

const SKIING_LABELS: Record<string, string> = {
  Excellent: 'Ideal powder conditions — cold temps and fresh snowfall',
  Good: 'Good skiing conditions with solid snow coverage',
  Fair: 'Manageable conditions — check trail reports before heading out',
  Poor: 'Too warm or insufficient snow — not recommended',
  'Very Poor': 'Conditions unsuitable for skiing',
};

const SURFING_LABELS: Record<string, string> = {
  Excellent: 'Perfect surf conditions — strong winds, warm weather, no storms',
  Good: 'Great day for surfing with favourable wind and comfortable temperatures',
  Fair: 'Decent conditions — manageable for experienced surfers',
  Poor: 'Calm waters or uncomfortable temperatures limit the experience',
  'Very Poor': 'Dangerous or unsuitable — avoid surfing today',
};

const OUTDOOR_LABELS: Record<string, string> = {
  Excellent: 'Perfect day for exploring outdoors — clear skies and ideal temperatures',
  Good: 'Great conditions for a city walk or outdoor tour',
  Fair: 'Acceptable weather — light layers recommended',
  Poor: 'Weather may dampen your outdoor experience',
  'Very Poor': 'Stay indoors — weather not suitable for outdoor sightseeing',
};

const INDOOR_LABELS: Record<string, string> = {
  Excellent: 'Perfect day for museums, galleries, and indoor attractions',
  Good: 'Great choice — weather makes indoor sightseeing very appealing',
  Fair: 'Indoor activities are a solid option today',
  Poor: 'Outdoor weather is better — consider exploring outside instead',
  'Very Poor': 'Beautiful outdoor day — save indoor sightseeing for a rainy day',
};

// ── Scorers ───────────────────────────────────────────────────────────────────

function scoreSkiing(day: DailyWeather): ActivityScore {
  // No unconditional base — skiing requires specific conditions from scratch.
  let score = 0;
  const avgTemp = (day.temperatureMax + day.temperatureMin) / 2;

  // Sub-zero temperatures are essential; peak bonus sits at -5 to -10 °C
  // where snow stays dry and groomed runs hold their surface.
  if (avgTemp < -10) score += 35;
  else if (avgTemp < -5) score += 40;
  else if (avgTemp < 0) score += 30;
  else if (avgTemp < 5) score += 10;
  else score -= 20;

  // Fresh snowfall is the primary draw for most skiers.
  if (day.snowfall > 20) score += 40;
  else if (day.snowfall > 10) score += 35;
  else if (day.snowfall > 5) score += 25;
  else if (day.snowfall > 0) score += 10;

  // Snowy weather code adds confidence that cover will last through the day.
  if (isSnowy(day.weatherCode)) score += 10;

  // Rain at ski temperatures degrades snow to heavy, wet slush.
  if (isRainy(day.weatherCode)) score -= 25;
  if (day.precipitation > 0 && !isSnowy(day.weatherCode)) score -= 10;

  // Moderate wind is tolerable; above 60 km/h lifts close and visibility drops.
  if (day.windspeedMax < 15) score += 15;
  else if (day.windspeedMax < 30) score += 8;
  else if (day.windspeedMax > 60) score -= 20;

  if (isStormy(day.weatherCode)) score -= 30;

  // +10 base offset: even a groomed slope without fresh snow is skiable.
  const finalScore = clamp(score + 10);
  const label = getLabel(finalScore);
  return { score: finalScore, label, description: SKIING_LABELS[label] };
}

function scoreSurfing(day: DailyWeather): ActivityScore {
  // Base of 20: ocean swells driven by distant weather systems mean there is
  // almost always *some* rideable wave, even on locally calm days.
  let score = 20;

  // Warmer air makes a multi-hour session comfortable without a wetsuit.
  if (day.temperatureMax >= 25) score += 25;
  else if (day.temperatureMax >= 20) score += 20;
  else if (day.temperatureMax >= 15) score += 10;
  else if (day.temperatureMax < 10) score -= 15;

  // 15–35 km/h is the sweet spot: enough to generate surf-able waves without
  // making the break choppy and difficult to read.
  if (day.windspeedMax >= 15 && day.windspeedMax <= 35) score += 35;
  else if (day.windspeedMax > 35 && day.windspeedMax <= 50) score += 20;
  else if (day.windspeedMax < 10) score += 5;
  else if (day.windspeedMax > 60) score -= 20;

  // Light rain is acceptable; heavy rain reduces visibility on the water.
  if (day.precipitation === 0) score += 15;
  else if (day.precipitation < 5) score += 8;
  else if (day.precipitation > 20) score -= 10;

  // Lightning and open water are a lethal combination.
  if (isStormy(day.weatherCode)) score -= 50;
  // Snowfall signals water temperatures too cold for comfortable surfing.
  if (isSnowy(day.weatherCode)) score -= 20;

  const finalScore = clamp(score);
  const label = getLabel(finalScore);
  return { score: finalScore, label, description: SURFING_LABELS[label] };
}

function scoreOutdoorSightseeing(day: DailyWeather): ActivityScore {
  // Small base: outdoor exploration is possible in almost any weather.
  let score = 15;
  const avgTemp = (day.temperatureMax + day.temperatureMin) / 2;

  // 15–22 °C is the comfortable walking range; above 28 it becomes tiring.
  if (avgTemp >= 15 && avgTemp <= 22) score += 40;
  else if (avgTemp > 22 && avgTemp <= 28) score += 30;
  else if (avgTemp >= 10 && avgTemp < 15) score += 20;
  else if (avgTemp > 28) score += 12;
  else if (avgTemp >= 5 && avgTemp < 10) score += 8;
  else score -= 5;

  // Rain is the single biggest deterrent for outdoor tourists.
  if (day.precipitation === 0 && day.precipitationProbability < 20) score += 35;
  else if (day.precipitation < 2) score += 20;
  else if (day.precipitation < 10) score += 5;
  else score -= 15;

  // Clear-sky bonus; storm penalty applied separately to avoid double-counting
  // with the precipitation block above.
  if (day.weatherCode === 0) score += 15;
  else if (day.weatherCode <= 3) score += 8;
  else if (isRainy(day.weatherCode)) score -= 20;
  else if (isSnowy(day.weatherCode)) score -= 10;

  if (isStormy(day.weatherCode)) score -= 40;

  // Sustained wind above 35 km/h makes walking uncomfortable and ruins photos.
  if (day.windspeedMax > 50) score -= 15;
  else if (day.windspeedMax > 35) score -= 5;

  const finalScore = clamp(score);
  const label = getLabel(finalScore);
  return { score: finalScore, label, description: OUTDOOR_LABELS[label] };
}

function scoreIndoorSightseeing(day: DailyWeather): ActivityScore {
  // Base of 50: museums and galleries are always a viable option regardless
  // of weather. The score rises as outdoor conditions deteriorate.
  let score = 50;
  const avgTemp = (day.temperatureMax + day.temperatureMin) / 2;

  if (day.precipitation > 15) score += 30;
  else if (day.precipitation > 5) score += 20;
  else if (day.precipitation > 0) score += 10;
  else score -= 5;

  // Extreme temperatures make the climate-controlled indoors more appealing.
  if (avgTemp < 0 || avgTemp > 35) score += 20;
  else if (avgTemp < 5 || avgTemp > 30) score += 10;
  else if (avgTemp >= 15 && avgTemp <= 25) score -= 10;

  if (isStormy(day.weatherCode)) score += 25;
  else if (isRainy(day.weatherCode)) score += 15;
  else if (isSnowy(day.weatherCode)) score += 10;
  else if (day.weatherCode === 0) score -= 15;

  const finalScore = clamp(score);
  const label = getLabel(finalScore);
  return { score: finalScore, label, description: INDOOR_LABELS[label] };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function calculateActivityRankings(day: DailyWeather): ActivityRankings {
  return {
    skiing: scoreSkiing(day),
    surfing: scoreSurfing(day),
    outdoorSightseeing: scoreOutdoorSightseeing(day),
    indoorSightseeing: scoreIndoorSightseeing(day),
  };
}
