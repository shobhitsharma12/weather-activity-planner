import { ActivityScore } from '../types';

type ActivityKey = 'skiing' | 'surfing' | 'outdoor' | 'indoor';

interface ActivityBadgeProps {
  activity: ActivityKey;
  score: ActivityScore;
}

const ICONS: Record<ActivityKey, string> = {
  skiing: '⛷️',
  surfing: '🏄',
  outdoor: '🌳',
  indoor: '🏛️',
};

const LABELS: Record<ActivityKey, string> = {
  skiing: 'Skiing',
  surfing: 'Surfing',
  outdoor: 'Outdoor',
  indoor: 'Indoor',
};

function scoreColor(score: number): string {
  if (score >= 90) return 'var(--score-excellent)';
  if (score >= 70) return 'var(--score-good)';
  if (score >= 50) return 'var(--score-fair)';
  if (score >= 30) return 'var(--score-poor)';
  return 'var(--score-very-poor)';
}

export default function ActivityBadge({ activity, score }: ActivityBadgeProps) {
  return (
    <div
      className="activity-badge"
      style={{ borderColor: scoreColor(score.score) }}
      title={score.description}
    >
      <span className="badge-icon">{ICONS[activity]}</span>
      <span className="badge-name">{LABELS[activity]}</span>
      <span
        className="badge-score"
        style={{ color: scoreColor(score.score) }}
      >
        {score.score}
      </span>
      <span className="badge-label">{score.label}</span>
    </div>
  );
}
