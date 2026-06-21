import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivitySummary from '../components/ActivitySummary';
import { DailyForecast } from '../types';

function makeDay(
  date: string,
  skiing: number,
  surfing: number,
  outdoor: number,
  indoor: number
): DailyForecast {
  const label = (s: number) =>
    s >= 90 ? 'Excellent' : s >= 70 ? 'Good' : s >= 50 ? 'Fair' : s >= 30 ? 'Poor' : 'Very Poor';

  return {
    date,
    weatherCode: 0,
    temperatureMax: 20,
    temperatureMin: 10,
    precipitation: 0,
    snowfall: 0,
    windspeedMax: 15,
    precipitationProbability: 10,
    rankings: {
      skiing: { score: skiing, label: label(skiing), description: '' },
      surfing: { score: surfing, label: label(surfing), description: '' },
      outdoorSightseeing: { score: outdoor, label: label(outdoor), description: '' },
      indoorSightseeing: { score: indoor, label: label(indoor), description: '' },
    },
  };
}

// Each activity peaks on a different day to make assertions unambiguous.
const FORECAST: DailyForecast[] = [
  makeDay('2024-06-17', 90, 10, 40, 20), // best skiing day  (Mon)
  makeDay('2024-06-18', 10, 85, 30, 15), // best surfing day (Tue)
  makeDay('2024-06-19', 5,  20, 95, 10), // best outdoor day (Wed)
  makeDay('2024-06-20', 0,  5,  10, 100),// best indoor day  (Thu)
  makeDay('2024-06-21', 20, 30, 50, 40),
  makeDay('2024-06-22', 30, 25, 55, 35),
  makeDay('2024-06-23', 15, 40, 60, 45),
];

describe('ActivitySummary', () => {
  it('renders the section title', () => {
    render(<ActivitySummary forecast={FORECAST} />);
    expect(screen.getByText('Best Day This Week')).toBeInTheDocument();
  });

  it('renders all four activity cards', () => {
    render(<ActivitySummary forecast={FORECAST} />);
    expect(screen.getByText('Skiing')).toBeInTheDocument();
    expect(screen.getByText('Surfing')).toBeInTheDocument();
    expect(screen.getByText('Outdoor Sightseeing')).toBeInTheDocument();
    expect(screen.getByText('Indoor Sightseeing')).toBeInTheDocument();
  });

  it('renders all four activity icons', () => {
    render(<ActivitySummary forecast={FORECAST} />);
    expect(screen.getByText('⛷️')).toBeInTheDocument();
    expect(screen.getByText('🏄')).toBeInTheDocument();
    expect(screen.getByText('🌳')).toBeInTheDocument();
    expect(screen.getByText('🏛️')).toBeInTheDocument();
  });

  it('shows the best skiing score (90)', () => {
    render(<ActivitySummary forecast={FORECAST} />);
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('shows the best surfing score (85)', () => {
    render(<ActivitySummary forecast={FORECAST} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('shows the best outdoor sightseeing score (95)', () => {
    render(<ActivitySummary forecast={FORECAST} />);
    expect(screen.getByText('95')).toBeInTheDocument();
  });

  it('shows the best indoor sightseeing score (100)', () => {
    render(<ActivitySummary forecast={FORECAST} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows the correct best-day text for the top skiing day (Monday)', () => {
    render(<ActivitySummary forecast={FORECAST} />);
    // June 17 2024 is a Monday
    expect(screen.getByText(/Monday/i)).toBeInTheDocument();
  });

  it('shows at least one "Excellent" label when a score reaches 100', () => {
    render(<ActivitySummary forecast={FORECAST} />);
    const labels = screen.getAllByText('Excellent');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('works correctly with a single-day forecast', () => {
    const singleDay = [makeDay('2024-06-17', 50, 60, 70, 80)];
    render(<ActivitySummary forecast={singleDay} />);
    expect(screen.getByText('80')).toBeInTheDocument(); // indoor best
    expect(screen.getByText('70')).toBeInTheDocument(); // outdoor best
  });
});
