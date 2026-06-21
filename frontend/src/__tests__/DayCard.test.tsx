import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DayCard from '../components/DayCard';
import { DailyForecast } from '../types';

const BASE_DAY: DailyForecast = {
  date: '2024-06-17',   // Monday, 17 Jun 2024
  weatherCode: 0,
  temperatureMax: 22,
  temperatureMin: 14,
  precipitation: 0,
  snowfall: 0,
  windspeedMax: 18,
  precipitationProbability: 5,
  rankings: {
    skiing: { score: 5, label: 'Very Poor', description: 'Too warm for skiing' },
    surfing: { score: 55, label: 'Fair', description: 'Calm waters' },
    outdoorSightseeing: { score: 92, label: 'Excellent', description: 'Perfect sunny day' },
    indoorSightseeing: { score: 20, label: 'Very Poor', description: 'Go outside instead' },
  },
};

describe('DayCard', () => {
  it('renders without crashing', () => {
    render(<DayCard day={BASE_DAY} />);
  });

  it('shows a weekday abbreviation', () => {
    render(<DayCard day={BASE_DAY} />);
    expect(screen.getByText(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/)).toBeInTheDocument();
  });

  it('shows the max temperature rounded', () => {
    render(<DayCard day={BASE_DAY} />);
    expect(screen.getByText('22°')).toBeInTheDocument();
  });

  it('shows the min temperature rounded', () => {
    render(<DayCard day={BASE_DAY} />);
    expect(screen.getByText('14°')).toBeInTheDocument();
  });

  it('shows wind speed', () => {
    render(<DayCard day={BASE_DAY} />);
    expect(screen.getByText(/18km\/h/)).toBeInTheDocument();
  });

  it('hides precipitation display when value is zero', () => {
    render(<DayCard day={BASE_DAY} />);
    expect(screen.queryByText(/mm/)).not.toBeInTheDocument();
  });

  it('shows precipitation when non-zero', () => {
    const rainy: DailyForecast = { ...BASE_DAY, precipitation: 5.2 };
    render(<DayCard day={rainy} />);
    expect(screen.getByText(/5\.2mm/)).toBeInTheDocument();
  });

  it('hides snowfall display when value is zero', () => {
    render(<DayCard day={BASE_DAY} />);
    expect(screen.queryByText(/cm/)).not.toBeInTheDocument();
  });

  it('shows snowfall when non-zero', () => {
    const snowy: DailyForecast = { ...BASE_DAY, snowfall: 12.0 };
    render(<DayCard day={snowy} />);
    expect(screen.getByText(/12\.0cm/)).toBeInTheDocument();
  });

  it('renders all four activity labels', () => {
    render(<DayCard day={BASE_DAY} />);
    expect(screen.getByText('Skiing')).toBeInTheDocument();
    expect(screen.getByText('Surfing')).toBeInTheDocument();
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
    expect(screen.getByText('Indoor')).toBeInTheDocument();
  });

  it('renders correct activity scores', () => {
    render(<DayCard day={BASE_DAY} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('shows the clear sky icon for weatherCode 0', () => {
    render(<DayCard day={BASE_DAY} />);
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('shows the thunderstorm icon for weatherCode 95', () => {
    const stormy: DailyForecast = { ...BASE_DAY, weatherCode: 95 };
    render(<DayCard day={stormy} />);
    expect(screen.getByText('⛈️')).toBeInTheDocument();
  });

  it('rounds fractional temperatures', () => {
    const day: DailyForecast = {
      ...BASE_DAY,
      temperatureMax: 22.7,
      temperatureMin: 14.3,
    };
    render(<DayCard day={day} />);
    expect(screen.getByText('23°')).toBeInTheDocument();
    expect(screen.getByText('14°')).toBeInTheDocument();
  });
});
