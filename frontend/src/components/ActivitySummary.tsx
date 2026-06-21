import { DailyForecast, ActivityScore } from '../types';

interface ActivitySummaryProps {
  forecast: DailyForecast[];
}

type RankingKey = 'skiing' | 'surfing' | 'outdoorSightseeing' | 'indoorSightseeing';

interface Activity {
  key: RankingKey;
  label: string;
  icon: string;
}

const ACTIVITIES: Activity[] = [
  { key: 'skiing',             label: 'Skiing',             icon: '⛷️' },
  { key: 'surfing',            label: 'Surfing',            icon: '🏄' },
  { key: 'outdoorSightseeing', label: 'Outdoor Sightseeing', icon: '🌳' },
  { key: 'indoorSightseeing',  label: 'Indoor Sightseeing',  icon: '🏛️' },
];

/** Returns the day with the highest score for a given activity. */
function bestDay(
  forecast: DailyForecast[],
  key: RankingKey
): { day: DailyForecast; score: ActivityScore } {
  return forecast.reduce(
    (best, day) => {
      const score = day.rankings[key];
      return score.score > best.score.score ? { day, score } : best;
    },
    { day: forecast[0], score: forecast[0].rankings[key] }
  );
}

function formatDay(iso: string): string {
  // See DayCard.tsx for why we append noon time before parsing.
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function scoreColor(score: number): string {
  if (score >= 90) return 'var(--score-excellent)';
  if (score >= 70) return 'var(--score-good)';
  if (score >= 50) return 'var(--score-fair)';
  if (score >= 30) return 'var(--score-poor)';
  return 'var(--score-very-poor)';
}

export default function ActivitySummary({ forecast }: ActivitySummaryProps) {
  return (
    <section className="activity-summary">
      <h3 className="section-title">Best Day This Week</h3>
      <div className="summary-grid">
        {ACTIVITIES.map(({ key, label, icon }) => {
          const { day, score } = bestDay(forecast, key);
          return (
            <div key={key} className="summary-card">
              <div className="summary-icon">{icon}</div>
              <div className="summary-label">{label}</div>
              <div className="summary-day">{formatDay(day.date)}</div>
              <div
                className="summary-score"
                style={{ color: scoreColor(score.score) }}
              >
                {score.score}
                <span className="summary-max">/100</span>
              </div>
              <div className="summary-badge">{score.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
