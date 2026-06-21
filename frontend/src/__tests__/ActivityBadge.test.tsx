import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityBadge from '../components/ActivityBadge';
import { ActivityScore } from '../types';

const makeScore = (score: number): ActivityScore => ({
  score,
  label: score >= 90 ? 'Excellent'
    : score >= 70 ? 'Good'
    : score >= 50 ? 'Fair'
    : score >= 30 ? 'Poor'
    : 'Very Poor',
  description: `Score is ${score}`,
});

describe('ActivityBadge', () => {
  it('renders the activity name', () => {
    render(<ActivityBadge activity="skiing" score={makeScore(80)} />);
    expect(screen.getByText('Skiing')).toBeInTheDocument();
  });

  it('renders the numeric score', () => {
    render(<ActivityBadge activity="surfing" score={makeScore(72)} />);
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<ActivityBadge activity="outdoor" score={makeScore(95)} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('shows the description as a tooltip (title attribute)', () => {
    const score = makeScore(55);
    render(<ActivityBadge activity="indoor" score={score} />);
    expect(screen.getByTitle('Score is 55')).toBeInTheDocument();
  });

  it.each([
    ['skiing', '⛷️'],
    ['surfing', '🏄'],
    ['outdoor', '🌳'],
    ['indoor', '🏛️'],
  ] as const)('renders correct icon for %s', (activity, icon) => {
    render(<ActivityBadge activity={activity} score={makeScore(60)} />);
    expect(screen.getByText(icon)).toBeInTheDocument();
  });

  it.each([
    ['skiing', 'Skiing'],
    ['surfing', 'Surfing'],
    ['outdoor', 'Outdoor'],
    ['indoor', 'Indoor'],
  ] as const)('renders correct label text for %s', (activity, label) => {
    render(<ActivityBadge activity={activity} score={makeScore(60)} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders a score of 0 without crashing', () => {
    render(<ActivityBadge activity="skiing" score={makeScore(0)} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Very Poor')).toBeInTheDocument();
  });

  it('renders a score of 100 without crashing', () => {
    render(<ActivityBadge activity="outdoor" score={makeScore(100)} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });
});
